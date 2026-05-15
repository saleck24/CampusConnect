-- ========================================================
-- Migration : Support des invités anonymes (visiteurs sans compte)
-- À exécuter UNE SEULE FOIS sur la base campusconnect existante
-- ========================================================

USE campusconnect;

-- 1. Rendre user_id nullable (un invité n'a pas de compte)
ALTER TABLE `registrations`
  MODIFY COLUMN `user_id` INT NULL;

-- 2. Supprimer l'ancien index unique user_id
ALTER TABLE `registrations`
  DROP INDEX `user_id`;

-- 3. Ajouter les colonnes pour les invités anonymes
ALTER TABLE `registrations`
  ADD COLUMN `guest_name` VARCHAR(100) NULL AFTER `user_id`,
  ADD COLUMN `guest_email` VARCHAR(150) NULL AFTER `guest_name`;

-- 4. Recréer la contrainte unique sur (user_id, event_id)
ALTER TABLE `registrations`
  ADD UNIQUE KEY `unique_user_event` (`user_id`, `event_id`);

