const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { requireAuth } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Soumettre un avis sur la plateforme
 *     description: Seuls les étudiants ayant participé à au moins un événement peuvent soumettre un avis.
 *     tags: [Reviews]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [rating]
 *             properties:
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               comment: { type: string }
 *     responses:
 *       201:
 *         description: Avis créé avec succès.
 *       403:
 *         description: Non autorisé (l'utilisateur n'a participé à aucun événement).
 */
router.post('/', requireAuth, reviewController.submitReview);

module.exports = router;
