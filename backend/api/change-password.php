
<?php

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/auth.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: http://localhost:5173');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'طريقة الطلب غير مسموحة.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// التأكد من تسجيل دخول المسؤول
requireAdmin();

// قراءة البيانات المرسلة
$data = json_decode(file_get_contents('php://input'), true);

$currentPassword = $data['current_password'] ?? '';
$newPassword = $data['new_password'] ?? '';
$confirmPassword = $data['confirm_password'] ?? '';

// التحقق من الحقول
if (!$currentPassword || !$newPassword || !$confirmPassword) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'يرجى تعبئة جميع الحقول.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// التحقق من طول كلمة المرور الجديدة
if (strlen($newPassword) < 8) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// التأكد من تطابق كلمتي المرور
if ($newPassword !== $confirmPassword) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'كلمتا المرور الجديدتان غير متطابقتين.'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $userId = $_SESSION['user_id'];

    // جلب كلمة المرور الحالية من قاعدة البيانات
    $stmt = $pdo->prepare(
        "SELECT password FROM users WHERE id = :id AND is_active = 1 LIMIT 1"
    );

    $stmt->execute(['id' => $userId]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

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
            'message' => 'اختاري كلمة مرور جديدة مختلفة عن الحالية.'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // تشفير كلمة المرور الجديدة
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

    // حفظ كلمة المرور الجديدة
    $update = $pdo->prepare(
        "UPDATE users SET password = :password WHERE id = :id"
    );

    $update->execute([
        'password' => $hashedPassword,
        'id' => $userId
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'تم تغيير كلمة المرور بنجاح.'
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'حدث خطأ أثناء تحديث كلمة المرور.'
    ], JSON_UNESCAPED_UNICODE);
}
