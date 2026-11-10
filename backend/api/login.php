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

try {
    $input = json_decode(file_get_contents('php://input'), true);

    $username = trim($input['username'] ?? '');
    $password = $input['password'] ?? '';
    $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';

    if ($username === '' || $password === '') {
        http_response_code(422);
        echo json_encode([
            'success' => false,
            'message' => 'يرجى إدخال اسم المستخدم وكلمة المرور.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // الحماية من هجمات حجب الخدمة عبر مدخلات ضخمة
    if (strlen($username) > 100 || strlen($password) > 128) {
        http_response_code(422);
        echo json_encode([
            'success' => false,
            'message' => 'البيانات المدخلة تتجاوز الحد الأقصى المسموح.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // فحص محاولات التخمين الفاشلة (Rate Limiting)
    checkLoginRateLimit($pdo, $ip, $username);

    $stmt = $pdo->prepare("
        SELECT id, full_name, username, password, role, is_active
        FROM users
        WHERE username = ?
        LIMIT 1
    ");

    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if (
        !$user ||
        (int)$user['is_active'] !== 1 ||
        $user['role'] !== 'admin' ||
        !password_verify($password, $user['password'])
    ) {
        recordLoginAttempt($pdo, $ip, $username, false);
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'اسم المستخدم أو كلمة المرور غير صحيحة.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // تسجيل نجاح المحاولة
    recordLoginAttempt($pdo, $ip, $username, true);

    // تجديد معرف الجلسة للأمان
    session_regenerate_id(true);

    $_SESSION['user_id'] = (int) $user['id'];
    $_SESSION['full_name'] = $user['full_name'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['role'] = $user['role'];
    $_SESSION['last_activity'] = time();

    // توليد رمز CSRF
    $csrfToken = getCsrfToken();

    echo json_encode([
        'success' => true,
        'message' => 'تم تسجيل الدخول بنجاح.',
        'csrf_token' => $csrfToken,
        'user' => [
            'id' => (int) $user['id'],
            'full_name' => $user['full_name'],
            'username' => $user['username'],
            'role' => $user['role']
        ]
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    error_log('[API Error: login.php] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'حدث خطأ أثناء تسجيل الدخول.'
    ], JSON_UNESCAPED_UNICODE);
}
