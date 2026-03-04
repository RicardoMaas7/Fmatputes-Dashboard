const router = require('express').Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const { getAllUsers, getMe, getUserById, createUser, updateUser, deleteUser } = require('../controllers/userController');

router.use(verifyToken);

router.get('/', getAllUsers);
router.get('/me', getMe);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
