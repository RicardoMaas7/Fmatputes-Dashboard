const router = require('express').Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const { getAllTransports, createTransport, updateTransport, reserveSeat } = require('../controllers/transportController');

router.use(verifyToken);

router.get('/', getAllTransports);
router.post('/', createTransport);
router.put('/:id', updateTransport);
router.post('/:id/reserve', reserveSeat);

module.exports = router;
