const router = require('express').Router();
const { verifyToken, adminOnly } = require('../middlewares/authMiddleware');
const { getAllUsers, getMe, getUserById, createUser, updateUser, deleteUser, uploadPhoto } = require('../controllers/userController');
const upload = require('../middlewares/upload');

router.use(verifyToken);

// Rutas accesibles a cualquier usuario autenticado
router.get('/me', getMe);
router.get('/', getAllUsers);
router.get('/:id', getUserById);

// Upload de foto de perfil
router.post('/me/photo', upload.single('photo'), uploadPhoto);

// Rutas restringidas a administradores
router.post('/', adminOnly, createUser);
router.put('/:id', updateUser);       // El controller ya valida admin-or-self
router.delete('/:id', adminOnly, deleteUser);

module.exports = router;
