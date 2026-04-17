const bcrypt = require('bcrypt');
const pool = require('../config/db');
const path = require('path');

async function createAdmin(name, email, password) {
    try {
        // Chargement du .env pour les accès DB
        try { 
            // On tente de charger le .env du dossier parent (backend/)
            process.loadEnvFile(path.join(__dirname, '../.env')); 
        } catch(e) {
            console.log("Note: Fichier .env non chargé ou déjà présent.");
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Vérification si l'utilisateur existe déjà
        const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            console.log(`⚠️ L'utilisateur ${email} existe déjà. Nous allons simplement mettre à jour son rôle en 'admin'.`);
            await pool.execute('UPDATE users SET role = "admin", is_active = 1 WHERE email = ?', [email]);
            console.log(`✅ Succès ! L'utilisateur ${email} est désormais Administrateur.`);
        } else {
            const [result] = await pool.execute(
                'INSERT INTO users (name, email, password, role, is_active) VALUES (?, ?, ?, ?, ?)',
                [name, email, hashedPassword, 'admin', true]
            );
            console.log(`✅ Succès ! L'administrateur ${name} (${email}) a été créé avec l'ID ${result.insertId}.`);
        }
        
        process.exit(0);
    } catch (error) {
        console.error("❌ Erreur lors de l'opération :", error.message);
        process.exit(1);
    }
}

// Paramètres : Nom, Email, Mot de passe par défaut
createAdmin('Admin CampusConnect', 'campustoconnected@gmail.com', 'Admin123!');
