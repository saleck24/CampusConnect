const express = require('express');
const router = express.Router();
const associationController = require('../controllers/associationController');
const associationManagementController = require('../controllers/associationManagementController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// ==========================================
// 1. SPECIFIC (NON-PARAMETERIZED) ROUTES
// ==========================================

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

// Routes temporaires pour tester manuellement le cron d'expiration Premium
router.get('/test/setup-premium-expiration', associationController.setupPremiumExpirationTest);
router.get('/test/run-premium-cron', associationController.runPremiumCronTest);

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
 * /api/associations/my-association:
 *   get:
 *     summary: Détails de l'association gérée (Responsable/Admin)
 *     tags: [Association Management]
 *   put:
 *     summary: "Mettre à jour le profil de l'association (US12)"
 *     tags: [Association Management]
 *     security: [{ bearerAuth: [] }]
 */
router.get(
    '/my-association',
    requireAuth,
    requireRole(['responsable', 'admin']),
    associationManagementController.getMyAssociationDetail
);

router.put(
    '/my-association',
    requireAuth,
    requireRole(['responsable', 'admin']),
    upload.single('logo'),
    associationManagementController.updateMyAssociation
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

/**
 * @swagger
 * /api/associations/my-association/pending-members:
 *   get:
 *     summary: Liste des demandes d'adhésion en attente (Responsable/Admin)
 *     tags: [Association Management]
 */
router.get(
    '/my-association/pending-members',
    requireAuth,
    requireRole(['responsable', 'admin']),
    associationManagementController.getPendingMembers
);

/**
 * @swagger
 * /api/associations/my-association/settings:
 *   put:
 *     summary: "Modifier les paramètres de l'association (Ex: cotisation)"
 *     tags: [Association Management]
 */
router.put(
    '/my-association/settings',
    requireAuth,
    requireRole(['responsable', 'admin']),
    associationManagementController.updateAssociationSettings
);

// ==========================================
// 2. PARAMETERIZED (WILD_CARD) ROUTES
// ==========================================

/**
 * @swagger
 * /api/associations/my-association/members/{userId}/approve:
 *   put:
 *     summary: Approuver une demande d'adhésion (Responsable/Admin)
 *     tags: [Association Management]
 */
router.put(
    '/my-association/members/:userId/approve',
    requireAuth,
    requireRole(['responsable', 'admin']),
    associationManagementController.approveMember
);

/**
 * @swagger
 * /api/associations/my-association/members/{userId}/validate-payment:
 *   put:
 *     summary: Valider le paiement de la cotisation (Responsable/Admin)
 *     tags: [Association Management]
 */
router.put(
    '/my-association/members/:userId/validate-payment',
    requireAuth,
    requireRole(['responsable', 'admin']),
    associationManagementController.validateMembershipPayment
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
 * /api/associations/admin/upgrade/{id}:
 *   post:
 *     summary: Valider le paiement et passer une association au plan premium pour 30 jours (Admin uniquement)
 *     tags: [Admin]
 */
router.post(
    '/admin/upgrade/:id',
    requireAuth,
    requireRole(['admin']),
    associationController.upgradeAssociation
);

/**
 * @swagger
 * /api/associations/{id}/premium-proof:
 *   post:
 *     summary: Uploader la preuve de paiement pour passer au plan Premium
 *     tags: [Associations]
 */
router.post(
    '/:id/premium-proof',
    requireAuth,
    upload.single('proof'),
    associationController.uploadPremiumProof
);


/**
 * @swagger
 * /api/associations/{id}/join:
 *   post:
 *     summary: Demander à rejoindre une association
 *     tags: [Associations]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       201:
 *         description: Demande envoyée.
 *       400:
 *         description: Déjà membre ou demande en cours.
 */
router.post('/:id/join', requireAuth, associationController.requestMembership);

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

module.exports = router;
