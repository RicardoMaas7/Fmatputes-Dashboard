const { SharedService, UserServiceDebt, User } = require('../models');

// GET /api/services — All services + current user's debt
const getAllServices = async (req, res) => {
  try {
    const services = await SharedService.findAll({
      include: [
        {
          association: 'userDebts',
          where: { userId: req.user.id },
          required: false,
        },
        {
          association: 'creator',
          attributes: ['id', 'username', 'displayName'],
        },
      ],
      order: [['name', 'ASC']],
    });

    const result = services.map((s) => {
      const data = s.get({ plain: true });
      const userDebt = data.userDebts?.[0];
      return {
        id: data.id,
        name: data.name,
        iconUrl: data.iconUrl,
        totalCost: parseFloat(data.totalCost),
        perPersonCost: data.perPersonCost ? parseFloat(data.perPersonCost) : null,
        nextPaymentDate: data.nextPaymentDate,
        paymentDeadline: data.paymentDeadline,
        createdBy: data.createdBy,
        creator: data.creator,
        isActive: data.isActive,
        pendingBalance: userDebt ? parseFloat(userDebt.pendingBalance) : 0,
      };
    });

    res.json(result);
  } catch (error) {
    console.error('[Services] Error:', error);
    res.status(500).json({ message: 'Error fetching services.' });
  }
};

// POST /api/services — Create service (any authenticated user)
const createService = async (req, res) => {
  try {
    const { name, totalCost, perPersonCost, nextPaymentDate, paymentDeadline, iconUrl } = req.body;
    const service = await SharedService.create({
      name, totalCost, perPersonCost, nextPaymentDate, paymentDeadline, iconUrl,
      createdBy: req.user.id,
    });
    res.status(201).json(service);
  } catch (error) {
    console.error('[Services] Error creating:', error);
    res.status(500).json({ message: 'Error creating service.' });
  }
};

// PUT /api/services/:id — Update service (creator or admin)
const updateService = async (req, res) => {
  try {
    const service = await SharedService.findByPk(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found.' });

    // Check ownership: creator or admin
    if (service.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permiso para editar este servicio.' });
    }

    const { name, totalCost, perPersonCost, nextPaymentDate, paymentDeadline, isActive, iconUrl } = req.body;
    if (name !== undefined) service.name = name;
    if (totalCost !== undefined) service.totalCost = totalCost;
    if (perPersonCost !== undefined) service.perPersonCost = perPersonCost;
    if (nextPaymentDate !== undefined) service.nextPaymentDate = nextPaymentDate;
    if (paymentDeadline !== undefined) service.paymentDeadline = paymentDeadline;
    if (isActive !== undefined) service.isActive = isActive;
    if (iconUrl !== undefined) service.iconUrl = iconUrl;

    await service.save();
    res.json(service);
  } catch (error) {
    console.error('[Services] Error updating:', error);
    res.status(500).json({ message: 'Error updating service.' });
  }
};

// DELETE /api/services/:id — Delete service (creator or admin)
const deleteService = async (req, res) => {
  try {
    const service = await SharedService.findByPk(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found.' });

    // Check ownership: creator or admin
    if (service.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permiso para eliminar este servicio.' });
    }

    // Delete associated debts first
    await UserServiceDebt.destroy({ where: { serviceId: service.id } });
    await service.destroy();
    res.json({ message: 'Servicio eliminado.' });
  } catch (error) {
    console.error('[Services] Error deleting:', error);
    res.status(500).json({ message: 'Error deleting service.' });
  }
};

// POST /api/services/:id/mark-paid — Mark current user's debt as paid for a service
const markServicePaid = async (req, res) => {
  try {
    const debt = await UserServiceDebt.findOne({
      where: { serviceId: req.params.id, userId: req.user.id },
    });
    if (!debt) {
      return res.status(404).json({ message: 'No hay deuda para este servicio.' });
    }
    debt.pendingBalance = 0;
    await debt.save();
    res.json({ message: 'Marcado como pagado.', debt });
  } catch (error) {
    console.error('[Services] Error marking paid:', error);
    res.status(500).json({ message: 'Error al marcar como pagado.' });
  }
};

// GET /api/services/:id/debts — Get all user debts for a service (creator or admin)
const getServiceDebts = async (req, res) => {
  try {
    const service = await SharedService.findByPk(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found.' });

    if (service.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permiso.' });
    }

    const debts = await UserServiceDebt.findAll({
      where: { serviceId: req.params.id },
      include: [{ association: 'user', attributes: ['id', 'username', 'displayName'] }],
      order: [['userId', 'ASC']],
    });
    res.json(debts);
  } catch (error) {
    console.error('[Services] Error obteniendo deudas:', error);
    res.status(500).json({ message: 'Error al obtener deudas del servicio.' });
  }
};

// PUT /api/services/:id/debts/:userId — Update user debt for a service (creator or admin)
const updateServiceDebt = async (req, res) => {
  try {
    const service = await SharedService.findByPk(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found.' });

    if (service.createdBy !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'No tienes permiso.' });
    }

    const { pendingBalance } = req.body;
    const [debt, created] = await UserServiceDebt.findOrCreate({
      where: { serviceId: req.params.id, userId: req.params.userId },
      defaults: { pendingBalance: pendingBalance || 0 },
    });

    if (!created) {
      debt.pendingBalance = pendingBalance;
      await debt.save();
    }

    res.json(debt);
  } catch (error) {
    console.error('[Services] Error updating debt:', error);
    res.status(500).json({ message: 'Error updating debt.' });
  }
};

module.exports = { getAllServices, createService, updateService, deleteService, markServicePaid, getServiceDebts, updateServiceDebt };
