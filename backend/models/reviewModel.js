const pool = require('../config/db');

/**
 * Créer un avis plateforme
 */
const create = async (userId, rating, comment) => {
    const [result] = await pool.execute(
        'INSERT INTO platform_reviews (user_id, rating, comment) VALUES (?, ?, ?)',
        [userId, rating, comment]
    );
    return result.insertId;
};

/**
 * Calculer la moyenne globale des notes
 */
const getGlobalAverageRating = async () => {
    const [rows] = await pool.execute('SELECT AVG(rating) as average FROM platform_reviews');
    return rows[0].average || 0;
};

/**
 * Vérifier si un utilisateur a déjà participé à au moins un événement
 */
const hasParticipated = async (userId) => {
    const [rows] = await pool.execute('SELECT id FROM registrations WHERE user_id = ? LIMIT 1', [userId]);
    return rows.length > 0;
};

module.exports = {
    create,
    getGlobalAverageRating,
    hasParticipated
};
