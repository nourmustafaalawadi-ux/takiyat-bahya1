<?php

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';

try {
    $sql = "SELECT id, name, description FROM areas ORDER BY id ASC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $areas = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'data' => $areas
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    error_log('[API Error: areas.php] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'حدث خطأ أثناء جلب المناطق.'
    ], JSON_UNESCAPED_UNICODE);
}
