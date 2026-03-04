const { Op } = require('sequelize');
const { Reminder, User, Team, TeamMember } = require('../models');
const { createNotification } = require('../services/notificationHelper');

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

// GET /api/reminders/all — Get ALL reminders including expired (admin, enforced by middleware)
const getAllReminders = async (req, res) => {
  try {
    const reminders = await Reminder.findAll({
      include: [{ association: 'creator', attributes: ['id', 'displayName'] }],
      order: [['created_at', 'DESC']],
    });
    res.json(reminders);
  } catch (error) {
    console.error('[Reminders] Error:', error);
    res.status(500).json({ message: 'Error al obtener recordatorios.' });
  }
};

// POST /api/reminders — Create a reminder (admin, enforced by middleware)
const createReminder = async (req, res) => {
  try {
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

// DELETE /api/reminders/:id — Delete a reminder (admin, enforced by middleware)
const deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findByPk(req.params.id);
    if (!reminder) return res.status(404).json({ message: 'Recordatorio no encontrado.' });

    await reminder.destroy();
    res.json({ message: 'Recordatorio eliminado.' });
  } catch (error) {
    console.error('[Reminders] Error eliminando:', error);
    res.status(500).json({ message: 'Error al eliminar recordatorio.' });
  }
};

// PUT /api/reminders/:id/toggle — Toggle active state (admin, enforced by middleware)
const toggleReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findByPk(req.params.id);
    if (!reminder) return res.status(404).json({ message: 'Recordatorio no encontrado.' });

    reminder.isActive = !reminder.isActive;
    await reminder.save();
    res.json(reminder);
  } catch (error) {
    console.error('[Reminders] Error alternando:', error);
    res.status(500).json({ message: 'Error al alternar recordatorio.' });
  }
};

// POST /api/reminders/:id/notify-team — Send reminder as notification to all members of a team
const notifyTeam = async (req, res) => {
  try {
    const { teamId } = req.body;
    if (!teamId) return res.status(400).json({ message: 'teamId es obligatorio.' });

    const reminder = await Reminder.findByPk(req.params.id);
    if (!reminder) return res.status(404).json({ message: 'Recordatorio no encontrado.' });

    const members = await TeamMember.findAll({ where: { teamId } });
    if (!members.length) return res.status(404).json({ message: 'El equipo no tiene miembros.' });

    const notifPromises = members.map((m) =>
      createNotification(m.userId, `📅 Recordatorio: ${reminder.title}${reminder.message ? ' — ' + reminder.message : ''}`, 'general')
    );
    await Promise.all(notifPromises);

    res.json({ message: `Notificación enviada a ${members.length} miembro(s).`, count: members.length });
  } catch (error) {
    console.error('[Reminders] Error notifying team:', error);
    res.status(500).json({ message: 'Error al notificar al equipo.' });
  }
};

module.exports = { getReminders, getAllReminders, createReminder, deleteReminder, toggleReminder, notifyTeam };
