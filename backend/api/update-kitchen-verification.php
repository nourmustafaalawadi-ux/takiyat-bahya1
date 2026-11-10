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

try {
    $input = json_decode(file_get_contents('php://input'), true);

    $kitchenId = filter_var($input['kitchen_id'] ?? null, FILTER_VALIDATE_INT);
    $verificationStatus = $input['verification_status'] ?? '';

    if (!$kitchenId || $kitchenId < 1) {
        http_response_code(422);
        echo json_encode([
            'success' => false,
            'message' => 'رقم التكية غير صحيح.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if (!in_array($verificationStatus, ['verified', 'rejected'], true)) {
        http_response_code(422);
        echo json_encode([
            'success' => false,
            'message' => 'حالة التوثيق غير صحيحة.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $stmt = $pdo->prepare("
        UPDATE kitchens
        SET verification_status = ?
        WHERE id = ?
    ");

    $stmt->execute([$verificationStatus, $kitchenId]);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => 'التكية غير موجودة أو لم يطرأ تغيير على حالتها.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    echo json_encode([
        'success' => true,
        'message' => $verificationStatus === 'verified'
            ? 'تم اعتماد التكية بنجاح.'
            : 'تم رفض اعتماد التكية.'
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    error_log('[API Error: update-kitchen-verification.php] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'حدث خطأ أثناء تحديث حالة التكية.'
    ], JSON_UNESCAPED_UNICODE);
}
