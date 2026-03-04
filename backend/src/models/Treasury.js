const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Treasury = sequelize.define('Treasury', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'FMAPUTES',
  },
  totalCollected: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    field: 'total_collected',
  },
  nextGoalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'next_goal_amount',
  },
  nextGoalDescription: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'next_goal_description',
  },
}, {
  tableName: 'treasury',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Treasury;
