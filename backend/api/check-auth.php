<?php

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/auth.php';

if (
    empty($_SESSION['user_id']) ||
    ($_SESSION['role'] ?? '') !== 'admin'
) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'authenticated' => false,
        'message' => 'يرجى تسجيل الدخول أولًا.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id, full_name, username, role, is_active FROM users WHERE id = ? LIMIT 1");
    $stmt->execute([(int)$_SESSION['user_id']]);
    $user = $stmt->fetch();

    if (!$user || (int)$user['is_active'] !== 1 || $user['role'] !== 'admin') {
        $_SESSION = [];
        if (session_status() === PHP_SESSION_ACTIVE) {
            session_destroy();
        }
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'authenticated' => false,
            'message' => 'تم إلغاء تنشيط الحساب أو تغيير الصلاحية.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    echo json_encode([
        'success' => true,
        'authenticated' => true,
        'csrf_token' => getCsrfToken(),
        'user' => [
            'id' => (int) $user['id'],
            'full_name' => $user['full_name'],
            'username' => $user['username'],
            'role' => $user['role']
        ]
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    error_log('[API Error: check-auth.php] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'authenticated' => false,
        'message' => 'حدث خطأ أثناء التحقق من الجلسة.'
    ], JSON_UNESCAPED_UNICODE);
}
