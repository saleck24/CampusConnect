const associationModel = require('../models/associationModel');
const userModel = require('../models/userModel');
const emailService = require('../utils/emailService');
const pool = require('../config/db');

// --- Côté Public ---

// Obtenir la liste publique
const getPublicAssociations = async (req, res) => {
    try {
        const associations = await associationModel.getAllValidated();
        res.status(200).json(associations);
    } catch (error) {
        console.error('Erreur getPublicAssociations :', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des associations.' });
    }
};

// Obtenir le détail
const getAssociationDetail = async (req, res) => {
    try {
        const id = req.params.id;
        const association = await associationModel.getById(id);
        
        if (!association) {
            return res.status(404).json({ message: 'Association introuvable.' });
        }

        // Si l'utilisateur n'est pas admin ni responsable, 
        // on bloque si l'association n'est pas validée.
        // Ici pour la logique simplifiée: on bloque pour tous si c'est la vue publique
        if (!association.is_validated && (!req.user || req.user.role !== 'admin')) {
             return res.status(403).json({ message: 'Cette association est en cours de validation.' });
        }

        res.status(200).json(association);
    } catch (error) {
        console.error('Erreur getAssociationDetail :', error);
        res.status(500).json({ message: 'Erreur lors de la récupération de l\'association.' });
    }
};

// --- Côté Formulaire (Étudiant -> Responsable) ---

const createAssociationRequest = async (req, res) => {
    try {
        const { name, description, objectives, membership_conditions } = req.body;
        const userId = req.user.id;

        if (!name || !description) {
            return res.status(400).json({ message: 'Le nom et la description sont requis.' });
        }

        let logoUrl = null;
        if (req.file) {
            // Le chemin relatif pour l'accès web
            logoUrl = '/uploads/' + req.file.filename;
        }

        const associationId = await associationModel.create(
            name, 
            description, 
            logoUrl, 
            objectives || null, 
            membership_conditions || null, 
            userId
        );

        // Envoyer une notification par email à l'admin
        // Note: pour ce test, on envoie à une adresse "admin" configurée ou à la volée. 
        // Comme on n'a pas nécessairement un compte "admin" prédéfini, on va envoyer une alerte générique simulée.
        console.log(`[Notification Admin] Nouvelle demande d'association créée: ID ${associationId} par User ${userId}`);

        res.status(201).json({ message: 'Votre demande de création d\'association a bien été envoyée et est en attente de validation par un administrateur.'});
    } catch (error) {
        console.error('Erreur createAssociationRequest :', error);
        res.status(500).json({ message: 'Erreur serveur lors de la demande.' });
    }
};

// --- Côté Panel Admin ---

const getPendingPayments = async (req, res) => {
    try {
        // Retrieve pending payment memberships where status is pending_payment
        const [rows] = await pool.query(`
            SELECT am.id, am.user_id, am.association_id, am.payment_proof_url, am.payment_status, am.status,
                   a.name as association_name, u.email as user_email, u.name as user_name
            FROM association_members am
            JOIN associations a ON am.association_id = a.id
            JOIN users u ON am.user_id = u.id
            WHERE am.status = 'pending_payment'
        `);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Erreur getPendingPayments:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des paiements en attente.' });
    }
};
const getPendingRequests = async (req, res) => {
    try {
        const requests = await associationModel.getPendingRequests();
        res.status(200).json(requests);
    } catch (error) {
        console.error('Erreur getPendingRequests :', error);
        res.status(500).json({ message: 'Erreur serveur lors de la récupération des demandes.' });
    }
};

const handleRequest = async (req, res) => {
    try {
        const { id } = req.params; // Association ID
        const { action, requestor_id, membership_id, motif } = req.body; // action: 'approve' | 'refuse'

        // Récupérer l'email de l'utilisateur de manière sécurisée depuis la DB
        const requestor = await userModel.findById(requestor_id);
        const recipientEmail = requestor ? requestor.email : req.body.requestor_email;

        if (action === 'approve') {
            await associationModel.validateAssociation(id, requestor_id, membership_id);
            
            // Notification
            if (recipientEmail) {
                emailService.sendEmail(
                    recipientEmail, 
                    'Demande d\'association approuvée', 
                    '<p>Félicitations, votre demande d\'association a été validée ! Vous avez désormais le rôle de <strong>Responsable</strong>.</p>'
                );
            }

            res.status(200).json({ message: 'L\'association a été approuvée avec succès.' });

        } else if (action === 'refuse') {
            await associationModel.refuseAssociation(id);

            // Notification avec motif
            if (recipientEmail) {
                emailService.sendEmail(
                    recipientEmail, 
                    'Demande d\'association refusée', 
                    `<p>Désolé, votre demande a été refusée pour le motif suivant :</p><blockquote>${motif || 'Non spécifié'}</blockquote>`
                );
            }

            res.status(200).json({ message: 'La demande a été refusée et supprimée.' });
        } else {
            res.status(400).json({ message: 'Action invalide.' });
        }

    } catch (error) {
         console.error('Erreur handleRequest :', error);
         res.status(500).json({ message: 'Erreur lors du traitement de la demande.' });
    }
}

// Demande d'adhésion par un étudiant
const requestMembership = async (req, res) => {
    try {
        const associationId = req.params.id;
        const userId = req.user.id;
        const result = await associationModel.requestMembership(userId, associationId);
        if (!result) {
            return res.status(400).json({ message: 'Vous avez déjà envoyé une demande ou vous êtes déjà membre.' });
        }
        // If a fee is required, inform the frontend to show the payment modal
        if (result.fee > 0) {
            return res.status(200).json({
                needPayment: true,
                fee: result.fee,
                membershipId: result.insertId,
                message: 'Un paiement est requis pour rejoindre cette association premium.'
            });
        }
        // No payment required, membership becomes active
        return res.status(201).json({ message: 'Adhésion réussie et active.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la demande d\'adhésion.' });
    }
};

// Mettre à niveau une association au plan Premium (Admin uniquement)
const upgradeAssociation = async (req, res) => {
    try {
        const { id } = req.params;
        const premiumUntil = await associationModel.upgradeToPremium(id);
        
        if (!premiumUntil) {
            return res.status(404).json({ message: 'Association introuvable.' });
        }

        // Mise à jour du plan Premium – le paiement a déjà été traité via la preuve
        // Aucune mise à jour de payment_status n'est nécessaire ici.
        // Vous pouvez éventuellement enregistrer la date d'activation du plan Premium.

        // (Optionnel) Envoyer un email au responsable
        const pool = require('../config/db');
        const [members] = await pool.query(
            `SELECT u.email, u.name 
             FROM association_members am
             JOIN users u ON am.user_id = u.id
             WHERE am.association_id = ? AND u.role = 'responsable' AND am.status = 'approved'`,
            [id]
        );
        const manager = members[0];
        if (manager && manager.email) {
            const subject = `Votre association est maintenant Premium !`;
            const htmlContent = `
                <h2>Paiement validé</h2>
                <p>Bonjour ${manager.name},</p>
                <p>Nous avons bien reçu votre paiement. Votre association bénéficie désormais du plan Premium jusqu'au ${new Date(premiumUntil).toLocaleDateString()}.</p>
                <p>Merci pour votre confiance !</p>
            `;
            await emailService.sendEmail(manager.email, subject, htmlContent).catch(console.error);
        }

        res.status(200).json({ 
            message: 'L\'association a été mise à niveau vers Premium avec succès.', 
            premium_until: premiumUntil 
        });
    } catch (error) {
        console.error('Erreur upgradeAssociation:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la mise à niveau.' });
    }
};

