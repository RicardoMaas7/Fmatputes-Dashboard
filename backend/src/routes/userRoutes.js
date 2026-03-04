const router = require('express').Router();
const { verifyToken, adminOnly } = require('../middlewares/authMiddleware');
const { getAllUsers, getMe, getUserById, createUser, updateUser, deleteUser } = require('../controllers/userController');

router.use(verifyToken);

// Rutas accesibles a cualquier usuario autenticado
router.get('/me', getMe);
router.get('/', getAllUsers);
router.get('/:id', getUserById);

// Rutas restringidas a administradores
router.post('/', adminOnly, createUser);
router.put('/:id', updateUser);       // El controller ya valida admin-or-self
router.delete('/:id', adminOnly, deleteUser);

module.exports = router;
