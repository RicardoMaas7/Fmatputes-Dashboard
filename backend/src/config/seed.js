/**
 * Seed script — populates the database with initial data
 * Run: node src/config/seed.js
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connectDB, sequelize } = require('./db');
const {
  User,
  BankAccount,
  SharedService,
  UserServiceDebt,
  Transport,
  TransportSeat,
  Treasury,
  Notification,
} = require('../models');

// Team members from radar_stats.py
const TEAM_MEMBERS = [
  { username: 'esteban', displayName: 'Esteban', birthday: '2003-05-15' },
  { username: 'christopher', displayName: 'Christopher', birthday: '2003-08-22' },
  { username: 'angel', displayName: 'Ángel', birthday: '2003-03-10' },
  { username: 'carlos', displayName: 'Carlos', birthday: '2003-11-07' },
  { username: 'david', displayName: 'David', birthday: '2003-06-28' },
  { username: 'edgar', displayName: 'Edgar', birthday: '2003-09-14' },
  { username: 'emilio', displayName: 'Emilio', birthday: '2003-01-20' },
  { username: 'fabio', displayName: 'Fabio', birthday: '2003-04-03' },
  { username: 'hector', displayName: 'Héctor', birthday: '2003-12-25' },
  { username: 'jose', displayName: 'José', birthday: '2003-07-18' },
  { username: 'nico', displayName: 'Nico', birthday: '2003-02-11' },
  { username: 'santiago', displayName: 'Santiago', birthday: '2003-10-30' },
  { username: 'said', displayName: 'Said', birthday: '2003-08-05' },
];

async function seed() {
  try {
    await connectDB();
    
    // Sync with force to recreate tables (CAUTION: deletes existing data)
    await sequelize.sync({ force: true });
    console.log('[Seed] Tables recreated.');

    // 1. Create users
    const defaultPassword = await bcrypt.hash('fmaputes2026', 10);
    const users = [];
    
    for (let i = 0; i < TEAM_MEMBERS.length; i++) {
      const member = TEAM_MEMBERS[i];
      const user = await User.create({
        username: member.username,
        password: defaultPassword,
        displayName: member.displayName,
        birthday: member.birthday,
        role: i === 0 ? 'admin' : 'user', // First user is admin
      });
      users.push(user);
      console.log(`[Seed] User created: ${member.username} (${i === 0 ? 'admin' : 'user'})`);
    }

    // 2. Create shared services
    const chatgpt = await SharedService.create({
      name: 'ChatGPT',
      totalCost: 20.00,
      nextPaymentDate: '2026-04-01',
      isActive: true,
    });

    const spotify = await SharedService.create({
      name: 'Spotify',
      totalCost: 16.99,
      nextPaymentDate: '2026-04-01',
      isActive: true,
    });
    console.log('[Seed] Services created: ChatGPT, Spotify');

    // 3. Create service debts for all users
    for (const user of users) {
      await UserServiceDebt.create({
        userId: user.id,
        serviceId: chatgpt.id,
        pendingBalance: 0,
      });
      await UserServiceDebt.create({
        userId: user.id,
        serviceId: spotify.id,
        pendingBalance: 0,
      });
    }
    console.log('[Seed] Service debts created for all users.');

    // 4. Create transports
    const fabioCar = await Transport.create({
      name: 'FabioCar',
      driverName: 'Fabio',
      paradero: 'Paradero Quetzacoatl',
      departureMorning: '07:00',
      returnMorning: '14:00',
      totalSeats: 4,
      isActive: true,
    });

    const niconeta = await Transport.create({
      name: 'Niconeta',
      driverName: 'Nico',
      paradero: 'Paradero Cholul',
      departureMorning: '07:15',
      returnMorning: '14:00',
      totalSeats: 4,
      isActive: true,
    });
    console.log('[Seed] Transports created: FabioCar, Niconeta');

    // 5. Create treasury
    const treasury = await Treasury.create({
      name: 'FMAPUTES',
      totalCollected: 0,
      nextGoalAmount: 5000,
      nextGoalDescription: 'Fondo semestral',
    });
    console.log('[Seed] Treasury created: FMAPUTES');

    // 6. Create some sample notifications
    await Notification.create({
      userId: users[0].id,
      message: '¡Bienvenido al sistema FMAPUTES!',
      type: 'general',
    });
    await Notification.create({
      userId: users[0].id,
      message: '¡Haz ganado un trofeo en la votación!',
      type: 'trophy',
    });
    await Notification.create({
      userId: users[0].id,
      message: 'Cupo disponible en el carro de Fabio',
      type: 'transport',
    });
    console.log('[Seed] Sample notifications created.');

    console.log('\n[Seed] ✅ Database seeded successfully!');
    console.log(`[Seed] Created ${users.length} users, 2 services, 2 transports, 1 treasury`);
    console.log('[Seed] Default password for all users: fmaputes2026');
    console.log('[Seed] Admin user: esteban');
    
    process.exit(0);
  } catch (error) {
    console.error('[Seed] ❌ Error:', error);
    process.exit(1);
  }
}

seed();
