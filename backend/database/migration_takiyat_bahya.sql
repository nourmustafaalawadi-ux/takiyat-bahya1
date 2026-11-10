-- ==============================================================
-- Takiyat Bahya - Database Migration & Architecture Patch
-- ترقية قاعدة بيانات تكية بهية - متوافق مع MySQL 5.7+ و MariaDB 10+
-- ==============================================================

USE `takiyat_bahya`;

SET NAMES utf8mb4;

-- 1. إضافة عمود الأرشفة لجدول التكيات
ALTER TABLE `kitchens`
  ADD COLUMN IF NOT EXISTS `is_archived` TINYINT(1) UNSIGNED NOT NULL DEFAULT 0 AFTER `is_active`;

-- 2. إضافة الفهارس لتحسين سرعة الاستعلامات
ALTER TABLE `kitchens`
  ADD KEY IF NOT EXISTS `idx_kitchens_is_archived` (`is_archived`),
  ADD KEY IF NOT EXISTS `idx_kitchens_public_lookup` (`is_archived`, `is_active`, `verification_status`, `area_id`);

-- 3. إنشاء جدول طلبات الدعم واحتياجات التكيات
CREATE TABLE IF NOT EXISTS `support_requests` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `kitchen_id` INT UNSIGNED NULL DEFAULT NULL,
  `kitchen_name` VARCHAR(150) NOT NULL,
  `contact_person` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(30) NOT NULL,
  `area_id` INT UNSIGNED NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `support_type` ENUM('food_supplies', 'gas_fuel', 'equipment', 'water', 'financial', 'other') NOT NULL DEFAULT 'food_supplies',
  `urgency_level` ENUM('normal', 'urgent', 'critical') NOT NULL DEFAULT 'urgent',
  `target_beneficiaries_count` INT UNSIGNED NULL DEFAULT NULL,
  `description` TEXT NOT NULL,
  `status` ENUM('pending', 'under_review', 'fulfilled', 'rejected') NOT NULL DEFAULT 'pending',
  `admin_notes` TEXT NULL DEFAULT NULL,
  `is_archived` TINYINT(1) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_support_requests_status` (`status`),
  KEY `idx_support_requests_area` (`area_id`),
  KEY `idx_support_requests_archived` (`is_archived`),
  KEY `idx_support_requests_urgency` (`urgency_level`),
  CONSTRAINT `fk_support_kitchen` FOREIGN KEY (`kitchen_id`) REFERENCES `kitchens` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_support_area` FOREIGN KEY (`area_id`) REFERENCES `areas` (`id`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. إنشاء جدول حماية تسجيل الدخول من التخمين
CREATE TABLE IF NOT EXISTS `login_attempts` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `ip_address` VARCHAR(45) NOT NULL,
  `username` VARCHAR(100) NOT NULL,
  `attempt_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `success` TINYINT(1) UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_login_ip_time` (`ip_address`, `attempt_time`),
  KEY `idx_login_user_time` (`username`, `attempt_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
