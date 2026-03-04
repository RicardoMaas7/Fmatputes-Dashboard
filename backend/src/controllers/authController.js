const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const register = async (req, res) => {
    try {
        const { username, password, role } = req.body;

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ message: 'El usuario ya está registrado' });
        }

        // Encriptar la contraseña (Salt de 10 rondas)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Crear el usuario
        const newUser = await User.create({
            username,
            password: hashedPassword,
            role: role || 'user'
        });

        res.status(201).json({ 
            message: 'Usuario creado exitosamente', 
            user: { id: newUser.id, username: newUser.username, role: newUser.role } 
        });
    } catch (error) {
        console.error('[Auth Error]', error);
        res.status(500).json({ message: 'Error en el servidor al registrar usuario' });
    }
};

const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Buscar usuario
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        // Comparar contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenciales inválidas' });
        }

        // Generar Token JWT
        const payload = { id: user.id, username: user.username, role: user.role };
        const secret = process.env.JWT_SECRET || 'fmaputes_super_secret_key_2026'; // Idealmente poner en el .env
        const token = jwt.sign(payload, secret, { expiresIn: '8h' });

        res.status(200).json({ token, user: payload });
    } catch (error) {
        console.error('[Auth Error]', error);
        res.status(500).json({ message: 'Error en el servidor al iniciar sesión' });
    }
};

const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Se requieren la contraseña actual y la nueva.' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'La nueva contraseña debe tener al menos 6 caracteres.' });
        }

        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'La contraseña actual es incorrecta.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ message: 'Contraseña actualizada exitosamente.' });
    } catch (error) {
        console.error('[Auth Error]', error);
        res.status(500).json({ message: 'Error al cambiar la contraseña.' });
    }
};

// No olvides exportarlo:
module.exports = { register, login, changePassword };