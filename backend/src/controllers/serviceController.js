const { SharedService, UserServiceDebt } = require('../models');

// GET /api/services — All services + current user's debt
const getAllServices = async (req, res) => {
  try {
    const services = await SharedService.findAll({
      include: [{
        association: 'userDebts',
        where: { userId: req.user.id },
        required: false,
      }],
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
        nextPaymentDate: data.nextPaymentDate,
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

// POST /api/services — Create service (admin)
const createService = async (req, res) => {
  try {
    const { name, totalCost, nextPaymentDate, iconUrl } = req.body;
    const service = await SharedService.create({ name, totalCost, nextPaymentDate, iconUrl });
    res.status(201).json(service);
  } catch (error) {
    console.error('[Services] Error creating:', error);
    res.status(500).json({ message: 'Error creating service.' });
  }
};

// PUT /api/services/:id — Update service (admin)
const updateService = async (req, res) => {
  try {
    const service = await SharedService.findByPk(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found.' });

    const { name, totalCost, nextPaymentDate, isActive, iconUrl } = req.body;
    if (name !== undefined) service.name = name;
    if (totalCost !== undefined) service.totalCost = totalCost;
    if (nextPaymentDate !== undefined) service.nextPaymentDate = nextPaymentDate;
    if (isActive !== undefined) service.isActive = isActive;
    if (iconUrl !== undefined) service.iconUrl = iconUrl;

    await service.save();
    res.json(service);
  } catch (error) {
    console.error('[Services] Error updating:', error);
    res.status(500).json({ message: 'Error updating service.' });
  }
};

// DELETE /api/services/:id — Delete service (admin)
const deleteService = async (req, res) => {
  try {
    const service = await SharedService.findByPk(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found.' });

    // Delete associated debts first
    await UserServiceDebt.destroy({ where: { serviceId: service.id } });
    await service.destroy();
    res.json({ message: 'Servicio eliminado.' });
  } catch (error) {
    console.error('[Services] Error deleting:', error);
    res.status(500).json({ message: 'Error deleting service.' });
  }
};

// GET /api/services/:id/debts — Get all user debts for a service (admin)
const getServiceDebts = async (req, res) => {
  try {
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

// PUT /api/services/:id/debts/:userId — Update user debt for a service (admin)
const updateServiceDebt = async (req, res) => {
  try {
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

module.exports = { getAllServices, createService, updateService, deleteService, getServiceDebts, updateServiceDebt };
