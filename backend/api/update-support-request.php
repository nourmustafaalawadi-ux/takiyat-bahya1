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

$requestId = filter_var($data['request_id'] ?? null, FILTER_VALIDATE_INT);
$status = $data['status'] ?? null;
$adminNotes = isset($data['admin_notes']) ? trim($data['admin_notes']) : null;
$archiveAction = $data['archive_action'] ?? null;

if (!$requestId || $requestId < 1) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'رقم طلب الدعم غير صحيح.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    if ($archiveAction === 'archive') {
        $stmt = $pdo->prepare("UPDATE support_requests SET is_archived = 1 WHERE id = :id");
        $stmt->execute(['id' => $requestId]);
        echo json_encode([
            'success' => true,
            'message' => 'تم نقل طلب الدعم إلى الأرشيف بنجاح.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($archiveAction === 'restore') {
        $stmt = $pdo->prepare("UPDATE support_requests SET is_archived = 0 WHERE id = :id");
        $stmt->execute(['id' => $requestId]);
        echo json_encode([
            'success' => true,
            'message' => 'تمت استعادة طلب الدعم من الأرشيف بنجاح.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $validStatuses = ['pending', 'under_review', 'fulfilled', 'rejected'];
    if (!$status || !in_array($status, $validStatuses, true)) {
        http_response_code(422);
        echo json_encode([
            'success' => false,
            'message' => 'حالة الطلب غير صالحة.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $stmt = $pdo->prepare("
        UPDATE support_requests 
        SET status = :status, 
            admin_notes = COALESCE(:notes, admin_notes)
        WHERE id = :id
    ");

    $stmt->execute([
        'status' => $status,
        'notes' => $adminNotes,
        'id' => $requestId
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'تم تحديث حالة طلب الدعم بنجاح.'
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    error_log('[API Error: update-support-request.php] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'حدث خطأ أثناء تحديث طلب الدعم.'
    ], JSON_UNESCAPED_UNICODE);
}
