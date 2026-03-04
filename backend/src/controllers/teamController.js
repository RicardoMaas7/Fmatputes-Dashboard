const { Team, TeamMember, User } = require('../models');

// GET /api/teams — All teams with members
const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.findAll({
      include: [
        {
          association: 'creator',
          attributes: ['id', 'username', 'displayName', 'profilePhotoUrl'],
        },
        {
          association: 'members',
          include: [{
            association: 'user',
            attributes: ['id', 'username', 'displayName', 'profilePhotoUrl'],
          }],
        },
      ],
      order: [['name', 'ASC']],
    });
    res.json(teams);
  } catch (error) {
    console.error('[Teams] Error:', error);
    res.status(500).json({ message: 'Error fetching teams.' });
  }
};

// POST /api/teams — Create team
const createTeam = async (req, res) => {
  try {
    const { name, memberIds } = req.body;
    if (!name) return res.status(400).json({ message: 'El nombre es requerido.' });

    const team = await Team.create({ name, createdBy: req.user.id });

    // Always include the creator as a member
    const uniqueIds = [...new Set([req.user.id, ...(memberIds || [])])];
    for (const userId of uniqueIds) {
      await TeamMember.create({ teamId: team.id, userId });
    }

    // Fetch with associations
    const full = await Team.findByPk(team.id, {
      include: [
        { association: 'creator', attributes: ['id', 'username', 'displayName', 'profilePhotoUrl'] },
        { association: 'members', include: [{ association: 'user', attributes: ['id', 'username', 'displayName', 'profilePhotoUrl'] }] },
      ],
    });
    res.status(201).json(full);
  } catch (error) {
    console.error('[Teams] Error creating:', error);
    res.status(500).json({ message: 'Error creating team.' });
  }
};

// PUT /api/teams/:id — Update team (creator or admin)
const updateTeam = async (req, res) => {
  try {
    const team = await Team.findByPk(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found.' });
    if (team.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permiso.' });
    }

    const { name, memberIds } = req.body;
    if (name !== undefined) team.name = name;
    await team.save();

    // Update members if provided
    if (memberIds !== undefined) {
      await TeamMember.destroy({ where: { teamId: team.id } });
      const uniqueIds = [...new Set([team.createdBy, ...memberIds])];
      for (const userId of uniqueIds) {
        await TeamMember.create({ teamId: team.id, userId });
      }
    }

    const full = await Team.findByPk(team.id, {
      include: [
        { association: 'creator', attributes: ['id', 'username', 'displayName', 'profilePhotoUrl'] },
        { association: 'members', include: [{ association: 'user', attributes: ['id', 'username', 'displayName', 'profilePhotoUrl'] }] },
      ],
    });
    res.json(full);
  } catch (error) {
    console.error('[Teams] Error updating:', error);
    res.status(500).json({ message: 'Error updating team.' });
  }
};

// DELETE /api/teams/:id — Delete team (creator or admin)
const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findByPk(req.params.id);
    if (!team) return res.status(404).json({ message: 'Team not found.' });
    if (team.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permiso.' });
    }

    await TeamMember.destroy({ where: { teamId: team.id } });
    await team.destroy();
    res.json({ message: 'Equipo eliminado.' });
  } catch (error) {
    console.error('[Teams] Error deleting:', error);
    res.status(500).json({ message: 'Error deleting team.' });
  }
};

module.exports = { getAllTeams, createTeam, updateTeam, deleteTeam };
