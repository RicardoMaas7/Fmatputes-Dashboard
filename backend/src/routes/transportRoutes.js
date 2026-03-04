const router = require('express').Router();
const { verifyToken, adminOnly } = require('../middlewares/authMiddleware');
const { getAllTransports, createTransport, updateTransport, reserveSeat, cancelSeat } = require('../controllers/transportController');

router.use(verifyToken);

// Lectura + reserva: cualquier usuario autenticado
router.get('/', getAllTransports);
router.post('/:id/reserve', reserveSeat);
router.delete('/:id/cancel', cancelSeat);

// Administración: solo admins
router.post('/', adminOnly, createTransport);
router.put('/:id', adminOnly, updateTransport);

module.exports = router;
