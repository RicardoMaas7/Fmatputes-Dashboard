const router = require('express').Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const { getAllServices, createService, updateService, deleteService, getServiceDebts, updateServiceDebt } = require('../controllers/serviceController');

router.use(verifyToken);

router.get('/', getAllServices);
router.post('/', createService);
router.put('/:id', updateService);
router.delete('/:id', deleteService);
router.get('/:id/debts', getServiceDebts);
router.put('/:id/debts/:userId', updateServiceDebt);

module.exports = router;
