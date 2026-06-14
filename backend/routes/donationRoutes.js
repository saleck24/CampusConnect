const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// ===== IMPORTANT: routes statiques avant les routes dynamiques =====

// ===== ROUTES RESPONSABLE (statiques) =====
// Consulter les dons reçus par son association
router.get('/my-asso', requireAuth, requireRole(['responsable']), donationController.getMyAssoDonations);

// Consulter les cotisations récurrentes des membres
router.get('/my-asso/contributions', requireAuth, requireRole(['responsable']), donationController.getMyAssoContributions);

// Créer des cotisations pour un mois donné
router.post('/my-asso/contributions', requireAuth, requireRole(['responsable']), donationController.createContribution);

// Valider le paiement d'une cotisation
router.put('/contributions/:id/validate', requireAuth, requireRole(['responsable']), donationController.validateContribution);

// Valider la réception d'un don
router.put('/:id/validate', requireAuth, requireRole(['responsable']), donationController.validateDonation);

// ===== ROUTES PUBLIQUES (dynamiques en dernier) =====
// Soumettre un don vers une association (avec preuve optionnelle)
router.post('/:assoId', upload.single('proof'), donationController.submitDonation);

module.exports = router;
