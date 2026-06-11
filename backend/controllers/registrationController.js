const pool = require('../config/db');
const commissionModel = require('../models/commissionModel');
const associationModel = require('../models/associationModel');
const { sendEmail } = require('../utils/emailService');

// US27 & US32: Validation manuelle + Génération de commission
const validatePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const managerId = req.user.id;

        // 1. Récupérer l'inscription (supporte invités sans user_id)
        const [rows] = await pool.execute(`
            SELECT r.*, e.association_id, e.title,
                   COALESCE(u.email, r.guest_email) as email,
                   COALESCE(u.name, r.guest_name) as name
            FROM registrations r
            JOIN events e ON r.event_id = e.id
            LEFT JOIN users u ON r.user_id = u.id
            WHERE r.id = ?
        `, [id]);
        
        const registration = rows[0];
        if (!registration) return res.status(404).json({ message: 'Inscription introuvable.' });

        if (registration.payment_status === 'PAYE') {
            return res.status(400).json({ message: 'Ce paiement a déjà été validé.' });
        }


        // 2. Vérifier que le manager gère bien l'asso
        if (req.user.role !== 'admin') {
            const assoId = await associationModel.getUserAssociationId(managerId);
            if (Number(assoId) !== Number(registration.association_id)) {
                return res.status(403).json({ message: 'Non autorisé.' });
            }
        }

        // 3. Valider le paiement
        await pool.execute("UPDATE registrations SET payment_status = 'PAYE' WHERE id = ?", [id]);


        // 4. US32: Calcul de commission (10%)
        if (registration.price_applied > 0) {
            const rate = 10.00;
            const amount = (registration.price_applied * rate) / 100;
            await commissionModel.createCommission(
                registration.association_id,
                registration.id,
                'event',
                amount,
                rate
            );
        }

        // 5. Envoi d'email de confirmation (seulement si on a un email)
        if (registration.email) {
            const subject = `Paiement confirmé : ${registration.title}`;
            const html = `<h2>Paiement validé</h2><p>Bonjour ${registration.name},</p><p>Votre paiement a été validé par l'association. Votre inscription à l'événement <strong>${registration.title}</strong> est désormais confirmée.</p><p>L'équipe CampusConnect</p>`;
            await sendEmail(registration.email, subject, html);
        }

        res.status(200).json({ message: 'Paiement validé avec succès.' });

    } catch (error) {
        console.error('Erreur validatePayment:', error);
        res.status(500).json({ message: 'Erreur lors de la validation.' });
    }
};

const uploadPaymentProof = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!req.file) {
            return res.status(400).json({ message: 'Aucun fichier téléchargé.' });
        }

        const proofUrl = '/uploads/' + req.file.filename;

        // Mise à jour de la table registrations
        const [result] = await pool.execute(
            'UPDATE registrations SET payment_proof_url = ? WHERE id = ?',
            [proofUrl, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Inscription introuvable.' });
        }

        res.status(200).json({ 
            message: 'Preuve de paiement téléchargée avec succès.',
            proof_url: proofUrl 
        });
    } catch (error) {
        console.error('Erreur uploadPaymentProof:', error);
        res.status(500).json({ message: 'Erreur lors du téléchargement de la preuve.' });
    }
};

module.exports = {
    validatePayment,
    uploadPaymentProof
};
