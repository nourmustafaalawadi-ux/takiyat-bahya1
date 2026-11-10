<?php

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'طريقة الطلب غير مسموح بها.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$kitchenName = trim($data['kitchen_name'] ?? '');
$contactPerson = trim($data['contact_person'] ?? '');
$phone = trim($data['phone'] ?? '');
$areaId = filter_var($data['area_id'] ?? null, FILTER_VALIDATE_INT);
$address = trim($data['address'] ?? '');
$supportType = $data['support_type'] ?? 'food_supplies';
$urgencyLevel = $data['urgency_level'] ?? 'urgent';
$description = trim($data['description'] ?? '');
$beneficiaries = isset($data['target_beneficiaries_count']) && $data['target_beneficiaries_count'] !== ''
    ? filter_var($data['target_beneficiaries_count'], FILTER_VALIDATE_INT, FILTER_NULL_ON_FAILURE)
    : null;
$kitchenId = isset($data['kitchen_id']) && $data['kitchen_id'] !== ''
    ? filter_var($data['kitchen_id'], FILTER_VALIDATE_INT, FILTER_NULL_ON_FAILURE)
    : null;

$validTypes = ['food_supplies', 'gas_fuel', 'equipment', 'water', 'financial', 'other'];
$validUrgency = ['normal', 'urgent', 'critical'];

if ($kitchenName === '' || $contactPerson === '' || $phone === '' || !$areaId || $description === '') {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'يرجى تعبئة كافة الحقول الأساسية: اسم التكية، مسؤول التواصل، الهاتف، المنطقة، ووصف الاحتياج.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!in_array($supportType, $validTypes, true)) {
    $supportType = 'other';
}

if (!in_array($urgencyLevel, $validUrgency, true)) {
    $urgencyLevel = 'urgent';
}

if (strlen($kitchenName) > 150 || strlen($contactPerson) > 150 || strlen($phone) > 30 || strlen($address) > 255 || mb_strlen($description, 'UTF-8') > 3000) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'بعض البيانات المدخلة أطول من الحد المسموح به.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // التحقق من صحة المنطقة
    $areaCheck = $pdo->prepare("SELECT id FROM areas WHERE id = :id LIMIT 1");
    $areaCheck->execute(['id' => $areaId]);
    if (!$areaCheck->fetch()) {
        http_response_code(422);
        echo json_encode([
            'success' => false,
            'message' => 'المنطقة المحددة غير صالحة.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // التحقق من التكية إن حُددت
    if ($kitchenId !== null) {
        $kCheck = $pdo->prepare("SELECT id FROM kitchens WHERE id = :id LIMIT 1");
        $kCheck->execute(['id' => $kitchenId]);
        if (!$kCheck->fetch()) {
            $kitchenId = null;
        }
    }

    $stmt = $pdo->prepare("
        INSERT INTO support_requests (
            kitchen_id, kitchen_name, contact_person, phone, 
            area_id, address, support_type, urgency_level, 
            target_beneficiaries_count, description, status, is_archived
        ) VALUES (
            :kitchen_id, :kitchen_name, :contact_person, :phone, 
            :area_id, :address, :support_type, :urgency_level, 
            :target_beneficiaries_count, :description, 'pending', 0
        )
    ");

    $stmt->execute([
        'kitchen_id' => $kitchenId,
        'kitchen_name' => $kitchenName,
        'contact_person' => $contactPerson,
        'phone' => $phone,
        'area_id' => $areaId,
        'address' => $address,
        'support_type' => $supportType,
        'urgency_level' => $urgencyLevel,
        'target_beneficiaries_count' => $beneficiaries,
        'description' => $description
    ]);

    $newId = (int) $pdo->lastInsertId();

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'تم استلام طلب الدعم بنجاح، وستتم مراجعته والتواصل معكم للمساندة بأقرب وقت.',
        'request_id' => $newId
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    error_log('[API Error: submit-support-request.php] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'حدث خطأ أثناء إرسال طلب الدعم. يرجى المحاولة لاحقًا.'
    ], JSON_UNESCAPED_UNICODE);
}
