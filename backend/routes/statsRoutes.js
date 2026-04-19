const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');

/**
 * @swagger
 * /api/stats/public:
 *   get:
 *     summary: Récupérer les statistiques publiques de la plateforme
 *     description: Retourne le nombre réel d'utilisateurs, d'associations et d'événements (total ce mois-ci).
 *     tags: [Stats]
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users: { type: integer }
 *                 associations: { type: integer }
 *                 eventsThisMonth: { type: integer }
 *                 satisfaction: { type: integer }
 *       500:
 *         description: Erreur serveur.
 */
router.get('/public', statsController.getPublicStats);

module.exports = router;
