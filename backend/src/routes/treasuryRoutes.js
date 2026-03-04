const router = require('express').Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const { getTreasury, registerPayment, updateTreasury } = require('../controllers/treasuryController');

router.use(verifyToken);

router.get('/', getTreasury);
router.put('/', updateTreasury);
router.post('/payment', registerPayment);

module.exports = router;
