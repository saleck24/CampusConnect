const associationModel = require('../models/associationModel');
const emailService = require('../utils/emailService');

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

        if (action === 'approve') {
            await associationModel.validateAssociation(id, requestor_id, membership_id);
            
            // Notification
            emailService.sendEmail(
                req.body.requestor_email, 
                'Demande d\'association approuvée', 
                '<p>Félicitations, votre demande d\'association a été validée ! Vous avez désormais le rôle de <strong>Responsable</strong>.</p>'
            );

            res.status(200).json({ message: 'L\'association a été approuvée avec succès.' });

        } else if (action === 'refuse') {
            await associationModel.refuseAssociation(id);

            // Notification avec motif
            emailService.sendEmail(
                req.body.requestor_email, 
                'Demande d\'association refusée', 
                `<p>Désolé, votre demande a été refusée pour le motif suivant :</p><blockquote>${motif || 'Non spécifié'}</blockquote>`
            );

            res.status(200).json({ message: 'La demande a été refusée et supprimée.' });
        } else {
            res.status(400).json({ message: 'Action invalide.' });
        }

    } catch (error) {
         console.error('Erreur handleRequest :', error);
         res.status(500).json({ message: 'Erreur lors du traitement de la demande.' });
    }
}

module.exports = {
    getPublicAssociations,
    getAssociationDetail,
    createAssociationRequest,
    getPendingRequests,
    handleRequest
};
