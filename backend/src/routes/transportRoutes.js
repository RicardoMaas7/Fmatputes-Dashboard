const router = require('express').Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const { getAllTransports, createTransport, updateTransport, deleteTransport, reserveSeat, cancelSeat, updatePriority } = require('../controllers/transportController');

router.use(verifyToken);

// Lectura + reserva: cualquier usuario autenticado
router.get('/', getAllTransports);
router.post('/:id/reserve', reserveSeat);
router.delete('/:id/cancel', cancelSeat);

// Cualquier usuario puede crear un transporte (se asigna como dueño)
router.post('/', createTransport);

// Solo el dueño o admin puede editar/eliminar
router.put('/:id', updateTransport);
router.delete('/:id', deleteTransport);

// Dueño puede reordenar prioridad de pasajeros
router.put('/:id/priority', updatePriority);

module.exports = router;
