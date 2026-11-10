<?php

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'طريقة الطلب غير مسموحة.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

requireAdmin($pdo);

$data = json_decode(file_get_contents('php://input'), true);

$kitchenId = filter_var($data['kitchen_id'] ?? null, FILTER_VALIDATE_INT);
$name = trim($data['name'] ?? '');
$areaId = filter_var($data['area_id'] ?? null, FILTER_VALIDATE_INT);
$address = trim($data['address'] ?? '');
$phone = trim($data['phone'] ?? '');
$description = trim($data['description'] ?? '');
$status = $data['status'] ?? 'unknown';

$latitude = isset($data['latitude']) && $data['latitude'] !== '' && $data['latitude'] !== null
    ? filter_var($data['latitude'], FILTER_VALIDATE_FLOAT, FILTER_NULL_ON_FAILURE)
    : null;

$longitude = isset($data['longitude']) && $data['longitude'] !== '' && $data['longitude'] !== null
    ? filter_var($data['longitude'], FILTER_VALIDATE_FLOAT, FILTER_NULL_ON_FAILURE)
    : null;

$allowedStatuses = ['open', 'closed', 'paused', 'unknown'];

if (!$kitchenId || !$areaId || $name === '') {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'يرجى إدخال اسم التكية والمنطقة بشكل صحيح.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!in_array($status, $allowedStatuses, true)) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'حالة التشغيل غير صحيحة.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
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
            'message' => 'المنطقة المحددة غير موجودة.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $kitchenCheck = $pdo->prepare("SELECT id FROM kitchens WHERE id = :id LIMIT 1");
    $kitchenCheck->execute(['id' => $kitchenId]);

    if (!$kitchenCheck->fetch()) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'التكية غير موجودة.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $update = $pdo->prepare("
        UPDATE kitchens
        SET name = :name,
            area_id = :area_id,
            address = :address,
            phone = :phone,
            description = :description,
            latitude = :latitude,
            longitude = :longitude,
            status = :status
        WHERE id = :id
    ");

    $update->execute([
        'name' => $name,
        'area_id' => $areaId,
        'address' => $address,
        'phone' => $phone !== '' ? $phone : null,
        'description' => $description !== '' ? $description : null,
        'latitude' => $latitude,
        'longitude' => $longitude,
        'status' => $status,
        'id' => $kitchenId
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'تم تحديث بيانات التكية بنجاح.'
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    error_log('[API Error: update-kitchen.php] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'حدث خطأ أثناء تحديث بيانات التكية.'
    ], JSON_UNESCAPED_UNICODE);
}
