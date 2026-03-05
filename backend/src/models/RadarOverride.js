const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const RadarOverride = sequelize.define('RadarOverride', {
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
  period: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  svgContent: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'svg_content',
  },
  stats: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
}, {
  tableName: 'radar_overrides',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'period'],
      name: 'unique_radar_override_per_user_period',
    },
  ],
});

module.exports = RadarOverride;
