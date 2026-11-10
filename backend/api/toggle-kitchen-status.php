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
$isActive = $data['is_active'] ?? null;

if (!$kitchenId || !in_array($isActive, [0, 1, '0', '1'], true)) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'البيانات المرسلة غير صحيحة.'
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

    $update = $pdo->prepare("
        UPDATE kitchens
        SET is_active = :is_active
        WHERE id = :id
    ");

    $update->execute([
        'is_active' => (int) $isActive,
        'id' => $kitchenId
    ]);

    echo json_encode([
        'success' => true,
        'message' => ((int) $isActive === 1)
            ? 'تم تفعيل التكية بنجاح.'
            : 'تم إيقاف التكية مؤقتًا بنجاح.'
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    error_log('[API Error: toggle-kitchen-status.php] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'حدث خطأ أثناء تحديث حالة التكية.'
    ], JSON_UNESCAPED_UNICODE);
}
