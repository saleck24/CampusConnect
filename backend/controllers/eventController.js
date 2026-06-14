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
        let registration = null;
        if (req.user) {
            const pool = require('../config/db');
            const [regRows] = await pool.execute(
                'SELECT * FROM registrations WHERE user_id = ? AND event_id = ?',
                [req.user.id, eventId]
            );
            if (regRows.length > 0) {
                isRegistered = true;
                registration = regRows[0];
            }
        }

        res.status(200).json({ event, registrationCount, isRegistered, registration });
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

        // --- US31 : Restrictions Plan Freemium ---
        const association = await associationModel.getById(finalAssoId);
        if (association && association.plan === 'free') {
            // Règle 1 : Événements payants interdits
            if (is_paid === true || is_paid === 'true' || is_paid === 1) {
                return res.status(403).json({ message: 'Les événements payants sont réservés au plan Premium.' });
            }
            // Règle 2 : Maximum 2 événements par mois
            const eventsCount = await eventModel.countEventsThisMonth(finalAssoId);
            if (eventsCount >= 2) {
                return res.status(403).json({ message: 'Limite atteinte : Le plan Gratuit autorise un maximum de 2 événements par mois.' });
            }
        }
        // -----------------------------------------

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

// Inscription à un événement — connecté OU visiteur anonyme
const registerToEvent = async (req, res) => {
    try {
        const eventId = req.params.id;

        const event = await eventModel.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Événement introuvable.' });
        }

        // 1. Vérifier la capacité
        const currentRegistrations = await eventModel.getRegistrationCount(eventId);
        if (event.max_participants && currentRegistrations >= event.max_participants) {
            return res.status(400).json({ message: 'Désolé, cet événement est complet.' });
        }

        // -----------------------------------------------
        // CAS A : Utilisateur connecté (JWT valide)
        // -----------------------------------------------
        if (req.user) {
            const userId = req.user.id;

            const alreadyRegistered = await eventModel.isUserRegistered(userId, eventId);
            if (alreadyRegistered) {
                return res.status(400).json({ message: 'Vous êtes déjà inscrit à cet événement.' });
            }

            // Tarif : membre de l'association → member_price, sinon guest_price
            const associationId = await associationModel.getUserAssociationId(userId);
            const isMember = associationId && Number(associationId) === Number(event.association_id);
            let price = event.is_paid
                ? (isMember ? event.member_price : event.guest_price)
                : 0;

            // Réduction de 20% pour les 10 premiers inscrits aux événements payants (retour prof/choix utilisateur)
            if (event.is_paid && currentRegistrations < 10) {
                price = Number((price * 0.8).toFixed(2));
            }

            const registrationId = await eventModel.register({ user_id: userId, event_id: eventId, price });

            // Envoyer un mail de confirmation d'inscription
            const { sendEmail } = require('../utils/emailService');
            const dateStr = new Date(event.date).toLocaleString('fr-FR');
            const subject = `Confirmation d'inscription : ${event.title}`;
            const htmlContent = `
                <h2>Confirmation d'inscription</h2>
                <p>Bonjour ${req.user.name},</p>
                <p>Votre inscription à l'événement <strong>${event.title}</strong> a été enregistrée avec succès.</p>
                <p><strong>Date :</strong> ${dateStr}<br>
                <strong>Lieu :</strong> ${event.location || 'Non spécifié'}</p>
                <p>L'équipe CampusConnect</p>
            `;
            await sendEmail(req.user.email, subject, htmlContent);

            return res.status(201).json({ message: 'Inscription réussie !', registrationId });
        }

        // -----------------------------------------------
        // CAS B : Visiteur anonyme (sans compte)
        // -----------------------------------------------
        const { guest_name, guest_email, guest_phone } = req.body;

        if (!guest_name || !guest_email) {
            return res.status(400).json({ message: 'Les champs guest_name et guest_email sont requis pour s\'inscrire sans compte.' });
        }

        // Vérifier double inscription par email
        const alreadyGuestRegistered = await eventModel.isGuestRegistered(guest_email, eventId);
        if (alreadyGuestRegistered) {
            return res.status(400).json({ message: 'Cette adresse email est déjà inscrite à cet événement.' });
        }

        // Un visiteur paie toujours le tarif invité (guest_price)
        let price = event.is_paid ? event.guest_price : 0;

        // Réduction de 20% pour les 10 premiers inscrits aux événements payants (retour proof/choix utilisateur)
        if (event.is_paid && currentRegistrations < 10) {
            price = Number((price * 0.8).toFixed(2));
        }

        const registrationId = await eventModel.register({ user_id: null, event_id: eventId, price, guest_name, guest_email, guest_phone });

        // Envoyer un mail de confirmation d'inscription
        const { sendEmail } = require('../utils/emailService');
        const dateStr = new Date(event.date).toLocaleString('fr-FR');
        const subject = `Confirmation d'inscription : ${event.title}`;
        const htmlContent = `
            <h2>Confirmation d'inscription</h2>
            <p>Bonjour ${guest_name},</p>
            <p>Votre inscription à l'événement <strong>${event.title}</strong> en tant qu'invité a été enregistrée avec succès.</p>
            <p><strong>Date :</strong> ${dateStr}<br>
            <strong>Lieu :</strong> ${event.location || 'Non spécifié'}</p>
            <p>L'équipe CampusConnect</p>
        `;
        await sendEmail(guest_email, subject, htmlContent);

        return res.status(201).json({ message: 'Inscription réussie en tant qu\'invité !', registrationId });

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

        const checkLocation = req.body.location !== undefined ? req.body.location : event.location;
        const checkDate = req.body.date !== undefined ? req.body.date : event.date;
        const checkEndDate = req.body.end_date !== undefined ? req.body.end_date : event.end_date;

        if (req.body.location !== undefined || req.body.date !== undefined || req.body.end_date !== undefined) {
            const conflict = await eventModel.checkConflict(checkLocation, checkDate, checkEndDate);
            if (conflict && conflict.id !== Number(eventId)) {
                return res.status(409).json({ message: `Conflit de salle : "${conflict.title}" occupe déjà ce créneau.` });
            }
        }

        await eventModel.update(eventId, req.body);

        // --- US25 : Envoi d'email de modification ---
        const { sendEmail } = require('../utils/emailService');
        const participants = await eventModel.getParticipants(eventId);
        if (participants && participants.length > 0) {
            for (const p of participants) {
                const subject = `Modification : L'événement "${event.title}" a été mis à jour`;
                const htmlContent = `
                    <h2>Modification d'événement</h2>
                    <p>Bonjour ${p.name},</p>
                    <p>L'événement <strong>${event.title}</strong> auquel vous êtes inscrit a été modifié par l'organisateur.</p>
                    <p>Veuillez consulter la plateforme pour voir les nouvelles informations (date, lieu, etc.).</p>
                    <p>L'équipe CampusConnect</p>
                `;
                await sendEmail(p.email, subject, htmlContent);
            }
        }

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

        // --- US25 : Envoi d'email d'annulation ---
        const { sendEmail } = require('../utils/emailService');
        const participants = await eventModel.getParticipants(eventId);
        if (participants && participants.length > 0) {
            for (const p of participants) {
                const subject = `ANNULATION : L'événement "${event.title}" est annulé`;
                const htmlContent = `
                    <h2>Annulation d'événement</h2>
                    <p>Bonjour ${p.name},</p>
                    <p>Nous vous informons avec regret que l'événement <strong>${event.title}</strong> a été annulé par l'organisateur.</p>
                    <p>Si vous aviez procédé à un paiement, veuillez contacter l'association organisatrice.</p>
                    <p>L'équipe CampusConnect</p>
                `;
                await sendEmail(p.email, subject, htmlContent);
            }
        }

        res.status(200).json({ message: 'Événement annulé.' });
    } catch (error) {
        console.error('Erreur deleteEvent:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression.' });
    }
};

