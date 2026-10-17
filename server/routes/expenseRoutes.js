const express = require('express');
const router = express.Router();
const { getExpenses, addExpense, deleteExpense } = require('../controllers/expenseController');
const { protect, admin } = require('../utils/authMiddleware');

// Logged-in users can read, only admin can create or delete expenses
router.route('/')
  .get(protect, getExpenses)
  .post(protect, admin, addExpense);

router.route('/:id')
  .delete(protect, admin, deleteExpense);

module.exports = router;
