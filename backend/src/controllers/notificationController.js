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
    res.status(500).json({ message: 'Error al obtener notificaciones.' });
  }
};

// PUT /api/notifications/:id/read — Mark one as read
const markAsRead = async (req, res) => {
  try {
    const notif = await Notification.findByPk(req.params.id);
    if (!notif) return res.status(404).json({ message: 'Notificación no encontrada.' });
    if (notif.userId !== req.user.id) return res.status(403).json({ message: 'No autorizado.' });

    notif.isRead = true;
    await notif.save();
    res.json(notif);
  } catch (error) {
    console.error('[Notifications] Error:', error);
    res.status(500).json({ message: 'Error al marcar notificación.' });
  }
};

// PUT /api/notifications/read-all — Mark all as read for current user
const markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { userId: req.user.id, isRead: false } }
    );
    res.json({ message: 'Todas las notificaciones marcadas como leídas.' });
  } catch (error) {
    console.error('[Notifications] Error:', error);
    res.status(500).json({ message: 'Error al marcar notificaciones.' });
  }
};

module.exports = { getNotifications, markAsRead, markAllAsRead };
