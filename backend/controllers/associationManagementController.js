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
            SELECT u.id, u.name, u.email, am.created_at as joined_at, am.status, am.price_applied, am.payment_status
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

/**
 * Met à jour les paramètres de l'association (Ex: Cotisation annuelle - Plan Premium requis)
 */
const updateAssociationSettings = async (req, res) => {
    try {
        const userId = req.user.id;
        const associationId = await associationModel.getUserAssociationId(userId);

        if (!associationId) {
            return res.status(403).json({ message: 'Vous ne gérez aucune association.' });
        }

        const association = await associationModel.getById(associationId);
        if (!association) {
            return res.status(404).json({ message: 'Association introuvable.' });
        }

        // Seules les associations Premium peuvent définir des frais d'adhésion
        if (association.plan !== 'premium') {
            return res.status(403).json({ message: 'La gestion des cotisations annuelles est réservée aux associations Premium.' });
        }

        const { membership_fee } = req.body;
        if (membership_fee === undefined || isNaN(membership_fee) || Number(membership_fee) < 0) {
            return res.status(400).json({ message: 'Montant de cotisation invalide.' });
        }

        await pool.execute(
            'UPDATE associations SET membership_fee = ? WHERE id = ?',
            [Number(membership_fee), associationId]
        );

        res.status(200).json({ message: 'Paramètres mis à jour avec succès.', membership_fee: Number(membership_fee) });
    } catch (error) {
        console.error('Erreur updateAssociationSettings:', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

/**
 * Valide le paiement de la cotisation d'adhésion d'un membre et génère la commission de 5%
 */
const validateMembershipPayment = async (req, res) => {
    try {
        const { userId: targetUserId } = req.params;
        const managerId = req.user.id;
        const associationId = await associationModel.getUserAssociationId(managerId);

        if (!associationId) return res.status(403).json({ message: 'Non autorisé.' });

        // 1. Récupérer la relation d'adhésion
        const [rows] = await pool.execute(
            'SELECT id, price_applied, payment_status FROM association_members WHERE user_id = ? AND association_id = ?',
            [targetUserId, associationId]
        );
        const memberRelation = rows[0];

        if (!memberRelation) {
            return res.status(404).json({ message: 'Adhésion introuvable.' });
        }

        if (memberRelation.payment_status === 'validated') {
            return res.status(400).json({ message: 'Cette cotisation a déjà été validée.' });
        }

        // 2. Valider le paiement de la cotisation
        await pool.execute(
            'UPDATE association_members SET payment_status = \'validated\' WHERE user_id = ? AND association_id = ?',
            [targetUserId, associationId]
        );

        // 3. Enregistrer la commission plateforme (5%)
        if (memberRelation.price_applied > 0) {
            const rate = 5.00;
            const amount = (memberRelation.price_applied * rate) / 100;
            
            await pool.execute(
                'INSERT INTO commissions (association_id, membership_id, type, amount, rate) VALUES (?, ?, ?, ?, ?)',
                [associationId, memberRelation.id, 'membership', amount, rate]
            );
        }

        res.status(200).json({ message: 'Paiement de la cotisation validé avec succès.' });
    } catch (error) {
        console.error('Erreur validateMembershipPayment:', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

/**
 * Met à jour les détails de l'association du responsable connecté (US12)
 */
const updateMyAssociation = async (req, res) => {
    try {
        const userId = req.user.id;
        const associationId = await associationModel.getUserAssociationId(userId);

        if (!associationId) {
            return res.status(403).json({ message: 'Vous ne gérez aucune association.' });
        }

        const { name, description, objectives, membership_conditions } = req.body;
        
        let logo_url = undefined;
        if (req.file) {
            logo_url = '/uploads/' + req.file.filename;
        }

        const updates = [];
        const values = [];

        if (name) { updates.push('name = ?'); values.push(name); }
        if (description) { updates.push('description = ?'); values.push(description); }
        if (objectives) { updates.push('objectives = ?'); values.push(objectives); }
        if (membership_conditions) { updates.push('membership_conditions = ?'); values.push(membership_conditions); }
        if (logo_url) { updates.push('logo_url = ?'); values.push(logo_url); }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'Aucun champ à modifier.' });
        }

        values.push(associationId);
        await pool.execute(
            `UPDATE associations SET ${updates.join(', ')} WHERE id = ?`,
            values
        );

        res.status(200).json({ message: 'Profil de l\'association mis à jour avec succès.' });
    } catch (error) {
        console.error('Erreur updateMyAssociation:', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

module.exports = {
    getAssociationMembers,
    removeMember,
    getAssociationFinances,
    getMyAssociationDetail,
    getPendingMembers,
    approveMember,
    updateAssociationSettings,
    validateMembershipPayment,
    updateMyAssociation
};
