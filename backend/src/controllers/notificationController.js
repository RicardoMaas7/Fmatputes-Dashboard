const { Notification } = require('../models');

// GET /api/notifications — Current user's notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['created_at', 'DESC']],
      limit: 20,
    });
    res.json(notifications);
  } catch (error) {
    console.error('[Notifications] Error:', error);
    res.status(500).json({ message: 'Error fetching notifications.' });
  }
};

// PUT /api/notifications/:id/read — Mark as read
const markAsRead = async (req, res) => {
  try {
    const notif = await Notification.findByPk(req.params.id);
    if (!notif) return res.status(404).json({ message: 'Notification not found.' });
    if (notif.userId !== req.user.id) return res.status(403).json({ message: 'Unauthorized.' });

    notif.isRead = true;
    await notif.save();
    res.json(notif);
  } catch (error) {
    console.error('[Notifications] Error:', error);
    res.status(500).json({ message: 'Error marking notification.' });
  }
};

module.exports = { getNotifications, markAsRead };
