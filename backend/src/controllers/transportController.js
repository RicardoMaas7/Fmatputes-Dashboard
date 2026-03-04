const { Transport, TransportSeat, User } = require('../models');
const { createNotification } = require('../services/notificationHelper');

// GET /api/transport — All transports with seats
const getAllTransports = async (req, res) => {
  try {
    const transports = await Transport.findAll({
      where: { isActive: true },
      include: [{
        association: 'seats',
        include: [{ association: 'user', attributes: ['id', 'username', 'displayName'] }],
      }],
    });

    const result = transports.map((t) => {
      const data = t.get({ plain: true });
      return {
        ...data,
        occupiedSeats: data.seats.length,
        availableSeats: data.totalSeats - data.seats.length,
        userPendingBalance: data.seats.find((s) => s.userId === req.user.id)?.pendingBalance || 0,
      };
    });

    res.json(result);
  } catch (error) {
    console.error('[Transport] Error:', error);
    res.status(500).json({ message: 'Error fetching transports.' });
  }
};

// POST /api/transport — Create transport (admin)
const createTransport = async (req, res) => {
  try {
    const { name, driverName, paradero, departureMorning, returnMorning, totalSeats } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required.' });

    const transport = await Transport.create({
      name,
      driverName: driverName || null,
      paradero: paradero || null,
      departureMorning: departureMorning || null,
      returnMorning: returnMorning || null,
      totalSeats: totalSeats || 4,
      isActive: true,
    });

    res.status(201).json(transport);
  } catch (error) {
    console.error('[Transport] Error creating:', error);
    res.status(500).json({ message: 'Error creating transport.' });
  }
};

// PUT /api/transport/:id — Update transport (admin)
const updateTransport = async (req, res) => {
  try {
    const transport = await Transport.findByPk(req.params.id);
    if (!transport) return res.status(404).json({ message: 'Transport not found.' });

    const { paradero, departureMorning, returnMorning, totalSeats } = req.body;
    if (paradero !== undefined) transport.paradero = paradero;
    if (departureMorning !== undefined) transport.departureMorning = departureMorning;
    if (returnMorning !== undefined) transport.returnMorning = returnMorning;
    if (totalSeats !== undefined) transport.totalSeats = totalSeats;

    await transport.save();
    res.json(transport);
  } catch (error) {
    console.error('[Transport] Error updating:', error);
    res.status(500).json({ message: 'Error updating transport.' });
  }
};

// POST /api/transport/:id/reserve — Reserve a seat
const reserveSeat = async (req, res) => {
  try {
    const transport = await Transport.findByPk(req.params.id, {
      include: [{ association: 'seats' }],
    });

    if (!transport) return res.status(404).json({ message: 'Transport not found.' });

    if (transport.seats.length >= transport.totalSeats) {
      return res.status(400).json({ message: 'No available seats.' });
    }

    const existing = transport.seats.find((s) => s.userId === req.user.id);
    if (existing) return res.status(409).json({ message: 'You already have a seat.' });

    const seat = await TransportSeat.create({
      transportId: transport.id,
      userId: req.user.id,
      pendingBalance: 0,
    });

    // Notify the user
    await createNotification(req.user.id, `Reservaste un asiento en ${transport.name}.`, 'transport');

    res.status(201).json(seat);
  } catch (error) {
    console.error('[Transport] Error reserving:', error);
    res.status(500).json({ message: 'Error reserving seat.' });
  }
};

module.exports = { getAllTransports, createTransport, updateTransport, reserveSeat };
