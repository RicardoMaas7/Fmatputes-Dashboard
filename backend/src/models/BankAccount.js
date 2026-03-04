const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const BankAccount = sequelize.define('BankAccount', {
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
  bankName: {
    type: DataTypes.ENUM('BBVA', 'PLATA', 'NU', 'PAYPAL'),
    allowNull: false,
    field: 'bank_name',
  },
  accountNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'account_number',
  },
  iconUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'icon_url',
  },
}, {
  tableName: 'bank_accounts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = BankAccount;
