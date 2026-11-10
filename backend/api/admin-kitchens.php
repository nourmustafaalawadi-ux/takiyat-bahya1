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

try {
    $sql = "
        SELECT
            k.id,
            k.area_id,
            k.name,
            k.description,
            k.address,
            k.latitude,
            k.longitude,
            k.phone,
            k.status,
            k.verification_status,
            k.is_active,
            k.is_archived,
            a.name AS area_name
        FROM kitchens k
        INNER JOIN areas a ON k.area_id = a.id
        ORDER BY k.id DESC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $kitchens = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'data' => $kitchens
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    error_log('[API Error: admin-kitchens.php] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'حدث خطأ أثناء جلب بيانات التكيات للإدارة.'
    ], JSON_UNESCAPED_UNICODE);
}
