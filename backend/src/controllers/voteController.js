const { Vote, User } = require('../models');
const { sequelize } = require('../config/db');
const { Op } = require('sequelize');
const { runPythonScript } = require('../services/pythonRunner');
const { createNotification } = require('../services/notificationHelper');

// ── Helpers ──────────────────────────────────────────────────────────
const CATEGORIES = ['mathematics', 'programming', 'teamwork', 'discipline', 'sociability'];

/** Returns the current semester period string, e.g. "2026-S1" */
function getCurrentPeriod() {
  const now = new Date();
  const s = now.getMonth() < 6 ? 1 : 2; // S1 = Jan-Jun, S2 = Jul-Dec
  return `${now.getFullYear()}-S${s}`;
}

// ── POST /api/votes — Submit votes (one-time per votee per semester) ─
const submitVotes = async (req, res) => {
  try {
    const voterId = req.user.id;
    const { votes } = req.body; // Array of { voteeId, category, score }

    if (!Array.isArray(votes) || votes.length === 0) {
      return res.status(400).json({ message: 'Votes array is required.' });
    }

    // Validate each vote
    for (const vote of votes) {
      if (!vote.voteeId || !vote.category || vote.score == null) {
        return res.status(400).json({ message: 'Each vote must have voteeId, category, and score.' });
      }
      if (!CATEGORIES.includes(vote.category)) {
        return res.status(400).json({ message: `Invalid category: ${vote.category}` });
      }
      if (vote.score < 1 || vote.score > 10) {
        return res.status(400).json({ message: 'Score must be between 1 and 10.' });
      }
      if (vote.voteeId === voterId) {
        return res.status(400).json({ message: 'You cannot vote for yourself.' });
      }
    }

    const period = getCurrentPeriod();

    // Check which votees have already been voted for this semester
    const voteeIds = [...new Set(votes.map(v => v.voteeId))];
    const existing = await Vote.findAll({
      where: { voterId, period, voteeId: { [Op.in]: voteeIds } },
      attributes: ['voteeId', 'category'],
    });

    // Build set of already-voted votee IDs
    const alreadyVotedSet = new Set(existing.map(v => v.voteeId));

    // Filter out votes for already-voted users
    const newVotes = votes.filter(v => !alreadyVotedSet.has(v.voteeId));

    if (newVotes.length === 0) {
      const names = await User.findAll({
        where: { id: { [Op.in]: [...alreadyVotedSet] } },
        attributes: ['id', 'displayName', 'username'],
      });
      const nameMap = {};
      names.forEach(u => { nameMap[u.id] = u.displayName || u.username; });
      const nameList = [...alreadyVotedSet].map(id => nameMap[id] || id).join(', ');
      return res.status(409).json({
        message: `Ya votaste por: ${nameList} este semestre. Los votos son definitivos.`,
      });
    }

    // Create all votes (no upsert — votes are final)
    const records = await Vote.bulkCreate(
      newVotes.map(v => ({
        voterId,
        voteeId: v.voteeId,
        category: v.category,
        score: v.score,
        period,
      })),
    );

    // Notify new votees only
    const newVoteeIds = [...new Set(newVotes.map(v => v.voteeId))];
    const voter = await User.findByPk(voterId, { attributes: ['displayName', 'username'] });
    const voterName = voter?.displayName || voter?.username || 'Alguien';
    for (const id of newVoteeIds) {
      await createNotification(id, `${voterName} te ha evaluado este semestre.`, 'trophy');
    }

    res.status(201).json({
      message: `${records.length} votos enviados correctamente.`,
      period,
      skipped: alreadyVotedSet.size,
      data: records,
    });
  } catch (error) {
    console.error('[Votes] Error submitting votes:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({ message: 'Ya existe un voto duplicado para este semestre.' });
    }
    res.status(500).json({ message: 'Error submitting votes.' });
  }
};

// GET /api/votes/results/:userId — Get average scores for a user
const getResults = async (req, res) => {
  try {
    const { userId } = req.params;
    const period = req.query.period || getCurrentPeriod();

    const whereClause = { voteeId: userId, period };

    const votes = await Vote.findAll({
      where: whereClause,
      attributes: [
        'category',
        [sequelize.fn('AVG', sequelize.col('score')), 'average'],
        [sequelize.fn('COUNT', sequelize.col('score')), 'voteCount'],
      ],
      group: ['category'],
    });

    const results = {};
    votes.forEach((v) => {
      const data = v.get({ plain: true });
      results[data.category] = {
        average: parseFloat(parseFloat(data.average).toFixed(2)),
        voteCount: parseInt(data.voteCount),
      };
    });

    res.json({ userId, results });
  } catch (error) {
    console.error('[Votes] Error getting results:', error);
    res.status(500).json({ message: 'Error getting vote results.' });
  }
};

