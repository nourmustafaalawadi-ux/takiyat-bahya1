
<?php

header('Access-Control-Allow-Origin: http://localhost:5173');
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/db.php';

try {

    $sql = "
        SELECT
            k.id,
            k.name,
            k.description,
            k.address,
            k.latitude,
            k.longitude,
            k.phone,
            k.status,
            a.name AS area_name

        FROM kitchens k

        INNER JOIN areas a ON k.area_id = a.id

        WHERE
            k.is_active = 1
            AND k.verification_status = 'verified'
            AND k.is_archived = 0
        ORDER BY a.id ASC, k.name ASC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute();

    $kitchens = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'data' => $kitchens
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {

    error_log($e->getMessage());

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'حدث خطأ أثناء جلب بيانات التكيات.'
    ], JSON_UNESCAPED_UNICODE);
}
