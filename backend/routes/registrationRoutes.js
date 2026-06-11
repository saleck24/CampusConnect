const express = require('express');
const router = express.Router();
const registrationController = require('../controllers/registrationController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

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

/**
 * @swagger
 * /api/registrations/{id}/proof:
 *   post:
 *     summary: Télécharger une preuve de paiement (Connecté ou Anonyme)
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               proof: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Preuve enregistrée.
 */
router.post('/:id/proof', upload.single('proof'), registrationController.uploadPaymentProof);

module.exports = router;

