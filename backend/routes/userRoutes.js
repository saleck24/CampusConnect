const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth, requireRole } = require('../middlewares/authMiddleware');

// Toutes ces routes sont réservées aux admins
router.get('/', requireAuth, requireRole(['admin']), userController.getAllUsers);
router.patch('/:id/role', requireAuth, requireRole(['admin']), userController.updateUserRole);
router.patch('/:id/status', requireAuth, requireRole(['admin']), userController.toggleUserStatus);

module.exports = router;
