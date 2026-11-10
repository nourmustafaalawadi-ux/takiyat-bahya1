<?php

require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'طريقة الطلب غير مسموحة.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

requireAdmin($pdo);

$data = json_decode(file_get_contents('php://input'), true);

$currentPassword = $data['current_password'] ?? '';
$newPassword = $data['new_password'] ?? '';
$confirmPassword = $data['confirm_password'] ?? '';

if ($currentPassword === '' || $newPassword === '' || $confirmPassword === '') {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'يرجى تعبئة جميع الحقول المطلوبة.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if (strlen($newPassword) < 8 || strlen($newPassword) > 128) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'كلمة المرور الجديدة يجب أن تكون بين 8 و 128 محرفًا.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if ($newPassword !== $confirmPassword) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'كلمتا المرور الجديدتان غير متطابقتين.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $userId = (int) $_SESSION['user_id'];

    $stmt = $pdo->prepare("SELECT password FROM users WHERE id = :id AND is_active = 1 LIMIT 1");
    $stmt->execute(['id' => $userId]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($currentPassword, $user['password'])) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'message' => 'كلمة المرور الحالية غير صحيحة.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    if ($currentPassword === $newPassword) {
        http_response_code(422);
        echo json_encode([
            'success' => false,
            'message' => 'يرجى اختيار كلمة مرور جديدة مختلفة عن الحالية.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

    $update = $pdo->prepare("UPDATE users SET password = :password WHERE id = :id");
    $update->execute([
        'password' => $hashedPassword,
        'id' => $userId
    ]);

    // تجديد معرف الجلسة للأمان بعد تغيير كلمة المرور
    session_regenerate_id(true);

    echo json_encode([
        'success' => true,
        'message' => 'تم تغيير كلمة المرور بنجاح.'
    ], JSON_UNESCAPED_UNICODE);

} catch (Throwable $e) {
    error_log('[API Error: change-password.php] ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'حدث خطأ أثناء تحديث كلمة المرور.'
    ], JSON_UNESCAPED_UNICODE);
}
