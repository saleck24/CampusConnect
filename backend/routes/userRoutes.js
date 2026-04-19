const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');

// Toutes ces routes sont réservées aux admins
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Liste complète des utilisateurs (Admin uniquement)
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Liste de tous les inscrits.
 */
router.get('/', requireAuth, requireRole(['admin']), userController.getAllUsers);

/**
 * @swagger
 * /api/users/{id}/role:
 *   patch:
 *     summary: Changer le rôle d'un utilisateur (Admin uniquement)
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
 *               role: { type: string, enum: [invite, etudiant, responsable, admin] }
 *     responses:
 *       200:
 *         description: Rôle mis à jour.
 */
router.patch('/:id/role', requireAuth, requireRole(['admin']), userController.updateUserRole);

/**
 * @swagger
 * /api/users/{id}/status:
 *   patch:
 *     summary: Activer/Désactiver un compte (Admin uniquement)
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
 *               is_active: { type: integer, enum: [0, 1] }
 *     responses:
 *       200:
 *         description: Statut mis à jour.
 */
router.patch('/:id/status', requireAuth, requireRole(['admin']), userController.toggleUserStatus);

module.exports = router;
