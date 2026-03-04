const router = require('express').Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const {
  getReminders,
  getAllReminders,
  createReminder,
  deleteReminder,
  toggleReminder,
} = require('../controllers/reminderController');

router.use(verifyToken);

router.get('/', getReminders);
router.get('/all', getAllReminders);
router.post('/', createReminder);
router.put('/:id/toggle', toggleReminder);
router.delete('/:id', deleteReminder);

module.exports = router;
