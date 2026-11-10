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
    $stmt = $pdo->prepare("
        UPDATE kitchens
        SET is_archived = 0
        WHERE id = :id AND is_archived = 1
    ");

    $stmt->execute(['id' => $kitchenId]);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'التكية غير موجودة أو غير مؤرشفة.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    echo json_encode([
        'success' => true,
        'message' => 'تمت استعادة التكية بنجاح.'
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    error_log('[API Error: restore-kitchen.php] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'حدث خطأ أثناء استعادة التكية.'
    ], JSON_UNESCAPED_UNICODE);
}
