<?php

// إعدادات CORS المركزية لمنصة تكية بهية
$allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://localhost',
    'http://127.0.0.1',
];

// دعم النطاق المخصص من متغيرات البيئة إن وُجد
if ($envOrigin = getenv('APP_FRONTEND_URL')) {
    $allowedOrigins[] = rtrim($envOrigin, '/');
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Credentials: true');
} else {
    // للأمان: في بيئة التطوير المحلية إن لم يتوفر Origin نحدد الافتراضي
    header('Access-Control-Allow-Origin: http://localhost:5173');
    header('Access-Control-Allow-Credentials: true');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token');
header('Content-Type: application/json; charset=utf-8');

// الترويسات الأمنية الأساسية
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('X-XSS-Protection: 1; mode=block');

// معالجة طلبات Preflight التمهيدية
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
