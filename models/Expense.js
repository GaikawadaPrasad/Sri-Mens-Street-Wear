const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Stock/Inventory', 'Rent', 'Utilities', 'Salaries', 'Packaging', 'Maintenance', 'Other'],
    default: 'Stock/Inventory'
  },
  date: {
    type: String,
    required: [true, 'Date is required'] // YYYY-MM-DD
  },
  month: {
    type: String,
    required: [true, 'Month is required'] // YYYY-MM
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  createdBy: {
    type: String,
    required: [true, 'Creator is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index by month for speedy lookup by calendar period
ExpenseSchema.index({ month: 1, date: -1 });

module.exports = mongoose.model('Expense', ExpenseSchema);
