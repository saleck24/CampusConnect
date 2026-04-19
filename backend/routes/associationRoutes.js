const express = require('express');
const router = express.Router();
const associationController = require('../controllers/associationController');
const associationManagementController = require('../controllers/associationManagementController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

/**
 * @swagger
 * /api/associations:
 *   get:
 *     summary: Liste des associations validées
 *     tags: [Associations]
 *     responses:
 *       200:
 *         description: Retourne la liste des associations publiques.
 */
router.get('/', associationController.getPublicAssociations);

/**
 * @swagger
 * /api/associations/{id}:
 *   get:
 *     summary: Détail d'une association
 *     tags: [Associations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Détails de l'association.
 *       404:
 *         description: Association non trouvée.
 */
router.get('/:id', associationController.getAssociationDetail);

/**
 * @swagger
 * /api/associations/request:
 *   post:
 *     summary: Faire une demande de création d'association
 *     tags: [Associations]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               logo: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: Demande envoyée avec succès.
 */
router.post(
    '/request', 
    requireAuth, 
    upload.single('logo'), 
    associationController.createAssociationRequest
);

/**
 * @swagger
 * /api/associations/admin/pending:
 *   get:
 *     summary: Liste des demandes en attente (Admin uniquement)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste des demandes filtrées.
 */
router.get(
    '/admin/pending', 
    requireAuth, 
    requireRole(['admin']), 
    associationController.getPendingRequests
);

/**
 * @swagger
 * /api/associations/admin/handle/{id}:
 *   post:
 *     summary: Valider ou refuser une demande (Admin uniquement)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               action: { type: string, enum: [approve, refuse] }
 *               motif: { type: string }
 *     responses:
 *       200:
 *         description: Action effectuée et mail d'information envoyé.
 */
router.post(
    '/admin/handle/:id', 
    requireAuth, 
    requireRole(['admin']), 
    associationController.handleRequest
);

/**
 * @swagger
 * /api/associations/my-association/members:
 *   get:
 *     summary: Liste des membres de l'association (Responsable/Admin)
 *     tags: [Association Management]
 */
router.get(
    '/my-association/members',
    requireAuth,
    requireRole(['responsable', 'admin']),
    associationManagementController.getAssociationMembers
);

/**
 * @swagger
 * /api/associations/my-association/members/{userId}:
 *   delete:
 *     summary: Révoquer un membre de l'association (Responsable/Admin)
 *     tags: [Association Management]
 */
router.delete(
    '/my-association/members/:userId',
    requireAuth,
    requireRole(['responsable', 'admin']),
    associationManagementController.removeMember
);

/**
 * @swagger
 * /api/associations/my-association/finances:
 *   get:
 *     summary: Journal des transactions et CA (Responsable/Admin)
 *     tags: [Association Management]
 */
router.get(
    '/my-association/finances',
    requireAuth,
    requireRole(['responsable', 'admin']),
    associationManagementController.getAssociationFinances
);

module.exports = router;
