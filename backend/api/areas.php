
<?php

header('Access-Control-Allow-Origin: http://localhost:5173');
header('Content-Type: application/json; charset=utf-8');

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

} catch (PDOException $e) {

    error_log($e->getMessage());

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'حدث خطأ أثناء جلب المناطق.'
    ], JSON_UNESCAPED_UNICODE);
}
