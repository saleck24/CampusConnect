const pool = require('../config/db');
const eventModel = require('../models/eventModel');
const associationModel = require('../models/associationModel');
const userModel = require('../models/userModel');
const reviewModel = require('../models/reviewModel');

/**
 * Récupère les statistiques publiques pour la page d'accueil
 */
const getPublicStats = async (req, res) => {
    try {
        // 1. Compter les utilisateurs actifs
        const [userResult] = await pool.execute('SELECT COUNT(*) as count FROM users WHERE is_active = 1');
        const userCount = userResult[0].count;

        // 2. Compter les associations validées
        const [assoResult] = await pool.execute('SELECT COUNT(*) as count FROM associations');
        const associationCount = assoResult[0].count;

        // 3. Compter les événements (ce mois-ci)
        const [eventResult] = await pool.execute(`
            SELECT COUNT(*) as count 
            FROM events 
            WHERE is_cancelled = FALSE 
            AND MONTH(date) = MONTH(CURRENT_DATE()) 
            AND YEAR(date) = YEAR(CURRENT_DATE())
        `);
        const eventsThisMonth = eventResult[0].count;

        // 4. Calcul de la satisfaction (moyenne des avis)
        const avgRating = await reviewModel.getGlobalAverageRating();
        const satisfaction = avgRating ? Math.round((avgRating / 5) * 100) : 0;

        // 5. Récupérer les initiales pour les avatars du Hero
        const recentInitials = await userModel.getRecentInitials(5);

        res.status(200).json({
            users: userCount,
            associations: associationCount,
            eventsThisMonth: eventsThisMonth,
            satisfaction: satisfaction,
            recentInitials: recentInitials
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques :', error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des statistiques.' });
    }
};

module.exports = {
    getPublicStats
};
