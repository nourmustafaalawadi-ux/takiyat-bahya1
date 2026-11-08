<?php

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/auth.php';

// التأكد من صلاحية مسؤول الإدارة
requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);

    echo json_encode([
        'success' => false,
        'message' => 'طريقة الطلب غير مسموحة.'
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

// قراءة البيانات المرسلة
$data = json_decode(file_get_contents('php://input'), true);

$kitchenId = filter_var(
    $data['kitchen_id'] ?? null,
    FILTER_VALIDATE_INT
);

if (!$kitchenId || $kitchenId < 1) {
    http_response_code(422);

    echo json_encode([
        'success' => false,
        'message' => 'رقم التكية غير صحيح.'
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

try {
    // التأكد من وجود التكية
    $check = $pdo->prepare(
        "SELECT id FROM kitchens WHERE id = :id LIMIT 1"
    );

    $check->execute(['id' => $kitchenId]);

    if (!$check->fetch()) {
        http_response_code(404);

        echo json_encode([
            'success' => false,
            'message' => 'التكية غير موجودة.'
        ], JSON_UNESCAPED_UNICODE);

        exit;
    }

    // حذف التكية
    $delete = $pdo->prepare(
        "DELETE FROM kitchens WHERE id = :id"
    );

    $delete->execute(['id' => $kitchenId]);

    echo json_encode([
        'success' => true,
        'message' => 'تم حذف التكية بنجاح.'
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'تعذر حذف التكية. قد تكون مرتبطة ببيانات أخرى في النظام.'
    ], JSON_UNESCAPED_UNICODE);
}
