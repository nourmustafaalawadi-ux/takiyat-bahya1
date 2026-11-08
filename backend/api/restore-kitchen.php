
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

// التأكد من أن المستخدم مسؤول الإدارة
requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);

    echo json_encode([
        'success' => false,
        'message' => 'طريقة الطلب غير مسموحة.'
    ], JSON_UNESCAPED_UNICODE);

    exit;
}

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
    $stmt = $pdo->prepare(
        "UPDATE kitchens
         SET is_archived = 0
         WHERE id = :id AND is_archived = 1"
    );

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

} catch (PDOException $e) {
    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'حدث خطأ أثناء استعادة التكية.'
    ], JSON_UNESCAPED_UNICODE);
}
