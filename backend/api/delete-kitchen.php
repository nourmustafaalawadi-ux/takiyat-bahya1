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

if (!$kitchenId || $kitchenId < 1) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'رقم التكية غير صحيح.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $check = $pdo->prepare("SELECT id FROM kitchens WHERE id = :id LIMIT 1");
    $check->execute(['id' => $kitchenId]);

    if (!$check->fetch()) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'التكية غير موجودة.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $delete = $pdo->prepare("DELETE FROM kitchens WHERE id = :id");
    $delete->execute(['id' => $kitchenId]);

    echo json_encode([
        'success' => true,
        'message' => 'تم حذف التكية نهائيًا بنجاح.'
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    error_log('[API Error: delete-kitchen.php] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'تعذر حذف التكية لوجود بيانات مرتبطة بها في النظام. يُنصح بنقلها إلى الأرشيف بدلاً من الحذف.'
    ], JSON_UNESCAPED_UNICODE);
}
