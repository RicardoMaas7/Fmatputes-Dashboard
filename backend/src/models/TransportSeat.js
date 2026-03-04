const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const TransportSeat = sequelize.define('TransportSeat', {
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
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
  },
  pendingBalance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'pending_balance',
  },
}, {
  tableName: 'transport_seats',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['transport_id', 'user_id'],
      name: 'unique_seat_per_transport',
    },
  ],
});

module.exports = TransportSeat;
