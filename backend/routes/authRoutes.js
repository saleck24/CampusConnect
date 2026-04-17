const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Inscrire un nouvel utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       201:
 *         description: Utilisateur créé, email de confirmation envoyé.
 *       400:
 *         description: Email déjà utilisé.
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Se connecter à l'application
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Connexion réussie, retourne le token JWT et les infos utilisateur.
 *       401:
 *         description: Identifiants invalides ou compte non activé.
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/confirm/{token}:
 *   get:
 *     summary: Confirmer un compte par lien email
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Compte activé avec succès.
 *       400:
 *         description: Token invalide ou expiré.
 */
router.get('/confirm/:token', authController.confirmEmail);

module.exports = router;
