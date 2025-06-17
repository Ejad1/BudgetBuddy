const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount'],
    min: [0.01, 'Amount must be positive'],
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    trim: true,
  },
  date: {
    type: Date,
    required: [true, 'Please add a date'],
    default: Date.now,
  },
  note: {
    type: String,
    trim: true,
  },
  receipt: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Expense', ExpenseSchema); 