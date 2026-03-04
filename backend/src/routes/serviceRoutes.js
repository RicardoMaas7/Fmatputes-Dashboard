const router = require('express').Router();
const { verifyToken, adminOnly } = require('../middlewares/authMiddleware');
const { createServiceRules } = require('../middlewares/validators');
const { getAllServices, createService, updateService, deleteService, getServiceDebts, updateServiceDebt } = require('../controllers/serviceController');

router.use(verifyToken);

// Lectura: cualquier usuario autenticado
router.get('/', getAllServices);

// Escritura: solo administradores
router.post('/', adminOnly, createServiceRules, createService);
router.put('/:id', adminOnly, updateService);
router.delete('/:id', adminOnly, deleteService);
router.get('/:id/debts', adminOnly, getServiceDebts);
router.put('/:id/debts/:userId', adminOnly, updateServiceDebt);

module.exports = router;
