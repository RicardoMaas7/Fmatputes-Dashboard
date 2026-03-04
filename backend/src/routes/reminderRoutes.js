const router = require('express').Router();
const { verifyToken, adminOnly } = require('../middlewares/authMiddleware');
const {
  getReminders,
  getAllReminders,
  createReminder,
  deleteReminder,
  toggleReminder,
  notifyTeam,
} = require('../controllers/reminderController');

router.use(verifyToken);

// Lectura: cualquier usuario autenticado
router.get('/', getReminders);

// Administración: solo admins
router.get('/all', adminOnly, getAllReminders);
router.post('/', adminOnly, createReminder);
router.put('/:id/toggle', adminOnly, toggleReminder);
router.delete('/:id', adminOnly, deleteReminder);

// Notificar equipo: cualquier usuario autenticado
router.post('/:id/notify-team', notifyTeam);

module.exports = router;
