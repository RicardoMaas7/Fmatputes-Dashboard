const router = require('express').Router();
const { verifyToken, adminOnly } = require('../middlewares/authMiddleware');
const { registerPaymentRules } = require('../middlewares/validators');
const { getTreasury, registerPayment, updateTreasury } = require('../controllers/treasuryController');

router.use(verifyToken);

// Lectura: cualquier usuario autenticado
router.get('/', getTreasury);

// Escritura: solo administradores
router.put('/', adminOnly, updateTreasury);
router.post('/payment', adminOnly, registerPaymentRules, registerPayment);

module.exports = router;