const getFeaturedEvents = async (req, res) => {
    try {
        const events = await eventModel.findFeatured();
        res.status(200).json(events);
    } catch (error) {
        console.error('Erreur getFeaturedEvents:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des événements à la une.' });
    }
};

const runReminderCronTest = async (req, res) => {
    console.log('>>> [TEST CRON] Déclenchement manuel du rappel d\'événements...');
    try {
        // Pour les tests, on élargit la recherche des événements commençant entre -24h et 24h
        const upcomingEvents = await eventModel.findEventsStartingBetween(-24, 24);

        if (upcomingEvents.length === 0) {
            return res.status(200).json({ message: "Aucun événement trouvé commençant entre -24h et +24h." });
        }

        const reports = [];
        const { sendEmail } = require('../utils/emailService');

        for (const event of upcomingEvents) {
            const participants = await eventModel.getParticipants(event.id);
            if (participants.length > 0) {
                const date = new Date(event.date).toLocaleString('fr-FR');
                
                for (const p of participants) {
                    const subject = `Rappel : L'événement "${event.title}" approche !`;
                    const htmlContent = `
                        <h2>Rappel d'événement</h2>
                        <p>Bonjour ${p.name},</p>
                        <p>Ceci est un rappel automatique pour l'événement <strong>${event.title}</strong> auquel vous êtes inscrit.</p>
                        <p><strong>Date :</strong> ${date}<br>
                        <strong>Lieu :</strong> ${event.location || 'Non spécifié'}</p>
                        <p>À très bientôt sur CampusConnect !</p>
                    `;
                    const sent = await sendEmail(p.email, subject, htmlContent);
                    reports.push({ event: event.title, email: p.email, status: sent ? 'success' : 'failed' });
                }
            }
        }
        res.status(200).json({ message: "Rappels de test traités.", details: reports });
    } catch (error) {
        console.error('>>> [TEST CRON] Erreur :', error);
        res.status(500).json({ message: "Erreur lors du rappel de test.", error: error.message });
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
    getEventParticipants,
    getFeaturedEvents,
    runReminderCronTest
};

