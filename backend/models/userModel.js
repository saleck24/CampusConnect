const pool = require('../config/db');

// Trouver un utilisateur par son email
const findByEmail = async (email) => {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
};

// Créer un utilisateur
const create = async (name, email, hashedPassword, role = 'invite') => {
    const [result] = await pool.execute(
        'INSERT INTO users (name, email, password, role, is_active) VALUES (?, ?, ?, ?, ?)',
        [name, email, hashedPassword, role, false]
    );
    return result.insertId;
};

// Activer un utilisateur
const activateUser = async (id) => {
    const [result] = await pool.execute('UPDATE users SET is_active = true WHERE id = ?', [id]);
    return result.affectedRows > 0;
};

const findById = async (id) => {
     const [rows] = await pool.execute('SELECT id, name, email, role, is_active, created_at FROM users WHERE id = ?', [id]);
     return rows[0];
}

// Admin : Tout lister
const findAll = async () => {
    const [rows] = await pool.execute('SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC');
    return rows;
};

// Admin : Changer rôle
const updateRole = async (id, role) => {
    await pool.execute('UPDATE users SET role = ? WHERE id = ?', [role, id]);
};

// Admin : Toggle status
const toggleStatus = async (id, isActive) => {
    await pool.execute('UPDATE users SET is_active = ? WHERE id = ?', [isActive, id]);
};

/**
 * Récupérer les noms des X derniers utilisateurs pour générer des avatars
 */
const getRecentInitials = async (limit = 5) => {
    const [rows] = await pool.query('SELECT name FROM users ORDER BY created_at DESC LIMIT ?', [limit]);
    return rows.map(u => {
        if (!u.name) return "??";
        const parts = u.name.trim().split(' ');
        if (parts.length > 1 && parts[0][0] && parts[1][0]) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return u.name.substring(0, 2).toUpperCase();
    });
};

module.exports = {
    findByEmail,
    create,
    activateUser,
    findById,
    findAll,
    updateRole,
    toggleStatus,
    getRecentInitials
};
