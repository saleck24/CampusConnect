const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/registrations/{id}/payment-proof:
 *   post:
 *     summary: Uploader une preuve de paiement (Scénario B MVP)
 *     tags: [Events]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de l'inscription (registration_id)
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payment_proof_url: { type: string }
 *     responses:
 *       200:
 *         description: Preuve envoyée.
 */
router.post('/:id/payment-proof', requireAuth, registrationController.uploadPaymentProof);

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