const uploadPremiumProof = async (req, res) => {
    try {
        const pool = require('../config/db');
        let membershipId = req.body.membershipId;
        
        if (!membershipId) {
            const [membership] = await pool.query(
                "SELECT id FROM association_members WHERE user_id = ? AND association_id = ?",
                [req.user.id, req.params.id]
            );
            if (membership.length > 0) {
                membershipId = membership[0].id;
            }
        }

        if (!membershipId || !req.file) {
            return res.status(400).json({ message: "Données manquantes ou aucun fichier fourni." });
        }
        
        const proofUrl = `/uploads/${req.file.filename}`;
        
        // Mettre à jour la preuve de paiement dans association_members
        await pool.query(
            `UPDATE association_members 
             SET payment_proof_url = ?, 
                 payment_status = 'pending',
                 status = 'pending_payment' 
             WHERE id = ?`,
            [proofUrl, membershipId]
        );
        res.status(200).json({
            message: "Preuve de paiement envoyée avec succès, en attente de validation.",
            payment_proof_url: proofUrl,
            payment_status: 'pending'
        });
    } catch (error) {
        console.error('Erreur uploadPremiumProof:', error);
        res.status(500).json({ message: "Erreur serveur lors de l'envoi de la preuve." });
    }
};

const setupPremiumExpirationTest = async (req, res) => {
    console.log(">>> [TEST PREMIUM] Configuration de l'expiration Premium pour AEUI (ID: 1)...");
    try {
        const pool = require('../config/db');
        await pool.query(
            "UPDATE associations SET plan = 'premium', premium_until = DATE_SUB(NOW(), INTERVAL 1 DAY) WHERE id = 1"
        );
        res.status(200).json({ message: "AEUI configurée en Premium expiré (premium_until réglé à hier)." });
    } catch (error) {
        console.error(">>> [TEST PREMIUM] Erreur setup :", error);
        res.status(500).json({ message: "Erreur lors de la configuration.", error: error.message });
    }
};

