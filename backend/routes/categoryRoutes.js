const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect } = require('../middlewares/protectMiddleware');

// Apply protect middleware to all routes in this file
router.use(protect);

// Route to get all categories and create a new category
router.route('/')
  .get(getCategories)
  .post(createCategory);

// Route to update and delete a specific category by ID
router.route('/:id')
  .put(updateCategory)
  .delete(deleteCategory);

module.exports = router; 