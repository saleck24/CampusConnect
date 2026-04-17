const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Route d'inscription
router.post('/register', authController.register);

// Route de login
router.post('/login', authController.login);

// Route de confirmation d'email
router.get('/confirm/:token', authController.confirmEmail);

module.exports = router;
