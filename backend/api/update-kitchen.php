
<?php

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/auth.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'طريقة الطلب غير مسموحة.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// التحقق من صلاحيات المسؤول
requireAdmin();

// قراءة البيانات
$data = json_decode(file_get_contents('php://input'), true);

$kitchenId = filter_var(
    $data['kitchen_id'] ?? null,
    FILTER_VALIDATE_INT
);

$name = trim($data['name'] ?? '');
$areaId = filter_var(
    $data['area_id'] ?? null,
    FILTER_VALIDATE_INT
);
$address = trim($data['address'] ?? '');
$phone = trim($data['phone'] ?? '');
$description = trim($data['description'] ?? '');
$status = $data['status'] ?? '';

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

if (strlen($name) > 255 || strlen($address) > 255 || strlen($phone) > 30) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'بعض البيانات أطول من الحد المسموح.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // التأكد من وجود المنطقة
    $areaCheck = $pdo->prepare(
        "SELECT id FROM areas WHERE id = :id LIMIT 1"
    );

    $areaCheck->execute(['id' => $areaId]);

    if (!$areaCheck->fetch(PDO::FETCH_ASSOC)) {
        http_response_code(422);
        echo json_encode([
            'success' => false,
            'message' => 'المنطقة المحددة غير موجودة.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // التأكد من وجود التكية
    $kitchenCheck = $pdo->prepare(
        "SELECT id FROM kitchens WHERE id = :id LIMIT 1"
    );

    $kitchenCheck->execute(['id' => $kitchenId]);

    if (!$kitchenCheck->fetch(PDO::FETCH_ASSOC)) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'التكية غير موجودة.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // تحديث البيانات دون تغيير حالة التوثيق
    $update = $pdo->prepare(
        "UPDATE kitchens
         SET name = :name,
             area_id = :area_id,
             address = :address,
             phone = :phone,
             description = :description,
             status = :status
         WHERE id = :id"
    );

    $update->execute([
        'name' => $name,
        'area_id' => $areaId,
        'address' => $address,
        'phone' => $phone,
        'description' => $description,
        'status' => $status,
        'id' => $kitchenId
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'تم تحديث بيانات التكية بنجاح.'
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'حدث خطأ أثناء تحديث بيانات التكية.'
    ], JSON_UNESCAPED_UNICODE);
}

