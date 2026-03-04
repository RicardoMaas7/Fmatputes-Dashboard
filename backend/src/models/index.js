const User = require('./User');
const Vote = require('./Vote');
const BankAccount = require('./BankAccount');
const SharedService = require('./SharedService');
const UserServiceDebt = require('./UserServiceDebt');
const Transport = require('./Transport');
const TransportSeat = require('./TransportSeat');
const Treasury = require('./Treasury');
const UserTreasuryPayment = require('./UserTreasuryPayment');
const Notification = require('./Notification');
const Reminder = require('./Reminder');

// ===== ASSOCIATIONS =====

// User <-> Vote (as voter)
User.hasMany(Vote, { foreignKey: 'voter_id', as: 'votesGiven' });
Vote.belongsTo(User, { foreignKey: 'voter_id', as: 'voter' });

// User <-> Vote (as votee)
User.hasMany(Vote, { foreignKey: 'votee_id', as: 'votesReceived' });
Vote.belongsTo(User, { foreignKey: 'votee_id', as: 'votee' });

// User <-> BankAccount
User.hasMany(BankAccount, { foreignKey: 'user_id', as: 'bankAccounts' });
BankAccount.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User <-> UserServiceDebt
User.hasMany(UserServiceDebt, { foreignKey: 'user_id', as: 'serviceDebts' });
UserServiceDebt.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// SharedService <-> UserServiceDebt
SharedService.hasMany(UserServiceDebt, { foreignKey: 'service_id', as: 'userDebts' });
UserServiceDebt.belongsTo(SharedService, { foreignKey: 'service_id', as: 'service' });

// Transport <-> TransportSeat
Transport.hasMany(TransportSeat, { foreignKey: 'transport_id', as: 'seats' });
TransportSeat.belongsTo(Transport, { foreignKey: 'transport_id', as: 'transport' });

// User <-> TransportSeat
User.hasMany(TransportSeat, { foreignKey: 'user_id', as: 'transportSeats' });
TransportSeat.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Treasury <-> UserTreasuryPayment
Treasury.hasMany(UserTreasuryPayment, { foreignKey: 'treasury_id', as: 'payments' });
UserTreasuryPayment.belongsTo(Treasury, { foreignKey: 'treasury_id', as: 'treasury' });

// User <-> UserTreasuryPayment
User.hasMany(UserTreasuryPayment, { foreignKey: 'user_id', as: 'treasuryPayments' });
UserTreasuryPayment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User <-> Notification
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Reminder <-> User (creator)
Reminder.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
User.hasMany(Reminder, { foreignKey: 'created_by', as: 'reminders' });

module.exports = {
  User,
  Vote,
  BankAccount,
  SharedService,
  UserServiceDebt,
  Transport,
  TransportSeat,
  Treasury,
  UserTreasuryPayment,
  Notification,
  Reminder,
};
