const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Catalogue des événements (Futurs/En cours)
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: Liste des événements filtrés par end_date.
 */
router.get('/', eventController.getEvents);

/**
 * @swagger
 * /api/events/detail/{id}:
 *   get:
 *     summary: Détails complets d'un événement
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Détails de l'événement et statut d'inscription.
 */
router.get('/detail/:id', (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (authHeader) {
        requireAuth(req, res, next);
    } else {
        next();
    }
}, eventController.getEventDetail);

/**
 * @swagger
 * /api/events/my-events:
 *   get:
 *     summary: Dashboard organisateur - Liste de ses événements (Passés inclus)
 *     tags: [Events]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des événements créés par l'association de l'utilisateur.
 */
router.get('/my-events', requireAuth, requireRole(['responsable', 'admin']), eventController.getMyEvents);

/**
 * @swagger
 * /api/events/create:
 *   post:
 *     summary: Créer un nouvel événement
 *     tags: [Events]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, date, end_date, location, max_participants]
 *             properties:
 *               title: { type: string }
 *               description: { type: string }
 *               date: { type: string, format: date-time }
 *               end_date: { type: string, format: date-time }
 *               location: { type: string }
 *               max_participants: { type: integer }
 *               is_paid: { type: boolean }
 *     responses:
 *       201:
 *         description: Événement créé.
 *       409:
 *         description: Conflit de salle/créneau.
 */
router.post('/create', requireAuth, requireRole(['responsable', 'admin']), eventController.createEvent);

/**
 * @swagger
 * /api/events/register/{id}:
 *   post:
 *     summary: S'inscrire à un événement
 *     tags: [Events]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       201:
 *         description: Inscription réussie.
 *       400:
 *         description: Complet ou déjà inscrit.
 */
router.post('/register/:id', requireAuth, eventController.registerToEvent);

/**
 * @swagger
 * /api/events/unregister/{id}:
 *   delete:
 *     summary: Se désinscrire d'un événement
 *     tags: [Events]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Désinscription réussie.
 */
router.delete('/unregister/:id', requireAuth, eventController.unregisterFromEvent);

/**
 * @swagger
 * /api/events/{id}/participants:
 *   get:
 *     summary: Voir la liste des inscrits (Propriétaire/Admin uniquement)
 *     tags: [Events]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Liste nominative des participants.
 */
router.get('/:id/participants', requireAuth, eventController.getEventParticipants);

/**
 * @swagger
 * /api/events/{id}:
 *   patch:
 *     summary: Modifier un événement
 *     tags: [Events]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Mis à jour.
 *   delete:
 *     summary: Annuler/Supprimer un événement
 *     tags: [Events]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Annulé.
 */
router.patch('/:id', requireAuth, requireRole(['responsable', 'admin']), eventController.updateEvent);
router.delete('/:id', requireAuth, requireRole(['responsable', 'admin']), eventController.deleteEvent);

module.exports = router;
