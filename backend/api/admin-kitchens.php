
<?php

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'طريقة الطلب غير مسموح بها.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

require_once __DIR__ . '/../config/auth.php';
require_once __DIR__ . '/../config/db.php';

// لا يسمح إلا للمسؤول المسجل بالدخول
requireAdmin();

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

} catch (PDOException $e) {

    error_log($e->getMessage());

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'حدث خطأ أثناء جلب بيانات التكيات.'
    ], JSON_UNESCAPED_UNICODE);
}
