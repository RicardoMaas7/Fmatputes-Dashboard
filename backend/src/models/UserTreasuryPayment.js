const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const UserTreasuryPayment = sequelize.define('UserTreasuryPayment', {
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
  treasuryId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'treasury_id',
  },
  amountPaid: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'amount_paid',
  },
  paidAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'paid_at',
  },
}, {
  tableName: 'user_treasury_payments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = UserTreasuryPayment;
