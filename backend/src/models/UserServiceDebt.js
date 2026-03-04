const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const UserServiceDebt = sequelize.define('UserServiceDebt', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
  },
  serviceId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'service_id',
  },
  pendingBalance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'pending_balance',
  },
}, {
  tableName: 'user_service_debts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = UserServiceDebt;
