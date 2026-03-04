const { Treasury, UserTreasuryPayment } = require('../models');
const { sequelize } = require('../config/db');
const { createNotification } = require('../services/notificationHelper');

// GET /api/treasury — Treasury info + current user's total
const getTreasury = async (req, res) => {
  try {
    const treasury = await Treasury.findOne({
      include: [{ association: 'payments' }],
    });

    if (!treasury) return res.status(404).json({ message: 'Treasury not found.' });

    // Calculate total collected from all payments
    const totalCollected = treasury.payments.reduce(
      (sum, p) => sum + parseFloat(p.amountPaid), 0
    );

    // Get current user's total
    const userTotal = treasury.payments
      .filter((p) => p.userId === req.user.id)
      .reduce((sum, p) => sum + parseFloat(p.amountPaid), 0);

    const data = treasury.get({ plain: true });
    res.json({
      id: data.id,
      name: data.name,
      totalCollected: totalCollected,
      nextGoalAmount: parseFloat(data.nextGoalAmount || 0),
      nextGoalDescription: data.nextGoalDescription,
      userTotalPaid: userTotal,
      progress: data.nextGoalAmount ? Math.min(100, (totalCollected / parseFloat(data.nextGoalAmount)) * 100) : 0,
    });
  } catch (error) {
    console.error('[Treasury] Error:', error);
    res.status(500).json({ message: 'Error fetching treasury.' });
  }
};

// POST /api/treasury/payment — Register a payment (admin)
const registerPayment = async (req, res) => {
  try {
    const { userId, amountPaid } = req.body;

    if (!userId || !amountPaid) {
      return res.status(400).json({ message: 'userId and amountPaid are required.' });
    }

    const treasury = await Treasury.findOne();
    if (!treasury) return res.status(404).json({ message: 'Treasury not found.' });

    const payment = await UserTreasuryPayment.create({
      userId,
      treasuryId: treasury.id,
      amountPaid,
    });

    // Update total collected
    treasury.totalCollected = parseFloat(treasury.totalCollected) + parseFloat(amountPaid);
    await treasury.save();

    // Notify the user
    await createNotification(userId, `Se registr\u00f3 tu pago de $${parseFloat(amountPaid).toFixed(2)} a tesorer\u00eda.`, 'payment');

    res.status(201).json(payment);
  } catch (error) {
    console.error('[Treasury] Error registering payment:', error);
    res.status(500).json({ message: 'Error registering payment.' });
  }
};

// PUT /api/treasury — Update treasury goal (admin, enforced by middleware)
const updateTreasury = async (req, res) => {
  try {
    const treasury = await Treasury.findOne();
    if (!treasury) return res.status(404).json({ message: 'Tesorería no encontrada.' });

    const { name, nextGoalAmount, nextGoalDescription } = req.body;
    if (name !== undefined) treasury.name = name;
    if (nextGoalAmount !== undefined) treasury.nextGoalAmount = nextGoalAmount;
    if (nextGoalDescription !== undefined) treasury.nextGoalDescription = nextGoalDescription;

    await treasury.save();
    res.json(treasury);
  } catch (error) {
    console.error('[Treasury] Error actualizando:', error);
    res.status(500).json({ message: 'Error al actualizar tesorería.' });
  }
};

module.exports = { getTreasury, registerPayment, updateTreasury };
