<?php

// إعدادات الجلسة الآمنة
if (session_status() === PHP_SESSION_NONE) {
    ini_set('session.use_strict_mode', '1');
    ini_set('session.cookie_httponly', '1');
    ini_set('session.cookie_samesite', 'Lax');

    // دعم Secure مع HTTPS والخوادم الوسيطة (Reverse Proxies)
    $isSecure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https')
        || (($_SERVER['SERVER_PORT'] ?? 80) == 443);

    if ($isSecure) {
        ini_set('session.cookie_secure', '1');
    }

    session_start();
}

// مهلة عدم النشاط للجلسة (ساعة واحدة)
$maxIdleTime = 3600;
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > $maxIdleTime)) {
    $_SESSION = [];
    if (session_status() === PHP_SESSION_ACTIVE) {
        session_destroy();
    }
}
if (!empty($_SESSION['user_id'])) {
    $_SESSION['last_activity'] = time();
}

/**
 * التحقق من صلاحية المسؤول مع مخرجات JSON وفحص نشاط الحساب في قاعدة البيانات
 */
function requireAdmin(?PDO $pdo = null): void
{
    if (
        empty($_SESSION['user_id']) ||
        ($_SESSION['role'] ?? '') !== 'admin'
    ) {
        if (!headers_sent()) {
            header('Content-Type: application/json; charset=utf-8');
            http_response_code(401);
        }
        echo json_encode([
            'success' => false,
            'authenticated' => false,
            'message' => 'غير مصرح لك بالوصول. يرجى تسجيل الدخول أولًا.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // إذا تم تمرير اتصال قاعدة البيانات، نتحقق من استمرار نشاط الحساب
    if ($pdo !== null) {
        try {
            $stmt = $pdo->prepare("SELECT is_active, role FROM users WHERE id = ? LIMIT 1");
            $stmt->execute([(int)$_SESSION['user_id']]);
            $user = $stmt->fetch();

            if (!$user || (int)$user['is_active'] !== 1 || $user['role'] !== 'admin') {
                $_SESSION = [];
                if (session_status() === PHP_SESSION_ACTIVE) {
                    session_destroy();
                }
                if (!headers_sent()) {
                    header('Content-Type: application/json; charset=utf-8');
                    http_response_code(403);
                }
                echo json_encode([
                    'success' => false,
                    'authenticated' => false,
                    'message' => 'تم إلغاء تنشيط هذا الحساب أو تعديل صلاحياته.'
                ], JSON_UNESCAPED_UNICODE);
                exit;
            }
        } catch (Throwable $e) {
            error_log('[Auth Check Error] ' . $e->getMessage());
        }
    }
}

/**
 * الحصول على رمز مكافحة التزوير CSRF أو توليده
 */
function getCsrfToken(): string
{
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

/**
 * التحقق من صحة رمز CSRF للعمليات الإدارية الحساسة
 */
function verifyCsrfToken(?string $token = null): void
{
    if ($token === null) {
        $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? null;
    }

    $sessionToken = $_SESSION['csrf_token'] ?? '';

    if (!$token || !$sessionToken || !hash_equals($sessionToken, $token)) {
        if (!headers_sent()) {
            header('Content-Type: application/json; charset=utf-8');
            http_response_code(403);
        }
        echo json_encode([
            'success' => false,
            'message' => 'فشل التحقق الأمني من الرمز (CSRF Token Invalid). يرجى إعادة تحميل الصفحة.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

/**
 * فحص معدل محاولات تسجيل الدخول للحماية من التخمين (Rate Limiting)
 */
function checkLoginRateLimit(PDO $pdo, string $ip, string $username): void
{
    try {
        $stmt = $pdo->prepare("
            SELECT COUNT(*) FROM login_attempts 
            WHERE (ip_address = ? OR username = ?) 
              AND attempt_time > DATE_SUB(NOW(), INTERVAL 15 MINUTE) 
              AND success = 0
        ");
        $stmt->execute([$ip, $username]);
        $attempts = (int) $stmt->fetchColumn();

        if ($attempts >= 5) {
            if (!headers_sent()) {
                header('Content-Type: application/json; charset=utf-8');
                http_response_code(429);
            }
            echo json_encode([
                'success' => false,
                'message' => 'تم تجاوز الحد المسموح من محاولات الدخول الخاطئة (5 محاولات). يرجى الانتظار 15 دقيقة.'
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    } catch (Throwable $e) {
        error_log('[RateLimit Error] ' . $e->getMessage());
    }
}

/**
 * تسجيل نتيجة محاولة تسجيل الدخول
 */
function recordLoginAttempt(PDO $pdo, string $ip, string $username, bool $success): void
{
    try {
        $stmt = $pdo->prepare("
            INSERT INTO login_attempts (ip_address, username, success) 
            VALUES (?, ?, ?)
        ");
        $stmt->execute([$ip, $username, $success ? 1 : 0]);
    } catch (Throwable $e) {
        error_log('[Record Attempt Error] ' . $e->getMessage());
    }
}
