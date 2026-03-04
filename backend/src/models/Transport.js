const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Transport = sequelize.define('Transport', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ownerId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'owner_id',
  },
  driverName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'driver_name',
  },
  iconUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'icon_url',
  },
  paradero: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  departureMorning: {
    type: DataTypes.STRING, // "HH:mm" format
    allowNull: true,
    field: 'departure_morning',
  },
  returnMorning: {
    type: DataTypes.STRING, // "HH:mm" format
    allowNull: true,
    field: 'return_morning',
  },
  totalSeats: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 4,
    field: 'total_seats',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  },
}, {
  tableName: 'transports',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Transport;
