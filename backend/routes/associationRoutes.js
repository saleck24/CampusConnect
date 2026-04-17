const express = require('express');
const router = express.Router();
const associationController = require('../controllers/associationController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// === Routes Publiques ===
router.get('/', associationController.getPublicAssociations);
router.get('/:id', associationController.getAssociationDetail);

// === Routes Étudiant (Formulaire demande responsable) ===
// 'upload.single('logo')' écoute le champ nommé "logo" dans le FormData
router.post(
    '/request', 
    requireAuth, 
    upload.single('logo'), 
    associationController.createAssociationRequest
);

// === Routes Admin (Gestion des validations) ===
router.get(
    '/admin/pending', 
    requireAuth, 
    requireRole(['admin']), 
    associationController.getPendingRequests
);

router.post(
    '/admin/handle/:id', 
    requireAuth, 
    requireRole(['admin']), 
    associationController.handleRequest
);

module.exports = router;
