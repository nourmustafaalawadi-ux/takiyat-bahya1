
<?php

// إعدادات الجلسة قبل تشغيلها
if (session_status() === PHP_SESSION_NONE) {

    ini_set('session.use_strict_mode', '1');
    ini_set('session.cookie_httponly', '1');
    ini_set('session.cookie_samesite', 'Strict');

    // تفعيل Secure تلقائيًا عند استخدام HTTPS
    if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
        ini_set('session.cookie_secure', '1');
    }

    session_start();
}

/**
 * التحقق من أن المستخدم مسؤول مسجل الدخول
 */
function requireAdmin(): void
{
    if (
        empty($_SESSION['user_id']) ||
        ($_SESSION['role'] ?? '') !== 'admin'
    ) {
        http_response_code(401);
        exit('غير مصرح لك بالوصول. يرجى تسجيل الدخول أولًا.');
    }
}
