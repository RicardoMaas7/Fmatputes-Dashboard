const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const { User, BankAccount, SharedService, UserServiceDebt } = require('../models');

// GET /api/users — List all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['displayName', 'ASC']],
    });
    res.json(users);
  } catch (error) {
    console.error('[Users] Error:', error);
    res.status(500).json({ message: 'Error al obtener usuarios.' });
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

    if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });
    res.json(user);
  } catch (error) {
    console.error('[Users] Error:', error);
    res.status(500).json({ message: 'Error al obtener datos del usuario.' });
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

    // Auto-assign debts for all active services
    try {
      const activeServices = await SharedService.findAll({ where: { isActive: true } });
      if (activeServices.length > 0) {
        await UserServiceDebt.bulkCreate(
          activeServices.map((s) => ({
            user_id: user.id,
            service_id: s.id,
            pendingBalance: 0,
          }))
        );
      }
    } catch (debtErr) {
      console.error('[Users] Error asignando deudas al nuevo usuario:', debtErr);
    }

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
    const { displayName, birthday, profilePhotoUrl, role } = req.body;

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });

    // Solo admin o el propio usuario pueden actualizar
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ message: 'No autorizado.' });
    }

    if (displayName !== undefined) user.displayName = displayName;
    if (birthday !== undefined) user.birthday = birthday;
    if (profilePhotoUrl !== undefined) user.profilePhotoUrl = profilePhotoUrl;

    // Solo un admin puede cambiar el rol
    if (role !== undefined && req.user.role === 'admin') {
      user.role = role;
    }

    await user.save();

    const { password: _, ...userData } = user.get({ plain: true });
    res.json(userData);
  } catch (error) {
    console.error('[Users] Error actualizando usuario:', error);
    res.status(500).json({ message: 'Error al actualizar usuario.' });
  }
};

// DELETE /api/users/:id — Delete user (admin only, enforced by middleware)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) {
      return res.status(400).json({ message: 'No puedes eliminarte a ti mismo.' });
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });

    await user.destroy();
    res.json({ message: 'Usuario eliminado.' });
  } catch (error) {
    console.error('[Users] Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error al eliminar usuario.' });
  }
};

// POST /api/users/me/photo — Upload profile photo
const uploadPhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se envió ningún archivo.' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });

    // Delete old file if it was a local upload
    if (user.profilePhotoUrl && user.profilePhotoUrl.startsWith('/uploads/')) {
      const oldPath = path.join(__dirname, '../..', user.profilePhotoUrl);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Save relative URL
    const photoUrl = `/uploads/avatars/${req.file.filename}`;
    user.profilePhotoUrl = photoUrl;
    await user.save();

    const { password: _, ...userData } = user.get({ plain: true });
    res.json(userData);
  } catch (error) {
    console.error('[Users] Error uploading photo:', error);
    res.status(500).json({ message: 'Error al subir foto de perfil.' });
  }
};

module.exports = { getAllUsers, getMe, getUserById, createUser, updateUser, deleteUser, uploadPhoto };
