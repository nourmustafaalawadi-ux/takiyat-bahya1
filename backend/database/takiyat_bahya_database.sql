-- قاعدة بيانات مشروع تكية بهية
-- متوافقة مع MySQL / MariaDB و phpMyAdmin
-- الاستيراد: phpMyAdmin > Import > اختيار هذا الملف > Go

CREATE DATABASE IF NOT EXISTS `takiyat_bahya`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `takiyat_bahya`;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- جدول مناطق التغطية في قطاع غزة
CREATE TABLE IF NOT EXISTS `areas` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_areas_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول المستخدمين والمشرفين
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `full_name` VARCHAR(150) NOT NULL,
  `username` VARCHAR(100) NOT NULL,
  `password` VARCHAR(255) NOT NULL COMMENT 'يُحفظ ناتج password_hash() من PHP',
  `role` ENUM('admin','editor') NOT NULL DEFAULT 'admin',
  `is_active` TINYINT(1) UNSIGNED NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_username` (`username`),
  KEY `idx_users_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول التكيات والمطابخ الخيرية
CREATE TABLE IF NOT EXISTS `kitchens` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `area_id` INT UNSIGNED NOT NULL,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT NULL,
  `address` VARCHAR(255) NOT NULL,
  `latitude` DECIMAL(10,7) NULL DEFAULT NULL,
  `longitude` DECIMAL(10,7) NULL DEFAULT NULL,
  `phone` VARCHAR(30) NULL DEFAULT NULL,
  `status` ENUM('open','closed','paused','unknown') NOT NULL DEFAULT 'unknown',
  `verification_status` ENUM('pending','verified','rejected') NOT NULL DEFAULT 'pending',
  `is_active` TINYINT(1) UNSIGNED NOT NULL DEFAULT 1,
  `is_archived` TINYINT(1) UNSIGNED NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_kitchens_area_id` (`area_id`),
  KEY `idx_kitchens_status` (`status`),
  KEY `idx_kitchens_verification_status` (`verification_status`),
  KEY `idx_kitchens_is_active` (`is_active`),
  KEY `idx_kitchens_is_archived` (`is_archived`),
  KEY `idx_kitchens_public_lookup` (`is_archived`, `is_active`, `verification_status`, `area_id`),
  CONSTRAINT `fk_kitchens_area`
    FOREIGN KEY (`area_id`) REFERENCES `areas` (`id`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول مواعيد وجداول توزيع الوجبات
CREATE TABLE IF NOT EXISTS `distribution_schedules` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `kitchen_id` INT UNSIGNED NOT NULL,
  `distribution_date` DATE NOT NULL,
  `start_time` TIME NULL DEFAULT NULL,
  `end_time` TIME NULL DEFAULT NULL,
  `meal_type` VARCHAR(100) NULL DEFAULT NULL,
  `notes` TEXT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_schedules_kitchen_id` (`kitchen_id`),
  KEY `idx_schedules_distribution_date` (`distribution_date`),
  CONSTRAINT `fk_schedules_kitchen`
    FOREIGN KEY (`kitchen_id`) REFERENCES `kitchens` (`id`)
    ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول سجل تحديثات وتغييرات حالة التكيات
CREATE TABLE IF NOT EXISTS `kitchen_updates` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `kitchen_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NULL DEFAULT NULL,
  `old_status` VARCHAR(20) NULL DEFAULT NULL,
  `new_status` VARCHAR(20) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_updates_kitchen_id` (`kitchen_id`),
  KEY `idx_updates_user_id` (`user_id`),
  KEY `idx_updates_created_at` (`created_at`),
  CONSTRAINT `fk_updates_kitchen`
    FOREIGN KEY (`kitchen_id`) REFERENCES `kitchens` (`id`)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT `fk_updates_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- جدول طلبات الدعم واحتياجات التكيات (إغاثة، غاز، تموين، معدات، مياه)
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

-- جدول سجل محاولات تسجيل الدخول لحماية النظام من هجمات التخمين (Rate Limiting)
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

SET FOREIGN_KEY_CHECKS = 1;

-- إدخال مناطق التغطية الخمس المعتمدة في غزة
INSERT IGNORE INTO `areas` (`name`, `description`) VALUES
  ('الرمال', 'منطقة الرمال الشمالي والجنوبي - مدينة غزة'),
  ('النصر', 'حي النصر - مدينة غزة'),
  ('الشاطئ', 'مخيم الشاطئ - غرب مدينة غزة'),
  ('الشيخ رضوان', 'حي الشيخ رضوان - شمال مدينة غزة'),
  ('الجلاء', 'شارع ومنطقة الجلاء - مدينة غزة');
