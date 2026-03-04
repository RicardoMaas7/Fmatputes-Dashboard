const router = require('express').Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const { getMyAccounts, createAccount, updateAccount, deleteAccount } = require('../controllers/bankAccountController');

router.use(verifyToken);

router.get('/', getMyAccounts);
router.post('/', createAccount);
router.put('/:id', updateAccount);
router.delete('/:id', deleteAccount);

module.exports = router;
