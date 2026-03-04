const router = require('express').Router();
const { verifyToken, adminOnly } = require('../middlewares/authMiddleware');
const { createServiceRules } = require('../middlewares/validators');
const { getAllServices, createService, updateService, deleteService, markServicePaid, getServiceDebts, updateServiceDebt } = require('../controllers/serviceController');

router.use(verifyToken);

// Lectura: cualquier usuario autenticado
router.get('/', getAllServices);

// Crear servicio: cualquier usuario autenticado
router.post('/', createServiceRules, createService);

// Editar/Eliminar: creator o admin (validación en controller)
router.put('/:id', updateService);
router.delete('/:id', deleteService);

// Marcar como pagado (usuario actual)
router.post('/:id/mark-paid', markServicePaid);

// Deudas: creator o admin (validación en controller)
router.get('/:id/debts', getServiceDebts);
router.put('/:id/debts/:userId', updateServiceDebt);

module.exports = router;
