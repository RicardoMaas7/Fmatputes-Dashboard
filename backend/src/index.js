const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar configuración de BD y Modelos
const { connectDB, sequelize } = require('./config/db');
const User = require('./models/user'); 

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

// Inicialización del servidor y Base de Datos
const startServer = async () => {
    await connectDB();
    
    // Sincroniza los modelos con la BD (crea las tablas si no existen)
    // Nota: force: false evita que se borren los datos en cada reinicio
    await sequelize.sync({ force: false }); 
    console.log('[Base de Datos] Modelos sincronizados correctamente.');

    app.listen(PORT, () => {
        console.log(`[Backend] Servidor inicializado en el puerto ${PORT}`);
        console.log(`[Backend] Entorno: ${process.env.NODE_ENV || 'development'}`);
    });
};

startServer();