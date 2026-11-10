# 🚀 دليل النشر والتشغيل — منصة تكية بهية
## تكية بهية | أمل وسط الركام — قطاع غزة

دليل شامل ومهني لتثبيت، إعداد، ونشر منصة "تكية بهية" على الخوادم المحلية وخوادم الإنتاج السحابية.

---

## 📌 1. متطلبات النظام (System Requirements)

### بيئة الخادم (Backend Environment):
- **PHP:** الإصدار 8.2 أو أحدث.
- **امتدادات PHP المطلوبة:** `pdo_mysql`, `json`, `session`, `mbstring`, `filter`.
- **خادم الويب:** Apache 2.4+ (مع تفعيل `mod_rewrite` و `mod_headers`) أو Nginx.
- **قاعدة البيانات:** MySQL 5.7+ أو MariaDB 10.3+.

### بيئة التطوير والواجهة الأمامية (Frontend Environment):
- **Node.js:** الإصدار 18.x أو 20.x أو أحدث.
- **NPM:** الإصدار 9.x أو أحدث.

---

## 🗄️ 2. إعداد قاعدة البيانات (Database Setup)

1. افتح لوحة **phpMyAdmin** (أو سطر أوامر MySQL).
2. قم باستيراد ملف المخطط الشامل الموجود في:
   `backend/database/takiyat_bahya_database.sql`
   (أو استيراده عبر سطر الأوامر):
   ```bash
   mysql -u root -p < backend/database/takiyat_bahya_database.sql
   ```
3. في حال كانت قاعدة البيانات منشأة ومحتوية على بيانات مسبقاً، يمكنك ترقيتها دون فقدان البيانات عبر استيراد:
   `backend/database/migration_takiyat_bahya.sql`

### إنشاء حساب مسؤول النظام الأول (First Admin Account):
أنشئ حساب المسؤول الافتراضي عبر تنفيذ استعلام SQL التالي (مع تغيير كلمة المرور):
> كلمة المرور الافتراضية في المثال التالي: `BahyaAdmin@2026`
```sql
INSERT INTO `users` (`full_name`, `username`, `password`, `role`, `is_active`) 
VALUES (
  'إدارة تكية بهية',
  'admin',
  '$2y$10$vQ1F5vSkg72jA.1E8o7aEuX.M4p6V6wE03JtC3E3j8y3eT0d6R1O.', 
  'admin',
  1
);
```
*(أو استخدم دالة `password_hash('كلمتك_السرية', PASSWORD_DEFAULT)` في PHP لتوليد الهاش الخاص بك).*

---

## 💻 3. التشغيل في بيئة التطوير المحلية (Local Development)

### أ. ضبط خادم XAMPP:
1. تأكد من تشغيل خدمتي **Apache** و **MySQL** من لوحة تحكم XAMPP.
2. ضع مجلد `backend` داخل المسار: `C:\xampp\htdocs\takiyat-bahya\backend`.
3. انسخ ملف `backend/.env.example` إلى `backend/.env` واضبط بيانات الاتصال.

### ب. تشغيل واجهة React (Frontend):
1. افتح موجه الأوامر في مجلد `frontend`:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. افتح المتصفح على الرابط: `http://localhost:5173`.

---

## 🌐 4. النشر الفعلي على خوادم الاستضافة (Production Deployment)

### الخطوة 1: بناء حزمة الواجهة الأمامية (Build Production Assets)
داخل مجلد `frontend`، نفّذ:
```bash
npm run build
```
سيتم توليد مجلد `frontend/dist` الذي يحتوي على ملفات HTML و CSS و JS المجمعة والمحسنة.

### الخطوة 2: رفع الملفات إلى مسار الاستضافة (`public_html`)
1. **ملفات الواجهة:** ارفع محتويات مجلد `frontend/dist/` مباشرة إلى المجلد الرئيسي في الاستضافة (`public_html/`).
2. **ملفات الـ API الخلفية:** ارفع مجلد `backend/` كاملاً بجانب ملفات الواجهة بحيث يكون مسار الـ API:
   `https://your-domain.com/backend/api/`
3. تأكد من أن ملفات `.htaccess` مرفوعة داخل مجلد `backend/config/` و `backend/database/` لمنع تحميل الملفات الحساسة من المتصفح.

### الخطوة 3: ضبط متغيرات البيئة في الاستضافة
في ملف `backend/config/db.php`، تأكد من وضع بيانات مستخدم قاعدة البيانات المستقل المنشأ عبر cPanel:
```php
$host = 'localhost';
$dbname = 'cpaneluser_takiyat_bahya';
$username = 'cpaneluser_dbuser';
$password = 'STRONG_PASSWORD_HERE';
```

---

## 🔒 5. قائمة التحقق الأمني قبل الإطلاق (Production Security Checklist)

- [x] تفعيل تشفير HTTPS وإصدار شهادة SSL (Let's Encrypt / Cloudflare).
- [x] حظر عرض مجلدات الاستضافة (`Options -Indexes`).
- [x] منع الوصول المباشر لملفات `.sql` و `.env` و `.git` و مجلد `config`.
- [x] تعطيل عرض أخطاء PHP على الشاشة (`display_errors = Off`) في الاستضافة وتفعيل تسجيلها في السجلات (`log_errors = On`).
- [x] تفعيل حماية هجمات التخمين (Rate Limiting) على مسار تسجيل الدخول.
- [x] تفعيل رموز مكافحة التزوير (CSRF Tokens) على العمليات الإدارية الحساسة.
- [x] عدم استخدام حساب `root` لقاعدة البيانات في بيئة الإنتاج، واستخدام حساب مخصص بصلاحيات محدودة.

---
*تكية بهية — منصة تجمع الخير في غزة*
