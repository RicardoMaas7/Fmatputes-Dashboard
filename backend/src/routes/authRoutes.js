const express = require('express');
const router = express.Router();
const { register, login, changePassword, adminResetPassword } = require('../controllers/authController');
const { verifyToken, adminOnly } = require('../middlewares/authMiddleware');
const { loginRules, registerRules, changePasswordRules, resetPasswordRules } = require('../middlewares/validators');

// Público
router.post('/login', loginRules, login);

// Requiere autenticación
router.put('/change-password', verifyToken, changePasswordRules, changePassword);

// Solo administradores
router.post('/register', verifyToken, adminOnly, registerRules, register);
router.put('/reset-password/:userId', verifyToken, adminOnly, resetPasswordRules, adminResetPassword);

module.exports = router;