const runPremiumCronTest = async (req, res) => {
    console.log(">>> [TEST PREMIUM] Déclenchement manuel du cron d'expiration...");
    try {
        const pool = require('../config/db');
        const { sendEmail } = require('../utils/emailService');

        // 1. Récupérer les associations premium dont la date est dépassée
        const [expired] = await pool.query(
            "SELECT id, name FROM associations WHERE plan = 'premium' AND premium_until IS NOT NULL AND premium_until < NOW()"
        );

        if (expired.length === 0) {
            return res.status(200).json({ message: "Aucune association Premium n'a expiré actuellement." });
        }

        const reports = [];

        for (const asso of expired) {
            console.log(`>>> [TEST PREMIUM] Traitement : ${asso.name} (ID: ${asso.id})`);
            
            // Rétrograder
            await pool.query(
                "UPDATE associations SET plan = 'free', membership_fee = 0.00 WHERE id = ?",
                [asso.id]
            );

            // Récupérer le responsable
            const [members] = await pool.query(
                `SELECT u.email, u.name 
                 FROM association_members am
                 JOIN users u ON am.user_id = u.id
                 WHERE am.association_id = ? AND u.role = 'responsable' AND am.status = 'approved'`,
                [asso.id]
            );

            const manager = members[0];
            let emailSent = false;
            if (manager && manager.email) {
                const subject = `Votre abonnement Premium sur CampusConnect a expiré`;
                const htmlContent = `
                    <h2>Abonnement Premium expiré</h2>
                    <p>Bonjour ${manager.name},</p>
                    <p>Nous vous informons que l'abonnement Premium pour votre association <strong>${asso.name}</strong> a expiré.</p>
                    <p>Votre association a été repassée en plan gratuit. Pour réactiver le mode Premium et retrouver l'accès complet à vos fonctionnalités avancées, veuillez contacter un administrateur.</p>
                    <p>L'équipe CampusConnect</p>
                `;
                emailSent = await sendEmail(manager.email, subject, htmlContent);
            }
            reports.push({
                association: asso.name,
                id: asso.id,
                managerEmail: manager ? manager.email : 'non trouvé',
                emailStatus: emailSent ? 'envoyé' : 'échec/non requis'
            });
        }

        res.status(200).json({ message: "Traitement de l'expiration Premium terminé.", details: reports });
    } catch (error) {
        console.error(">>> [TEST PREMIUM] Erreur cron test :", error);
        res.status(500).json({ message: "Erreur lors de l'exécution.", error: error.message });
    }
};

module.exports = {
    getPublicAssociations,
    getAssociationDetail,
    createAssociationRequest,
    getPendingRequests,
    handleRequest,
    requestMembership,
    upgradeAssociation,
    uploadPremiumProof,
    setupPremiumExpirationTest,
    runPremiumCronTest
};
