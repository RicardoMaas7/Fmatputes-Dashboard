const { Sequelize } = require('sequelize');
require('dotenv').config();

// Inicializamos Sequelize con las variables de entorno de Docker
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false, // Pon en true si quieres ver las consultas SQL en consola
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('[Base de Datos] Conexión a PostgreSQL establecida con éxito.');
  } catch (error) {
    console.error('[Base de Datos] Error al conectar con PostgreSQL:', error);
    process.exit(1); // Detenemos el servidor si no hay base de datos
  }
};

module.exports = { sequelize, connectDB };