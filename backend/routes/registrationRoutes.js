const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/registrations/{id}/validate:
 *   put:
 *     summary: Valider manuellement un paiement (Responsable/Admin)
 *     tags: [Events]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'inscription (registration_id)
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Paiement validé et commission générée.
 */
router.put('/:id/validate', requireAuth, requireRole(['responsable', 'admin']), registrationController.validatePayment);

module.exports = router;
