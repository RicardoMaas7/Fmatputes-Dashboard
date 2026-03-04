const bcrypt = require('bcryptjs');
const { User, BankAccount } = require('../models');

// GET /api/users — List all users (admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['displayName', 'ASC']],
    });
    res.json(users);
  } catch (error) {
    console.error('[Users] Error:', error);
    res.status(500).json({ message: 'Error fetching users.' });
  }
};

// GET /api/users/me — Get current user with all related data
const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        { association: 'bankAccounts' },
        { association: 'serviceDebts', include: [{ association: 'service' }] },
        { association: 'transportSeats', include: [{ association: 'transport' }] },
        { association: 'treasuryPayments' },
        { association: 'notifications', limit: 10, order: [['created_at', 'DESC']] },
      ],
    });

    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (error) {
    console.error('[Users] Error:', error);
    res.status(500).json({ message: 'Error fetching user data.' });
  }
};

// GET /api/users/:id — Get a single user's public profile
const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [
        { association: 'bankAccounts' },
      ],
    });
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (error) {
    console.error('[Users] Error:', error);
    res.status(500).json({ message: 'Error fetching user.' });
  }
};

// POST /api/users — Create a new user (admin)
const createUser = async (req, res) => {
  try {
    const { username, password, displayName, birthday, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required.' });
    }

    const existing = await User.findOne({ where: { username } });
    if (existing) return res.status(409).json({ message: 'Username already exists.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      password: hashedPassword,
      displayName: displayName || username,
      birthday,
      role: role || 'user',
    });

    const { password: _, ...userData } = user.get({ plain: true });
    res.status(201).json(userData);
  } catch (error) {
    console.error('[Users] Error creating user:', error);
    res.status(500).json({ message: 'Error creating user.' });
  }
};

// PUT /api/users/:id — Update user (admin or self)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { displayName, birthday, profilePhotoUrl } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Only admin or self can update
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ message: 'Unauthorized.' });
    }

    if (displayName !== undefined) user.displayName = displayName;
    if (birthday !== undefined) user.birthday = birthday;
    if (profilePhotoUrl !== undefined) user.profilePhotoUrl = profilePhotoUrl;

    await user.save();

    const { password: _, ...userData } = user.get({ plain: true });
    res.json(userData);
  } catch (error) {
    console.error('[Users] Error updating user:', error);
    res.status(500).json({ message: 'Error updating user.' });
  }
};

// DELETE /api/users/:id — Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Solo administradores pueden eliminar usuarios.' });
    }

    const { id } = req.params;
    if (id === req.user.id) {
      return res.status(400).json({ message: 'No puedes eliminarte a ti mismo.' });
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    await user.destroy();
    res.json({ message: 'Usuario eliminado.' });
  } catch (error) {
    console.error('[Users] Error deleting user:', error);
    res.status(500).json({ message: 'Error deleting user.' });
  }
};

module.exports = { getAllUsers, getMe, getUserById, createUser, updateUser, deleteUser };
