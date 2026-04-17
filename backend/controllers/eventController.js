const eventModel = require('../models/eventModel');
const associationModel = require('../models/associationModel');

// Détail complet d'un événement (pour la page EventDetail)
const getEventDetail = async (req, res) => {
    try {
        const eventId = req.params.id;
        const event = await eventModel.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Événement introuvable.' });

        const registrationCount = await eventModel.getRegistrationCount(eventId);
        let isRegistered = false;
        if (req.user) {
            isRegistered = await eventModel.isUserRegistered(req.user.id, eventId);
        }

        res.status(200).json({ event, registrationCount, isRegistered });
    } catch (error) {
        console.error('Erreur getEventDetail:', error);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

// Liste publique des événements (futurs/en cours uniquement)
const getEvents = async (req, res) => {
    try {
        const events = await eventModel.findAll();
        res.status(200).json(events);
    } catch (error) {
        console.error('Erreur getEvents:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des événements.' });
    }
};

// Liste complète pour Admin/Responsable (tous les eventos, passés inclus)
const getMyEvents = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        let events;

        if (userRole === 'admin') {
            events = await eventModel.findAll_admin();
        } else {
            // Responsable : seulement les événements de son association
            const associationId = await associationModel.getUserAssociationId(userId);
            if (!associationId) {
                return res.status(200).json([]); // Pas encore de asso validée
            }
            events = await eventModel.findByAssociation(associationId);
        }

        res.status(200).json(events);
    } catch (error) {
        console.error('Erreur getMyEvents:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération.' });
    }
};

// Création d'événement (Responsable uniquement)
const createEvent = async (req, res) => {
    try {
        const { title, description, date, end_date, location, max_participants, is_paid, guest_price, member_price } = req.body;
        const userId = req.user.id;

        // 1. Trouver l'id de l'association pour ce responsable
        const associationId = await associationModel.getUserAssociationId(userId);
        if (!associationId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Vous n\'êtes responsable d\'aucune association validée.' });
        }

        // Si admin, il peut créer pour une asso spécifique passée en body (optionnel pour l'instant)
        const finalAssoId = associationId || req.body.association_id;

        // 2. Vérifier les conflits de salle (US05)
        const conflict = await eventModel.checkConflict(location, date, end_date);
        if (conflict) {
            return res.status(409).json({ 
                message: `Conflit de salle : Un événement ("${conflict.title}") occupe déjà cette salle sur ce créneau.` 
            });
        }

        // 3. Créer l'événement
        const eventId = await eventModel.create({
            association_id: finalAssoId,
            title,
            description,
            date,
            end_date,
            location,
            max_participants,
            is_paid,
            guest_price,
            member_price
        });

        res.status(201).json({ message: 'Événement créé avec succès.', eventId });
    } catch (error) {
        console.error('Erreur createEvent:', error);
        res.status(500).json({ message: 'Erreur serveur lors de la création de l\'événement.' });
    }
};

// Inscription à un événement (Étudiant/Responsable/Admin connecté)
const registerToEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.user.id;

        const event = await eventModel.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Événement introuvable.' });
        }

        // 1. Vérifier si déjà inscrit
        const alreadyRegistered = await eventModel.isUserRegistered(userId, eventId);
        if (alreadyRegistered) {
            return res.status(400).json({ message: 'Vous êtes déjà inscrit à cet événement.' });
        }

        // 2. Vérifier la capacité (US04)
        const currentRegistrations = await eventModel.getRegistrationCount(eventId);
        if (event.max_participants && currentRegistrations >= event.max_participants) {
            return res.status(400).json({ message: 'Désolé, cet événement est complet.' });
        }

        // 3. Procéder à l'inscription (Logique gratuite pour l'instant)
        // Note: Si c'est payant, ici on devrait gérer l'état 'pending' du paiement
        await eventModel.register(userId, eventId, event.is_paid ? event.guest_price : 0);

        res.status(201).json({ message: 'Inscription réussie !' });
    } catch (error) {
        console.error('Erreur registerToEvent:', error);
        res.status(500).json({ message: 'Erreur lors de l\'inscription.' });
    }
};

const getEventParticipants = async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.user.id;
        const userRole = req.user.role;

        const event = await eventModel.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Événement introuvable.' });
        }

        // Vérification des droits : Admin OU Responsable de l'association organisatrice
        if (userRole !== 'admin') {
            const userAssoId = await associationModel.getUserAssociationId(userId);
            if (!userAssoId || Number(userAssoId) !== Number(event.association_id)) {
                return res.status(403).json({ message: 'Accès refusé. Vous n\'êtes pas le responsable de cette association.' });
            }
        }

        const participants = await eventModel.getParticipants(eventId);
        res.status(200).json(participants);
    } catch (error) {
        console.error('Erreur getEventParticipants:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération de la liste.' });
    }
};

const unregisterFromEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const userId = req.user.id;
        const ok = await eventModel.isUserRegistered(userId, eventId);
        if (!ok) return res.status(400).json({ message: "Vous n'êtes pas inscrit à cet événement." });
        await eventModel.unregister(userId, eventId);
        res.status(200).json({ message: 'Désinscription réussie.' });
    } catch (error) {
        console.error('Erreur unregisterFromEvent:', error);
        res.status(500).json({ message: 'Erreur lors de la désinscription.' });
    }
};

const updateEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const event = await eventModel.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Événement introuvable.' });

        if (req.user.role !== 'admin') {
            const assoId = await associationModel.getUserAssociationId(req.user.id);
            if (Number(assoId) !== Number(event.association_id)) {
                return res.status(403).json({ message: 'Non autorisé.' });
            }
        }

        const conflict = await eventModel.checkConflict(req.body.location, req.body.date, req.body.end_date);
        if (conflict && conflict.id !== Number(eventId)) {
            return res.status(409).json({ message: `Conflit de salle : "${conflict.title}" occupe déjà ce créneau.` });
        }

        await eventModel.update(eventId, req.body);
        res.status(200).json({ message: 'Événement mis à jour.' });
    } catch (error) {
        console.error('Erreur updateEvent:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour.' });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const event = await eventModel.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Événement introuvable.' });

        if (req.user.role !== 'admin') {
            const assoId = await associationModel.getUserAssociationId(req.user.id);
            if (Number(assoId) !== Number(event.association_id)) {
                return res.status(403).json({ message: 'Non autorisé.' });
            }
        }

        await eventModel.softDelete(eventId);
        res.status(200).json({ message: 'Événement annulé.' });
    } catch (error) {
        console.error('Erreur deleteEvent:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression.' });
    }
};

module.exports = {
    getEvents,
    getMyEvents,
    getEventDetail,
    createEvent,
    registerToEvent,
    unregisterFromEvent,
    updateEvent,
    deleteEvent,
    getEventParticipants
};
