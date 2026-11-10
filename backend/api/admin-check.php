<?php

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/auth.php';

requireAdmin($pdo);

echo json_encode([
    'success' => true,
    'authorized' => true,
    'message' => 'تم التحقق من صلاحية المسؤول بنجاح.'
], JSON_UNESCAPED_UNICODE);