// GET /api/votes/pending — Get who the current user still needs to vote for
const getPending = async (req, res) => {
  try {
    const voterId = req.user.id;
    const period = getCurrentPeriod();

    // Get all users except the current one
    const allUsers = await User.findAll({
      where: { id: { [Op.ne]: voterId } },
      attributes: ['id', 'username', 'displayName', 'profilePhotoUrl'],
    });

    // Get existing votes for this voter in this period
    const existingVotes = await Vote.findAll({
      where: { voterId, period },
      attributes: ['voteeId', 'category'],
    });

    // Build map of completed votes
    const votedMap = {};
    existingVotes.forEach((v) => {
      if (!votedMap[v.voteeId]) votedMap[v.voteeId] = [];
      votedMap[v.voteeId].push(v.category);
    });

    const pending = allUsers.map((user) => {
      const userData = user.get({ plain: true });
      const votedCategories = votedMap[userData.id] || [];
      const missingCategories = CATEGORIES.filter((c) => !votedCategories.includes(c));
      const isComplete = missingCategories.length === 0;
      return {
        ...userData,
        votedCategories,
        missingCategories,
        isComplete,
        locked: isComplete, // Once all 5 categories are voted, this member is locked
      };
    });

    const allLocked = pending.length > 0 && pending.every(p => p.locked);

    res.json({
      period,
      totalUsers: allUsers.length,
      completedUsers: pending.filter((p) => p.isComplete).length,
      allLocked, // True when every member has been fully voted
      pending,
    });
  } catch (error) {
    console.error('[Votes] Error getting pending:', error);
    res.status(500).json({ message: 'Error getting pending votes.' });
  }
};

// GET /api/votes/results/:userId/radar — Generate radar SVG for a user
const getRadarSvg = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId, { attributes: ['id', 'username', 'displayName'] });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Get averages
    const period = req.query.period || getCurrentPeriod();
    const whereClause = { voteeId: userId, period };

    const votes = await Vote.findAll({
      where: whereClause,
      attributes: [
        'category',
        [sequelize.fn('AVG', sequelize.col('score')), 'average'],
      ],
      group: ['category'],
    });

    const stats = {
      mathematics: 5,
      programming: 5,
      teamwork: 5,
      discipline: 5,
      sociability: 5,
    };

    votes.forEach((v) => {
      const data = v.get({ plain: true });
      stats[data.category] = parseFloat(parseFloat(data.average).toFixed(2));
    });

    // Build JSON input for Python script
    const pythonInput = JSON.stringify({
      name: user.displayName || user.username,
      stats,
    });

    const parsed = await runPythonScript('radar_stats.py', [pythonInput]);

    res.json({
      userId,
      username: user.username,
      displayName: user.displayName,
      stats,
      svg: parsed.data?.[0]?.svg || parsed.svg || null,
    });
  } catch (error) {
    console.error('[Votes] Error generating radar:', error);
    res.status(500).json({ message: 'Error generating radar chart.' });
  }
};

// GET /api/votes/status — Check if current user's voting is locked for this semester
const getVoteStatus = async (req, res) => {
  try {
    const voterId = req.user.id;
    const period = getCurrentPeriod();

    // Total other users
    const totalUsers = await User.count({ where: { id: { [Op.ne]: voterId } } });

    // Count distinct votees this voter has fully voted (all 5 categories)
    const existingVotes = await Vote.findAll({
      where: { voterId, period },
      attributes: ['voteeId', 'category'],
    });

    const votedMap = {};
    existingVotes.forEach(v => {
      if (!votedMap[v.voteeId]) votedMap[v.voteeId] = new Set();
      votedMap[v.voteeId].add(v.category);
    });

    const completedUsers = Object.values(votedMap).filter(
      cats => cats.size === CATEGORIES.length
    ).length;

    const locked = completedUsers >= totalUsers && totalUsers > 0;

    res.json({
      period,
      totalUsers,
      completedUsers,
      locked,
      message: locked
        ? 'Ya completaste todas las votaciones de este semestre.'
        : `Faltan ${totalUsers - completedUsers} miembros por evaluar.`,
    });
  } catch (error) {
    console.error('[Votes] Error getting status:', error);
    res.status(500).json({ message: 'Error getting vote status.' });
  }
};

module.exports = {
  submitVotes,
  getResults,
  getPending,
  getRadarSvg,
  getVoteStatus,
};
