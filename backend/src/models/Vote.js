const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Vote = sequelize.define('Vote', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  voterId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'voter_id',
  },
  voteeId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'votee_id',
  },
  category: {
    type: DataTypes.ENUM('mathematics', 'programming', 'teamwork', 'discipline', 'sociability'),
    allowNull: false,
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 10,
    },
  },
  period: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: () => {
      const now = new Date();
      const s = now.getMonth() < 6 ? 1 : 2; // S1 = Jan-Jun, S2 = Jul-Dec
      return `${now.getFullYear()}-S${s}`;
    },
  },
}, {
  tableName: 'votes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['voter_id', 'votee_id', 'category', 'period'],
      name: 'unique_vote_per_period',
    },
  ],
});

module.exports = Vote;
