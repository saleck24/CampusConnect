const express = require('express');
const router = express.Router();
const sponsorController = require('../controllers/sponsorController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Route publique : récupérer les sponsors actifs
router.get('/active', sponsorController.getActiveSponsors);
router.post('/contact', sponsorController.contactAdmin);

// Routes administratives
router.get('/', requireAuth, requireRole(['admin']), sponsorController.getAllSponsors);
router.post('/', requireAuth, requireRole(['admin']), upload.single('logo'), sponsorController.createSponsor);
router.put('/:id', requireAuth, requireRole(['admin']), upload.single('logo'), sponsorController.updateSponsor);
router.delete('/:id', requireAuth, requireRole(['admin']), sponsorController.deleteSponsor);

module.exports = router;
