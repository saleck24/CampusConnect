-- CampusConnect - Schéma de la Base de Données
-- Création de la base
CREATE DATABASE IF NOT EXISTS campusconnect;
USE campusconnect;

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- ========================================================
-- Structure de la table `users`
-- ========================================================

CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('etudiant','responsable','admin') COLLATE utf8mb4_unicode_ci DEFAULT 'etudiant',
  `is_active` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- Structure de la table `associations`
-- ========================================================

CREATE TABLE IF NOT EXISTS `associations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `logo_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `objectives` text COLLATE utf8mb4_unicode_ci,
  `membership_conditions` text COLLATE utf8mb4_unicode_ci,
  `is_validated` tinyint(1) DEFAULT '0',
  `plan` enum('free','premium') COLLATE utf8mb4_unicode_ci DEFAULT 'free',
  `membership_fee` decimal(10,2) DEFAULT '0.00',
  `premium_until` timestamp NULL DEFAULT NULL,
  `type` enum('ONG','CLUB','STUDENT_CREATED') COLLATE utf8mb4_unicode_ci DEFAULT 'CLUB',
  `commission_percent` tinyint UNSIGNED NOT NULL DEFAULT 10,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- Structure de la table `association_members`
-- ========================================================

CREATE TABLE IF NOT EXISTS `association_members` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `association_id` int NOT NULL,
  `status` enum('pending','pending_payment','awaiting_validation','validated','approved','refused') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `price_applied` decimal(10,2) DEFAULT '0.00',
  `payment_status` enum('pending','validated','free') COLLATE utf8mb4_unicode_ci DEFAULT 'free',
  `payment_proof_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_assoc_members_user` (`user_id`),
  KEY `idx_assoc_members_assoc` (`association_id`),
  CONSTRAINT `association_members_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `association_members_ibfk_2` FOREIGN KEY (`association_id`) REFERENCES `associations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- Structure de la table `events`
-- ========================================================

CREATE TABLE IF NOT EXISTS `events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `association_id` int NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `date` datetime NOT NULL,
  `end_date` datetime DEFAULT NULL,
  `location` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `max_participants` int DEFAULT NULL,
  `guest_price` decimal(10,2) DEFAULT '0.00',
  `member_price` decimal(10,2) DEFAULT '0.00',
  `is_paid` tinyint(1) DEFAULT '0',
  `is_cancelled` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_events_association` (`association_id`),
  CONSTRAINT `events_ibfk_1` FOREIGN KEY (`association_id`) REFERENCES `associations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- Table des dons
CREATE TABLE IF NOT EXISTS `donations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `association_id` int NOT NULL,
  `donor_name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `donor_email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_donations_assoc` (`association_id`),
  CONSTRAINT `donations_ibfk_1` FOREIGN KEY (`association_id`) REFERENCES `associations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- Contributions des membres (preuve de paiement)
CREATE TABLE IF NOT EXISTS `member_contributions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `membership_id` int NOT NULL,
  `proof_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','validated','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_member_contrib_mem` (`membership_id`),
  CONSTRAINT `member_contributions_ibfk_1` FOREIGN KEY (`membership_id`) REFERENCES `association_members` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- ========================================================



-- ========================================================
-- Structure de la table `registrations`
-- ========================================================

CREATE TABLE IF NOT EXISTS `registrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NULL,
  `guest_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `guest_email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `event_id` int NOT NULL,
  `price_applied` decimal(10,2) DEFAULT NULL,
  `payment_status` enum('pending','validated','free') COLLATE utf8mb4_unicode_ci DEFAULT 'free',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_event` (`user_id`,`event_id`),
  KEY `idx_registrations_user` (`user_id`),
  KEY `idx_registrations_event` (`event_id`),
  CONSTRAINT `registrations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `registrations_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- Structure de la table `platform_reviews`
-- ========================================================

CREATE TABLE IF NOT EXISTS `platform_reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `rating` int NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
  `comment` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_reviews_user` (`user_id`),
  CONSTRAINT `platform_reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- Structure de la table `commissions`
-- ========================================================

CREATE TABLE IF NOT EXISTS `commissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `association_id` int NOT NULL,
  `registration_id` int DEFAULT NULL,
  `membership_id` int DEFAULT NULL,
  `type` enum('event','membership') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `rate` decimal(5,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `association_id` (`association_id`),
  KEY `registration_id` (`registration_id`),
  KEY `membership_id` (`membership_id`),
  CONSTRAINT `commissions_ibfk_1` FOREIGN KEY (`association_id`) REFERENCES `associations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `commissions_ibfk_2` FOREIGN KEY (`registration_id`) REFERENCES `registrations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `commissions_ibfk_3` FOREIGN KEY (`membership_id`) REFERENCES `association_members` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================================
-- Structure de la table `sponsors`
-- ========================================================

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

COMMIT;
