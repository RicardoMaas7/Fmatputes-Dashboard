const { Transport, TransportSeat, User } = require('../models');
const { createNotification } = require('../services/notificationHelper');

// GET /api/transport — All transports with seats + owner info
const getAllTransports = async (req, res) => {
  try {
    const transports = await Transport.findAll({
      where: { isActive: true },
      include: [
        {
          association: 'seats',
          include: [{ association: 'user', attributes: ['id', 'username', 'displayName'] }],
        },
        {
          association: 'owner',
          attributes: ['id', 'username', 'displayName'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    const result = transports.map((t) => {
      const data = t.get({ plain: true });
      // Sort seats by priority (lower = higher priority)
      if (data.seats) {
        data.seats.sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
      }
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

// POST /api/transport — Create transport (any authenticated user becomes owner)
const createTransport = async (req, res) => {
  try {
    const { name, driverName, paradero, departureMorning, returnMorning, totalSeats } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required.' });

    const transport = await Transport.create({
      name,
      ownerId: req.user.id,
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

// PUT /api/transport/:id — Update transport (owner or admin)
const updateTransport = async (req, res) => {
  try {
    const transport = await Transport.findByPk(req.params.id);
    if (!transport) return res.status(404).json({ message: 'Transporte no encontrado.' });

    // Only owner or admin can update
    if (transport.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Solo el dueño o un admin puede editar este transporte.' });
    }

    const { name, driverName, paradero, departureMorning, returnMorning, totalSeats } = req.body;
    if (name !== undefined) transport.name = name;
    if (driverName !== undefined) transport.driverName = driverName;
    if (paradero !== undefined) transport.paradero = paradero;
    if (departureMorning !== undefined) transport.departureMorning = departureMorning;
    if (returnMorning !== undefined) transport.returnMorning = returnMorning;
    if (totalSeats !== undefined) transport.totalSeats = totalSeats;

    await transport.save();
    res.json(transport);
  } catch (error) {
    console.error('[Transport] Error actualizando:', error);
    res.status(500).json({ message: 'Error al actualizar transporte.' });
  }
};

// DELETE /api/transport/:id — Delete transport (owner or admin)
const deleteTransport = async (req, res) => {
  try {
    const transport = await Transport.findByPk(req.params.id);
    if (!transport) return res.status(404).json({ message: 'Transporte no encontrado.' });

    if (transport.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Solo el dueño o un admin puede eliminar este transporte.' });
    }

    // Delete associated seats first
    await TransportSeat.destroy({ where: { transportId: transport.id } });
    await transport.destroy();

    res.json({ message: 'Transporte eliminado.' });
  } catch (error) {
    console.error('[Transport] Error eliminando:', error);
    res.status(500).json({ message: 'Error al eliminar transporte.' });
  }
};

// PUT /api/transport/:id/priority — Owner reorders passenger priority
const updatePriority = async (req, res) => {
  try {
    const transport = await Transport.findByPk(req.params.id);
    if (!transport) return res.status(404).json({ message: 'Transporte no encontrado.' });

    if (transport.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Solo el dueño puede reordenar prioridades.' });
    }

    // Expect { seatIds: ['id1', 'id2', ...] } in order of priority
    const { seatIds } = req.body;
    if (!Array.isArray(seatIds)) {
      return res.status(400).json({ message: 'seatIds debe ser un array.' });
    }

    // Update priority for each seat
    await Promise.all(
      seatIds.map((seatId, index) =>
        TransportSeat.update({ priority: index + 1 }, { where: { id: seatId, transportId: transport.id } })
      )
    );

    res.json({ message: 'Prioridades actualizadas.' });
  } catch (error) {
    console.error('[Transport] Error actualizando prioridad:', error);
    res.status(500).json({ message: 'Error al actualizar prioridades.' });
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
    console.error('[Transport] Error al reservar:', error);
    res.status(500).json({ message: 'Error al reservar asiento.' });
  }
};

// DELETE /api/transport/:id/cancel — Cancel own seat reservation
const cancelSeat = async (req, res) => {
  try {
    const seat = await TransportSeat.findOne({
      where: { transportId: req.params.id, userId: req.user.id },
    });

    if (!seat) {
      return res.status(404).json({ message: 'No tienes un asiento reservado en este transporte.' });
    }

    const transport = await Transport.findByPk(req.params.id);
    await seat.destroy();

    await createNotification(req.user.id, `Cancelaste tu asiento en ${transport?.name || 'transporte'}.`, 'transport');

    res.json({ message: 'Reservación cancelada.' });
  } catch (error) {
    console.error('[Transport] Error al cancelar:', error);
    res.status(500).json({ message: 'Error al cancelar reservación.' });
  }
};

module.exports = { getAllTransports, createTransport, updateTransport, deleteTransport, reserveSeat, cancelSeat, updatePriority };
