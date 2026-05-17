const pool = require('../config/db');
const associationModel = require('../models/associationModel');

/**
 * Récupère les membres de l'association du responsable connecté
 */
const getAssociationMembers = async (req, res) => {
    try {
        const userId = req.user.id;
        const associationId = await associationModel.getUserAssociationId(userId);

        if (!associationId) {
            return res.status(403).json({ message: 'Vous ne gérez aucune association.' });
        }

        const [rows] = await pool.execute(`
            SELECT u.id, u.name, u.email, am.created_at as joined_at, am.status
            FROM association_members am
            JOIN users u ON am.user_id = u.id
            WHERE am.association_id = ? AND am.status = 'approved'
        `, [associationId]);

        res.status(200).json(rows);
    } catch (error) {
        console.error('Erreur getAssociationMembers:', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

/**
 * Supprime (révoque) un membre de l'association
 */
const removeMember = async (req, res) => {
    try {
        const { userId: targetUserId } = req.params;
        const managerId = req.user.id;
        const associationId = await associationModel.getUserAssociationId(managerId);

        if (!associationId) return res.status(403).json({ message: 'Non autorisé.' });

        await pool.execute(
            'DELETE FROM association_members WHERE user_id = ? AND association_id = ?',
            [targetUserId, associationId]
        );

        res.status(200).json({ message: 'Membre révoqué avec succès.' });
    } catch (error) {
        console.error('Erreur removeMember:', error);
        res.status(500).json({ message: 'Erreur lors de la révocation.' });
    }
};

/**
 * Récupère l'historique financier de l'association
 */
const getAssociationFinances = async (req, res) => {
    try {
        const userId = req.user.id;
        const associationId = await associationModel.getUserAssociationId(userId);

        if (!associationId) return res.status(403).json({ message: 'Non autorisé.' });

        // Journal des transactions (Inscriptions payantes aux événements)
        const [transactions] = await pool.execute(`
            SELECT 
                r.id, 
                r.created_at as date, 
                COALESCE(u.name, r.guest_name) as user_name, 
                e.title as event_title, 
                r.price_applied as amount, 
                r.payment_status
            FROM registrations r
            LEFT JOIN users u ON r.user_id = u.id
            JOIN events e ON r.event_id = e.id
            WHERE e.association_id = ? AND r.price_applied > 0
            ORDER BY r.created_at DESC
        `, [associationId]);

        // Calcul du total (CA)
        const [totalRes] = await pool.execute(`
            SELECT SUM(r.price_applied) as total_revenue
            FROM registrations r
            JOIN events e ON r.event_id = e.id
            WHERE e.association_id = ? AND r.payment_status = 'PAYE'
        `, [associationId]);

        res.status(200).json({
            transactions,
            totalRevenue: totalRes[0].total_revenue || 0
        });
    } catch (error) {
        console.error('Erreur getAssociationFinances:', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

/**
 * Récupère les détails de l'association du responsable connecté
 */
const getMyAssociationDetail = async (req, res) => {
    try {
        const userId = req.user.id;
        const associationId = await associationModel.getUserAssociationId(userId);

        if (!associationId) {
            return res.status(403).json({ message: 'Vous ne gérez aucune association.' });
        }

        const association = await associationModel.getById(associationId);
        res.status(200).json(association);
    } catch (error) {
        console.error('Erreur getMyAssociationDetail:', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

/**
 * Liste les demandes d'adhésion en attente pour l'association du responsable
 */
const getPendingMembers = async (req, res) => {
    try {
        const userId = req.user.id;
        const associationId = await associationModel.getUserAssociationId(userId);

        if (!associationId) {
            return res.status(403).json({ message: 'Vous ne gérez aucune association.' });
        }

        const [rows] = await pool.execute(`
            SELECT u.id, u.name, u.email, u.phone, am.created_at as requested_at
            FROM association_members am
            JOIN users u ON am.user_id = u.id
            WHERE am.association_id = ? AND am.status = 'pending'
            ORDER BY am.created_at DESC
        `, [associationId]);

        res.status(200).json(rows);
    } catch (error) {
        console.error('Erreur getPendingMembers:', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

/**
 * Approuver une demande d'adhésion
 */
const approveMember = async (req, res) => {
    try {
        const { userId: targetUserId } = req.params;
        const managerId = req.user.id;
        const associationId = await associationModel.getUserAssociationId(managerId);

        if (!associationId) return res.status(403).json({ message: 'Non autorisé.' });

        const [result] = await pool.execute(
            'UPDATE association_members SET status = \'approved\' WHERE user_id = ? AND association_id = ? AND status = \'pending\'',
            [targetUserId, associationId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Demande introuvable ou déjà traitée.' });
        }

        res.status(200).json({ message: 'Adhésion approuvée avec succès.' });
    } catch (error) {
        console.error('Erreur approveMember:', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

module.exports = {
    getAssociationMembers,
    removeMember,
    getAssociationFinances,
    getMyAssociationDetail,
    getPendingMembers,
    approveMember
};
