const express = require('express');
const router = express.Router();
const { register, login, changePassword, adminResetPassword } = require('../controllers/authController');
const { verifyToken, adminOnly } = require('../middlewares/authMiddleware');

// Público
router.post('/login', login);

// Requiere autenticación
router.put('/change-password', verifyToken, changePassword);

// Solo administradores
router.post('/register', verifyToken, adminOnly, register);
router.put('/reset-password/:userId', verifyToken, adminOnly, adminResetPassword);

module.exports = router;