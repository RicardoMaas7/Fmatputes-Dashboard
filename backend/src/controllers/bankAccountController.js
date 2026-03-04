const { BankAccount } = require('../models');

// GET /api/bank-accounts — Current user's bank accounts
const getMyAccounts = async (req, res) => {
  try {
    const accounts = await BankAccount.findAll({
      where: { userId: req.user.id },
      order: [['created_at', 'ASC']],
    });
    res.json(accounts);
  } catch (error) {
    console.error('[BankAccounts] Error:', error);
    res.status(500).json({ message: 'Error fetching bank accounts.' });
  }
};

// POST /api/bank-accounts — Add a bank account
const createAccount = async (req, res) => {
  try {
    const { bankName, accountNumber } = req.body;

    if (!bankName || !accountNumber) {
      return res.status(400).json({ message: 'bankName and accountNumber are required.' });
    }

    const validBanks = ['BBVA', 'PLATA', 'NU', 'PAYPAL'];
    if (!validBanks.includes(bankName)) {
      return res.status(400).json({ message: `Invalid bank. Must be one of: ${validBanks.join(', ')}` });
    }

    // Check if user already has an account with this bank
    const existing = await BankAccount.findOne({
      where: { userId: req.user.id, bankName },
    });
    if (existing) {
      return res.status(409).json({ message: `Ya tienes una cuenta de ${bankName}.` });
    }

    const account = await BankAccount.create({
      userId: req.user.id,
      bankName,
      accountNumber,
    });

    res.status(201).json(account);
  } catch (error) {
    console.error('[BankAccounts] Error creating:', error);
    res.status(500).json({ message: 'Error creating bank account.' });
  }
};

// PUT /api/bank-accounts/:id — Update account number
const updateAccount = async (req, res) => {
  try {
    const account = await BankAccount.findByPk(req.params.id);
    if (!account) return res.status(404).json({ message: 'Account not found.' });
    if (account.userId !== req.user.id) return res.status(403).json({ message: 'Unauthorized.' });

    const { accountNumber } = req.body;
    if (accountNumber !== undefined) account.accountNumber = accountNumber;

    await account.save();
    res.json(account);
  } catch (error) {
    console.error('[BankAccounts] Error updating:', error);
    res.status(500).json({ message: 'Error updating bank account.' });
  }
};

// DELETE /api/bank-accounts/:id — Remove account
const deleteAccount = async (req, res) => {
  try {
    const account = await BankAccount.findByPk(req.params.id);
    if (!account) return res.status(404).json({ message: 'Account not found.' });
    if (account.userId !== req.user.id) return res.status(403).json({ message: 'Unauthorized.' });

    await account.destroy();
    res.json({ message: 'Account deleted.' });
  } catch (error) {
    console.error('[BankAccounts] Error deleting:', error);
    res.status(500).json({ message: 'Error deleting bank account.' });
  }
};

module.exports = { getMyAccounts, createAccount, updateAccount, deleteAccount };
