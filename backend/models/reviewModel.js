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

/**
 * Vérifier si un utilisateur a déjà donné son avis
 */
const hasAlreadyReviewed = async (userId) => {
    const [rows] = await pool.execute('SELECT id FROM platform_reviews WHERE user_id = ? LIMIT 1', [userId]);
    return rows.length > 0;
};

/**
 * Récupérer les avis récents pour la page d'accueil
 */
const getRecentReviews = async (limit = 10) => {
    // Note: Utilisation de query() au lieu de execute() quand on passe une variable LIMIT
    const [rows] = await pool.query(`
        SELECT p.rating, p.comment, p.created_at, u.name 
        FROM platform_reviews p 
        JOIN users u ON p.user_id = u.id 
        ORDER BY p.created_at DESC 
        LIMIT ?
    `, [limit]);
    return rows;
};

module.exports = {
    create,
    getGlobalAverageRating,
    hasParticipated,
    hasAlreadyReviewed,
    getRecentReviews
};
