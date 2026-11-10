<?php

require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/db.php';

echo json_encode([
    'success' => true,
    'message' => 'تم الاتصال بقاعدة البيانات بنجاح.'
], JSON_UNESCAPED_UNICODE);
