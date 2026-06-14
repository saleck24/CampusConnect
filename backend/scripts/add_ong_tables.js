/**
 * Script de migration ONG
 * Ajoute :
 *  - Colonne `type` ENUM('CLUB','ONG') à la table associations
 *  - Table `donations` (dons financiers et en nature vers les ONG)
 *  - Table `member_contributions` (cotisations récurrentes des membres)
 *
 * Usage: node backend/scripts/add_ong_tables.js
 */

const pool = require('../config/db');

const run = async () => {
    const connection = await pool.getConnection();
    try {
        console.log('🚀 Début de la migration ONG...');

        // 1. Colonne `type` sur associations
        const [cols] = await connection.query(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'associations' AND COLUMN_NAME = 'type'`
        );
        if (cols.length === 0) {
            await connection.query(
                `ALTER TABLE associations ADD COLUMN type ENUM('CLUB', 'ONG') NOT NULL DEFAULT 'CLUB' AFTER name`
            );
            console.log("✅ Colonne 'type' ajoutée à la table 'associations'.");
        } else {
            console.log("ℹ️  Colonne 'type' déjà présente dans 'associations'.");
        }

        // 2. Table `donations`
        await connection.query(`
            CREATE TABLE IF NOT EXISTS donations (
                id INT AUTO_INCREMENT PRIMARY KEY,
                association_id INT NOT NULL,
                donor_name VARCHAR(150) NOT NULL,
                donor_email VARCHAR(255),
                donation_type ENUM('MONETARY', 'IN_KIND') NOT NULL DEFAULT 'MONETARY',
                amount DECIMAL(10,2) DEFAULT NULL COMMENT 'Montant en MRU (si MONETARY)',
                commission_amount DECIMAL(10,2) DEFAULT NULL COMMENT '10% du montant',
                item_description TEXT DEFAULT NULL COMMENT 'Description du bien (si IN_KIND)',
                status ENUM('EN_ATTENTE', 'VALIDE') NOT NULL DEFAULT 'EN_ATTENTE',
                proof_url VARCHAR(255) DEFAULT NULL COMMENT 'Preuve de virement ou recu',
                message TEXT DEFAULT NULL COMMENT 'Message du donateur',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log("✅ Table 'donations' créée (ou déjà existante).");

        // 3. Table `member_contributions`
        await connection.query(`
            CREATE TABLE IF NOT EXISTS member_contributions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                association_id INT NOT NULL,
                user_id INT NOT NULL,
                amount DECIMAL(10,2) NOT NULL COMMENT 'Montant de la cotisation en MRU',
                period VARCHAR(7) NOT NULL COMMENT 'Format YYYY-MM (ex: 2026-06)',
                status ENUM('EN_ATTENTE', 'PAYE') NOT NULL DEFAULT 'EN_ATTENTE',
                proof_url VARCHAR(255) DEFAULT NULL COMMENT 'Preuve de paiement (image ou PDF)',
                validated_at TIMESTAMP DEFAULT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE KEY unique_member_period (association_id, user_id, period)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log("✅ Table 'member_contributions' créée (ou déjà existante).");

        console.log('\n🎉 Migration ONG terminée avec succès !');
    } catch (err) {
        console.error('❌ Erreur lors de la migration :', err.message);
        process.exit(1);
    } finally {
        connection.release();
        pool.end();
    }
};

run();
