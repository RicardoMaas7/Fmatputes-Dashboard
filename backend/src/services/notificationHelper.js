const { Notification } = require('../models');

/**
 * Create a notification for a user.
 * @param {string} userId - The user's UUID
 * @param {string} message - Notification text
 * @param {'trophy'|'transport'|'payment'|'general'} type - Notification type
 * @returns {Promise<object>} The created notification
 */
const createNotification = async (userId, message, type = 'general') => {
  try {
    const notif = await Notification.create({ userId, message, type });
    return notif;
  } catch (error) {
    console.error('[NotificationHelper] Error creating notification:', error.message);
    return null;
  }
};

module.exports = { createNotification };
