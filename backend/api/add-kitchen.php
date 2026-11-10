<?php

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'طريقة الطلب غير مسموح بها.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

requireAdmin($pdo);

$data = json_decode(file_get_contents('php://input'), true);

$name = trim($data['name'] ?? '');
$areaId = filter_var($data['area_id'] ?? null, FILTER_VALIDATE_INT);
$address = trim($data['address'] ?? '');
$phone = trim($data['phone'] ?? '');
$description = trim($data['description'] ?? '');
$status = $data['status'] ?? 'unknown';

// معالجة الإحداثيات الجغرافية
$latitude = isset($data['latitude']) && $data['latitude'] !== '' && $data['latitude'] !== null
    ? filter_var($data['latitude'], FILTER_VALIDATE_FLOAT, FILTER_NULL_ON_FAILURE)
    : null;

$longitude = isset($data['longitude']) && $data['longitude'] !== '' && $data['longitude'] !== null
    ? filter_var($data['longitude'], FILTER_VALIDATE_FLOAT, FILTER_NULL_ON_FAILURE)
    : null;

$allowedStatuses = ['open', 'closed', 'paused', 'unknown'];

if ($name === '' || !$areaId) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'يرجى إدخال اسم التكية وتحديد المنطقة.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!in_array($status, $allowedStatuses, true)) {
    $status = 'unknown';
}

if (strlen($name) > 150 || strlen($address) > 255 || strlen($phone) > 30 || mb_strlen($description, 'UTF-8') > 2000) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'بعض البيانات أطول من الحد المسموح به.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $areaCheck = $pdo->prepare("SELECT id FROM areas WHERE id = :id LIMIT 1");
    $areaCheck->execute(['id' => $areaId]);

    if (!$areaCheck->fetch()) {
        http_response_code(422);
        echo json_encode([
            'success' => false,
            'message' => 'المنطقة المحددة غير موجودة في النظام.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $stmt = $pdo->prepare("
        INSERT INTO kitchens (
            area_id, name, description, address, 
            latitude, longitude, phone, status, 
            verification_status, is_active, is_archived
        ) VALUES (
            :area_id, :name, :description, :address, 
            :latitude, :longitude, :phone, :status, 
            'verified', 1, 0
        )
    ");

    $stmt->execute([
        'area_id' => $areaId,
        'name' => $name,
        'description' => $description !== '' ? $description : null,
        'address' => $address,
        'latitude' => $latitude,
        'longitude' => $longitude,
        'phone' => $phone !== '' ? $phone : null,
        'status' => $status
    ]);

    $newId = (int) $pdo->lastInsertId();

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'تمت إضافة التكية بنجاح.',
        'kitchen_id' => $newId
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    error_log('[API Error: add-kitchen.php] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'حدث خطأ أثناء حفظ التكية الجديدة.'
    ], JSON_UNESCAPED_UNICODE);
}
