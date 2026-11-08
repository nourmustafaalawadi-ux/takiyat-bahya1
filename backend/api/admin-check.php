
<?php

require_once __DIR__ . '/../config/auth.php';

// التحقق من تسجيل دخول المسؤول
requireAdmin();

// إذا وصل التنفيذ إلى هنا فالمسؤول مصرح له
function adminCheck(): void
{
    header('Content-Type: application/json; charset=utf-8');

    echo json_encode([
        'success' => true,
        'authorized' => true,
        'message' => 'تم التحقق من صلاحية المسؤول.'
    ], JSON_UNESCAPED_UNICODE);
}
 