-- ========================================================
-- Migration : Business Plan & Retours Professeur (CampusConnect)
-- À exécuter sur la base campusconnect existante
-- ========================================================

USE campusconnect;

-- 1. Mettre à jour la table `associations`
ALTER TABLE `associations`
  ADD COLUMN `membership_fee` DECIMAL(10,2) DEFAULT 0.00 AFTER `plan`,
  ADD COLUMN `premium_until` TIMESTAMP NULL DEFAULT NULL AFTER `membership_fee`;

-- 2. Mettre à jour la table `association_members`
ALTER TABLE `association_members`
  ADD COLUMN `price_applied` DECIMAL(10,2) DEFAULT 0.00 AFTER `status`,
  ADD COLUMN `payment_status` ENUM('pending', 'validated', 'free') DEFAULT 'free' AFTER `price_applied`;

-- 3. Créer la table `sponsors`
CREATE TABLE IF NOT EXISTS `sponsors` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `logo_url` VARCHAR(255) NULL,
  `website_url` VARCHAR(255) NULL,
  `amount_paid` DECIMAL(10,2) DEFAULT 5000.00,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
