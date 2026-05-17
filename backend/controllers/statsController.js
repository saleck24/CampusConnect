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
        // 1. Compter les utilisateurs actifs (uniquement les étudiants)
        const [userResult] = await pool.execute("SELECT COUNT(*) as count FROM users WHERE is_active = 1 AND role = 'etudiant'");
        const userCount = userResult[0].count;

        // 2. Compter les associations validées
        const [assoResult] = await pool.execute('SELECT COUNT(*) as count FROM associations WHERE is_validated = 1');
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

/**
 * Récupère les finances globales pour l'Admin
 */
const getAdminFinances = async (req, res) => {
    try {
        // 1. Total des commissions de la plateforme
        const [commRes] = await pool.execute('SELECT SUM(amount) as total FROM commissions');
        const totalPlatformCommissions = commRes[0].total || 0;

        // 2. Total du revenu généré par toutes les associations
        const [revRes] = await pool.execute("SELECT SUM(price_applied) as total FROM registrations WHERE payment_status = 'PAYE'");
        const totalAssociationsRevenue = revRes[0].total || 0;

        // 3. Détail par association
        const [associationsList] = await pool.execute(`
            SELECT 
                a.id, 
                a.name, 
                a.plan,
                COALESCE((
                    SELECT SUM(r.price_applied) 
                    FROM registrations r 
                    JOIN events e ON r.event_id = e.id 
                    WHERE e.association_id = a.id AND r.payment_status = 'PAYE'
                ), 0) as total_revenue,
                COALESCE((
                    SELECT SUM(c.amount) 
                    FROM commissions c 
                    WHERE c.association_id = a.id
                ), 0) as total_commission
            FROM associations a
            WHERE a.is_validated = 1
            ORDER BY total_commission DESC
        `);

        res.status(200).json({
            totalPlatformCommissions,
            totalAssociationsRevenue,
            associations: associationsList
        });
    } catch (error) {
        console.error('Erreur getAdminFinances:', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

module.exports = {
    getPublicStats,
    getAdminFinances
};
