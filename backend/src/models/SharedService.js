const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SharedService = sequelize.define('SharedService', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  iconUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'icon_url',
  },
  totalCost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'total_cost',
  },
  nextPaymentDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'next_payment_date',
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active',
  },
}, {
  tableName: 'shared_services',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = SharedService;
