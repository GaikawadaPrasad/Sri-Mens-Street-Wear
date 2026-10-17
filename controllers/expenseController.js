const Expense = require('../models/Expense');

// @desc    Get expenses for a specific month
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = async (req, res) => {
  try {
    let query = {};
    if (req.query.all === 'true' || req.query.month === 'all') {
      query = {};
    } else {
      let { month } = req.query;
      if (!month) {
        month = new Date().toISOString().slice(0, 7);
      }
      query = { month };
    }

    const expenses = await Expense.find(query).sort({ date: -1, createdAt: -1 });

    const totalAmount = expenses.reduce((sum, item) => sum + item.amount, 0);

    const categoryBreakdown = {
      'Stock/Inventory': 0,
      'Rent': 0,
      'Utilities': 0,
      'Salaries': 0,
      'Packaging': 0,
      'Maintenance': 0,
      'Other': 0
    };

    expenses.forEach(item => {
      if (categoryBreakdown[item.category] !== undefined) {
        categoryBreakdown[item.category] += item.amount;
      } else {
        categoryBreakdown.Other = (categoryBreakdown.Other || 0) + item.amount;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        expenses,
        summary: {
          totalAmount,
          categoryBreakdown
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Add a new expense
// @route   POST /api/expenses
// @access  Private (Admin Only)
exports.addExpense = async (req, res) => {
  try {
    const { itemName, amount, category, date, notes } = req.body;

    if (!itemName || !amount || !category || !date) {
      return res.status(400).json({ success: false, error: 'Please provide all required fields' });
    }

    const month = date.slice(0, 7);

    const expense = await Expense.create({
      itemName,
      amount: Number(amount),
      category,
      date,
      month,
      notes: notes || '',
      createdBy: req.user ? req.user.username : 'admin'
    });

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private (Admin Only)
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ success: false, error: 'Expense item not found' });
    }

    await expense.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
