const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Importar configuración de BD y Modelos (centralizado con asociaciones)
const { connectDB, sequelize } = require('./config/db');
const models = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Seguridad ──────────────────────────────────────────────────────
app.set('trust proxy', 1); // Nginx / Cloudflare

app.use(helmet({ contentSecurityPolicy: false })); // Headers de seguridad

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting global: 100 requests / 15 min por IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiadas peticiones. Intenta de nuevo en unos minutos.' },
});
app.use(globalLimiter);

// Rate limiting estricto para login
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { message: 'Demasiados intentos de inicio de sesión. Espera 15 minutos.' },
});

// ── Body parsers ──────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Archivos estáticos (uploads) ──────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Healthcheck ───────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    res.status(200).json({
        status: 'UP',
        timestamp: new Date().toISOString(),
        client_ip: clientIp,
        message: 'Fmaputes API operando correctamente.'
    });
});

// ── Rutas ─────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/votes', require('./routes/voteRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/transport', require('./routes/transportRoutes'));
app.use('/api/treasury', require('./routes/treasuryRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/bank-accounts', require('./routes/bankAccountRoutes'));
app.use('/api/reminders', require('./routes/reminderRoutes'));
app.use('/api/teams', require('./routes/teamRoutes'));

// ── Inicialización ────────────────────────────────────────────────
const startServer = async () => {
    await connectDB();
    
    await sequelize.sync({ force: false }); 
    console.log('[Base de Datos] Modelos sincronizados correctamente.');

    // Auto-seed: datos iniciales si la BD está vacía
    const { User } = models;
    const userCount = await User.count();
    if (userCount === 0) {
        console.log('[Auto-Seed] No se encontraron usuarios — ejecutando seed inicial...');
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

            // bulkCreate es más eficiente que N inserts individuales
            await User.bulkCreate(members.map(m => ({ ...m, password: defaultPassword })));

            const { SharedService, UserServiceDebt, Transport, Treasury, Notification } = models;
            const [chatgpt, spotify] = await SharedService.bulkCreate([
                { name: 'ChatGPT', totalCost: 20, nextPaymentDate: '2026-04-01', isActive: true },
                { name: 'Spotify', totalCost: 16.99, nextPaymentDate: '2026-04-01', isActive: true },
            ]);

            const allUsers = await User.findAll();
            const debtRecords = [];
            for (const u of allUsers) {
                debtRecords.push({ userId: u.id, serviceId: chatgpt.id, pendingBalance: 0 });
                debtRecords.push({ userId: u.id, serviceId: spotify.id, pendingBalance: 0 });
            }
            await UserServiceDebt.bulkCreate(debtRecords);

            await Transport.bulkCreate([
                { name: 'FabioCar', driverName: 'Fabio', paradero: 'Paradero Quetzacoatl', departureMorning: '07:00', returnMorning: '14:00', totalSeats: 4, isActive: true },
                { name: 'Niconeta', driverName: 'Nico', paradero: 'Paradero Cholul', departureMorning: '07:15', returnMorning: '14:00', totalSeats: 4, isActive: true },
            ]);

            await Treasury.create({ name: 'FMAPUTES', totalCollected: 0, nextGoalAmount: 5000, nextGoalDescription: 'Fondo semestral' });

            const admin = await User.findOne({ where: { username: 'esteban' } });
            if (admin) {
                await Notification.create({ userId: admin.id, message: '¡Bienvenido al sistema FMAPUTES!', type: 'general' });

                // Calendario FMAT Enero-Mayo 2026
                const { Reminder } = models;
                await Reminder.bulkCreate([
                    { title: 'Día inhábil — Natalicio de Benito Juárez', message: 'No hay clases.', type: 'info', expiresAt: '2026-03-16', isActive: true, createdBy: admin.id },
                    { title: 'Vacaciones — Semana Santa', message: 'Periodo vacacional del 30 de marzo al 4 de abril.', type: 'warning', expiresAt: '2026-04-04', isActive: true, createdBy: admin.id },
                    { title: 'Día inhábil — Día del Trabajo', message: 'No hay clases.', type: 'info', expiresAt: '2026-05-01', isActive: true, createdBy: admin.id },
                    { title: 'Día inhábil — Batalla de Puebla', message: 'No hay clases.', type: 'info', expiresAt: '2026-05-05', isActive: true, createdBy: admin.id },
                    { title: 'Día inhábil — Día de las Madres', message: '¡Felicidades a las mamás!', type: 'info', expiresAt: '2026-05-10', isActive: true, createdBy: admin.id },
                    { title: 'Día inhábil — Día del Maestro', message: 'No hay clases.', type: 'info', expiresAt: '2026-05-15', isActive: true, createdBy: admin.id },
                    { title: 'Fin del semestre Ene-May 2026', message: 'Último día de clases del semestre.', type: 'urgent', expiresAt: '2026-05-30', isActive: true, createdBy: admin.id },
                ]);
            }

            console.log('[Auto-Seed] Base de datos sembrada: 13 usuarios, servicios, transportes y tesorería.');
            console.log('[Auto-Seed] Contraseña por defecto: fmaputes2026 | Admin: esteban');
        } catch (seedError) {
            console.error('[Auto-Seed] Error en seed (no fatal):', seedError.message);
        }
    }

    const server = app.listen(PORT, () => {
        console.log(`[Backend] Servidor inicializado en el puerto ${PORT}`);
        console.log(`[Backend] Entorno: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
        console.log(`\n[Backend] Señal ${signal} recibida. Cerrando servidor...`);
        server.close(async () => {
            await sequelize.close();
            console.log('[Backend] Conexión a BD cerrada. Proceso terminado.');
            process.exit(0);
        });
        // Forzar cierre después de 10s
        setTimeout(() => process.exit(1), 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer();