const router = require('express').Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const { getNotifications, markAsRead } = require('../controllers/notificationController');

router.use(verifyToken);

router.get('/', getNotifications);
router.put('/:id/read', markAsRead);

module.exports = router;
