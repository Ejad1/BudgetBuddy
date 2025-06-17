const express = require('express');
const router = express.Router();
const {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} = require('../controllers/expenseController');
const { protect } = require('../middlewares/protectMiddleware');
const upload = require('../middlewares/uploadMiddleware'); // Import upload middleware

// Apply protect middleware to all routes in this file
router.use(protect);

// Route to get all expenses for the user and create a new expense
router.route('/')
  .get(getExpenses) 
  .post(upload, createExpense); // Use upload middleware before createExpense

// Route to update and delete a specific expense by ID
router.route('/:id')
  .put(upload, updateExpense) // Use upload middleware before updateExpense
  .delete(deleteExpense);

module.exports = router; 