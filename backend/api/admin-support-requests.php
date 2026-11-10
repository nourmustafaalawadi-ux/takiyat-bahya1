<?php

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'طريقة الطلب غير مسموح بها.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

requireAdmin($pdo);

$isArchived = isset($_GET['archived']) && $_GET['archived'] === '1' ? 1 : 0;
$statusFilter = $_GET['status'] ?? null;

try {
    $sql = "
        SELECT 
            sr.id,
            sr.kitchen_id,
            sr.kitchen_name,
            sr.contact_person,
            sr.phone,
            sr.area_id,
            a.name AS area_name,
            sr.address,
            sr.support_type,
            sr.urgency_level,
            sr.target_beneficiaries_count,
            sr.description,
            sr.status,
            sr.admin_notes,
            sr.is_archived,
            sr.created_at,
            sr.updated_at
        FROM support_requests sr
        INNER JOIN areas a ON sr.area_id = a.id
        WHERE sr.is_archived = :is_archived
    ";

    $params = ['is_archived' => $isArchived];

    if ($statusFilter && in_array($statusFilter, ['pending', 'under_review', 'fulfilled', 'rejected'], true)) {
        $sql .= " AND sr.status = :status";
        $params['status'] = $statusFilter;
    }

    $sql .= " ORDER BY FIELD(sr.urgency_level, 'critical', 'urgent', 'normal'), sr.id DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $requests = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'data' => $requests
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    error_log('[API Error: admin-support-requests.php] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'حدث خطأ أثناء تحميل طلبات الدعم.'
    ], JSON_UNESCAPED_UNICODE);
}
