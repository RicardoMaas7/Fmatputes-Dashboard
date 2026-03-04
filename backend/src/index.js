const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar configuración de BD y Modelos (centralizado con asociaciones)
const { connectDB, sequelize } = require('./config/db');
const models = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración estricta de Arquitectura (Nginx / Cloudflare Proxy)
app.set('trust proxy', 1); 

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint de Healthcheck
app.get('/api/health', (req, res) => {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    res.status(200).json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        client_ip: clientIp,
        message: 'Fmaputes API operando correctamente.'
    });
});
// Rutas de autenticación
app.use('/api/auth', require('./routes/authRoutes'));

// Registrar rutas de estadísticas (legacy, kept for compatibility)
app.use('/api/stats', require('./routes/statsRoutes'));

// Rutas de usuarios
app.use('/api/users', require('./routes/userRoutes'));

// Rutas de votación
app.use('/api/votes', require('./routes/voteRoutes'));

// Rutas de servicios compartidos
app.use('/api/services', require('./routes/serviceRoutes'));

// Rutas de transporte
app.use('/api/transport', require('./routes/transportRoutes'));

// Rutas de tesorería
app.use('/api/treasury', require('./routes/treasuryRoutes'));

// Rutas de notificaciones
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Rutas de cuentas bancarias
app.use('/api/bank-accounts', require('./routes/bankAccountRoutes'));

// Rutas de recordatorios
app.use('/api/reminders', require('./routes/reminderRoutes'));

// Inicialización del servidor y Base de Datos
const startServer = async () => {
    await connectDB();
    
    // Sincroniza los modelos con la BD (crea las tablas si no existen)
    // Nota: force: false evita que se borren los datos en cada reinicio
    await sequelize.sync({ force: false }); 
    console.log('[Base de Datos] Modelos sincronizados correctamente.');

    // Auto-seed: populate initial data if database is empty
    const { User } = models;
    const userCount = await User.count();
    if (userCount === 0) {
        console.log('[Auto-Seed] No users found — running initial seed...');
        try {
            const bcrypt = require('bcryptjs');
            const defaultPassword = await bcrypt.hash('fmaputes2026', 10);

            const members = [
                { username: 'esteban', displayName: 'Esteban', birthday: '2003-05-15', role: 'admin' },
                { username: 'christopher', displayName: 'Christopher', birthday: '2003-08-22', role: 'user' },
                { username: 'angel', displayName: 'Ángel', birthday: '2003-03-10', role: 'user' },
                { username: 'carlos', displayName: 'Carlos', birthday: '2003-11-07', role: 'user' },
                { username: 'david', displayName: 'David', birthday: '2003-06-28', role: 'user' },
                { username: 'edgar', displayName: 'Edgar', birthday: '2003-09-14', role: 'user' },
                { username: 'emilio', displayName: 'Emilio', birthday: '2003-01-20', role: 'user' },
                { username: 'fabio', displayName: 'Fabio', birthday: '2003-04-03', role: 'user' },
                { username: 'hector', displayName: 'Héctor', birthday: '2003-12-25', role: 'user' },
                { username: 'jose', displayName: 'José', birthday: '2003-07-18', role: 'user' },
                { username: 'nico', displayName: 'Nico', birthday: '2003-02-11', role: 'user' },
                { username: 'santiago', displayName: 'Santiago', birthday: '2003-10-30', role: 'user' },
                { username: 'said', displayName: 'Said', birthday: '2003-08-05', role: 'user' },
            ];

            for (const m of members) {
                await User.create({ ...m, password: defaultPassword });
            }

            // Services
            const { SharedService, UserServiceDebt, Transport, Treasury, Notification } = models;
            const chatgpt = await SharedService.create({ name: 'ChatGPT', totalCost: 20, nextPaymentDate: '2026-04-01', isActive: true });
            const spotify = await SharedService.create({ name: 'Spotify', totalCost: 16.99, nextPaymentDate: '2026-04-01', isActive: true });

            const allUsers = await User.findAll();
            for (const u of allUsers) {
                await UserServiceDebt.create({ userId: u.id, serviceId: chatgpt.id, pendingBalance: 0 });
                await UserServiceDebt.create({ userId: u.id, serviceId: spotify.id, pendingBalance: 0 });
            }

            // Transport
            await Transport.create({ name: 'FabioCar', driverName: 'Fabio', paradero: 'Paradero Quetzacoatl', departureMorning: '07:00', returnMorning: '14:00', totalSeats: 4, isActive: true });
            await Transport.create({ name: 'Niconeta', driverName: 'Nico', paradero: 'Paradero Cholul', departureMorning: '07:15', returnMorning: '14:00', totalSeats: 4, isActive: true });

            // Treasury
            await Treasury.create({ name: 'FMAPUTES', totalCollected: 0, nextGoalAmount: 5000, nextGoalDescription: 'Fondo semestral' });

            // Welcome notification for admin
            const admin = await User.findOne({ where: { username: 'esteban' } });
            if (admin) {
                await Notification.create({ userId: admin.id, message: '¡Bienvenido al sistema FMAPUTES!', type: 'general' });
            }

            console.log('[Auto-Seed] ✅ Database seeded with 13 users, services, transports, and treasury.');
            console.log('[Auto-Seed] Default password: fmaputes2026 | Admin: esteban');
        } catch (seedError) {
            console.error('[Auto-Seed] ⚠️ Seed error (non-fatal):', seedError.message);
        }
    }

    app.listen(PORT, () => {
        console.log(`[Backend] Servidor inicializado en el puerto ${PORT}`);
        console.log(`[Backend] Entorno: ${process.env.NODE_ENV || 'development'}`);
    });
};

startServer();