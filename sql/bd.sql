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
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` enum('invite','etudiant','responsable','admin') COLLATE utf8mb4_unicode_ci DEFAULT 'invite',
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
  `status` enum('pending','approved','refused') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
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
-- Structure de la table `registrations`
-- ========================================================

CREATE TABLE IF NOT EXISTS `registrations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `event_id` int NOT NULL,
  `price_applied` decimal(10,2) DEFAULT NULL,
  `payment_status` enum('pending','validated','free') COLLATE utf8mb4_unicode_ci DEFAULT 'free',
  `payment_proof_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`,`event_id`),
  KEY `idx_registrations_user` (`user_id`),
  KEY `idx_registrations_event` (`event_id`),
  CONSTRAINT `registrations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `registrations_ibfk_2` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
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

COMMIT;
