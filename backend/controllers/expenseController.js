const Expense = require('../models/Expense');
const User = require('../models/User'); // Needed for validation potentially
const path = require('path');
const fs = require('fs'); // File system module for deleting files
const multer = require('multer');

// --- Multer Configuration for Receipt Uploads ---

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/receipts');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Define storage settings for Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir); // Set the destination folder
  },
  filename: function (req, file, cb) {
    // Create a unique filename: fieldname-timestamp.extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to accept only images (adjust mimetypes as needed)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image.'), false);
  }
};

// Initialize Multer upload middleware
// 'receipt' should match the name attribute of the file input field in the frontend form
const upload = multer({ storage: storage, fileFilter: fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // Limit file size to 5MB

// --- Controller Functions ---

// @desc    Get all expenses for logged in user
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 }); // Sort by date descending
    res.json(expenses);
  } catch (err) {
    console.error(err);
    next(err); // Pass to error handler
  }
};

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res, next) => {
  // req.file is added by multer middleware if a file is uploaded
  const { amount, category, date, note } = req.body;

  try {
    const newExpense = new Expense({
      user: req.user.id, // Get user ID from the protect middleware
      amount,
      category,
      date,
      note,
      receipt: req.file ? `/uploads/receipts/${req.file.filename}` : undefined, // Store relative path if file exists
    });

    const expense = await newExpense.save();
    res.status(201).json(expense);
  } catch (err) {
    console.error(err);
    // If validation fails, remove uploaded file if it exists
    if (req.file) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting uploaded file after validation error:', unlinkErr);
      });
    }
    next(err);
  }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res, next) => {
  const { amount, category, date, note } = req.body;
  const expenseId = req.params.id;

  try {
    let expense = await Expense.findById(expenseId);

    if (!expense) {
      res.status(404);
      throw new Error('Expense not found');
    }

    // Check if user owns the expense
    if (expense.user.toString() !== req.user.id) {
      res.status(401); // Unauthorized
      throw new Error('User not authorized to update this expense');
    }

    // Check if a new file is uploaded
    let receiptPath = expense.receipt; // Keep old path by default
    if (req.file) {
      // If there was an old receipt, delete it
      if (expense.receipt) {
        const oldPath = path.join(__dirname, '../', expense.receipt); 
        fs.unlink(oldPath, (unlinkErr) => {
          if (unlinkErr) console.error('Error deleting old receipt file:', unlinkErr);
        });
      }
      // Set the new path
      receiptPath = `/uploads/receipts/${req.file.filename}`;
    }

    // Update fields
    expense.amount = amount || expense.amount;
    expense.category = category || expense.category;
    expense.date = date || expense.date;
    expense.note = note !== undefined ? note : expense.note; // Allow empty note
    expense.receipt = receiptPath;

    const updatedExpense = await expense.save();
    res.json(updatedExpense);

  } catch (err) {
    console.error(err);
     // If update fails and a new file was uploaded, delete the new file
     if (req.file) {
      fs.unlink(req.file.path, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting uploaded file after update error:', unlinkErr);
      });
    }
    next(err);
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res, next) => {
  const expenseId = req.params.id;

  try {
    const expense = await Expense.findById(expenseId);

    if (!expense) {
      res.status(404);
      throw new Error('Expense not found');
    }

    // Check if user owns the expense
    if (expense.user.toString() !== req.user.id) {
      res.status(401);
      throw new Error('User not authorized to delete this expense');
    }

    // Delete the receipt file if it exists
    if (expense.receipt) {
      const filePath = path.join(__dirname, '../', expense.receipt); 
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting receipt file:', unlinkErr);
      });
    }

    await expense.deleteOne(); // Use deleteOne() on the document

    res.json({ message: 'Expense removed' });

  } catch (err) {
    console.error(err);
    next(err);
  }
};

module.exports = {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  uploadReceipt: upload.single('receipt'), // Export Multer middleware for use in routes
};
