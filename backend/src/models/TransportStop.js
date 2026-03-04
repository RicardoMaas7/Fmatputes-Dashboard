const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const TransportStop = sequelize.define('TransportStop', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  transportId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'transport_id',
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  time: {
    type: DataTypes.STRING, // "HH:mm" format
    allowNull: true,
  },
  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'transport_stops',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = TransportStop;
