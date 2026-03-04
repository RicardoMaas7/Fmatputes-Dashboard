const { Op } = require('sequelize');
const { Reminder, User } = require('../models');

// GET /api/reminders — Get all active reminders (visible to all)
const getReminders = async (req, res) => {
  try {
    const reminders = await Reminder.findAll({
      where: {
        isActive: true,
        [Op.or]: [
          { expiresAt: null },
          { expiresAt: { [Op.gt]: new Date() } },
        ],
      },
      include: [{ association: 'creator', attributes: ['id', 'displayName'] }],
      order: [['created_at', 'DESC']],
    });
    res.json(reminders);
  } catch (error) {
    console.error('[Reminders] Error:', error);
    res.status(500).json({ message: 'Error fetching reminders.' });
  }
};

// GET /api/reminders/all — Get ALL reminders including expired (admin)
const getAllReminders = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Solo administradores.' });
    }
    const reminders = await Reminder.findAll({
      include: [{ association: 'creator', attributes: ['id', 'displayName'] }],
      order: [['created_at', 'DESC']],
    });
    res.json(reminders);
  } catch (error) {
    console.error('[Reminders] Error:', error);
    res.status(500).json({ message: 'Error fetching reminders.' });
  }
};

// POST /api/reminders — Create a reminder (admin only)
const createReminder = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Solo administradores pueden crear recordatorios.' });
    }

    const { title, message, type, expiresAt } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'El título es obligatorio.' });
    }

    const reminder = await Reminder.create({
      title,
      message: message || null,
      type: type || 'info',
      expiresAt: expiresAt || null,
      createdBy: req.user.id,
    });

    res.status(201).json(reminder);
  } catch (error) {
    console.error('[Reminders] Error creating:', error);
    res.status(500).json({ message: 'Error creating reminder.' });
  }
};

// DELETE /api/reminders/:id — Delete a reminder (admin only)
const deleteReminder = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Solo administradores.' });
    }

    const reminder = await Reminder.findByPk(req.params.id);
    if (!reminder) return res.status(404).json({ message: 'Reminder not found.' });

    await reminder.destroy();
    res.json({ message: 'Recordatorio eliminado.' });
  } catch (error) {
    console.error('[Reminders] Error deleting:', error);
    res.status(500).json({ message: 'Error deleting reminder.' });
  }
};

// PUT /api/reminders/:id/toggle — Toggle active state (admin only)
const toggleReminder = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Solo administradores.' });
    }

    const reminder = await Reminder.findByPk(req.params.id);
    if (!reminder) return res.status(404).json({ message: 'Reminder not found.' });

    reminder.isActive = !reminder.isActive;
    await reminder.save();
    res.json(reminder);
  } catch (error) {
    console.error('[Reminders] Error toggling:', error);
    res.status(500).json({ message: 'Error toggling reminder.' });
  }
};

module.exports = { getReminders, getAllReminders, createReminder, deleteReminder, toggleReminder };
