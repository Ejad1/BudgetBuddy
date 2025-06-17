const Category = require('../models/Category');

// @desc    Get all categories for logged in user
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res, next) => {
  try {
    // Find categories belonging to the logged-in user, sort by name
    const categories = await Category.find({ user: req.user.id }).sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    console.error(err);
    next(err); 
  }
};

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res, next) => {
  const { name } = req.body;

  if (!name) {
    res.status(400);
    return next(new Error('Please provide a category name'));
  }

  try {
    // Check if category already exists for this user (case-insensitive check is often useful)
    const existingCategory = await Category.findOne({ 
        user: req.user.id, 
        name: { $regex: `^${name}$`, $options: 'i' } // Case-insensitive exact match
    });

    if (existingCategory) {
      res.status(400);
      return next(new Error('Category already exists for this user'));
    }

    const newCategory = new Category({
      user: req.user.id,
      name: name.trim(), // Trim whitespace
    });

    const category = await newCategory.save();
    res.status(201).json(category);
  } catch (err) {
    // Handle potential duplicate key error from the index
    if (err.code === 11000) {
        res.status(400);
        return next(new Error('Category already exists (check case)'));
    }
    console.error(err);
    next(err);
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private
const updateCategory = async (req, res, next) => {
  const { name } = req.body;
  const categoryId = req.params.id;

  if (!name) {
    res.status(400);
    return next(new Error('Please provide a new category name'));
  }

  try {
    let category = await Category.findById(categoryId);

    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }

    // Check if user owns the category
    if (category.user.toString() !== req.user.id) {
      res.status(401);
      throw new Error('User not authorized to update this category');
    }

    // Check if the new name already exists for this user (excluding the current category itself)
     const existingCategory = await Category.findOne({ 
        user: req.user.id, 
        name: { $regex: `^${name}$`, $options: 'i' },
        _id: { $ne: categoryId } // Exclude the current category from the check
    });

    if (existingCategory) {
      res.status(400);
      return next(new Error('Another category with this name already exists'));
    }

    // Update the name
    category.name = name.trim();
    const updatedCategory = await category.save();

    res.json(updatedCategory);

  } catch (err) {
     if (err.code === 11000) {
        res.status(400);
        return next(new Error('Category name conflict (check case)'));
    }
    console.error(err);
    next(err);
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private
const deleteCategory = async (req, res, next) => {
  const categoryId = req.params.id;

  try {
    const category = await Category.findById(categoryId);

    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }

    // Check if user owns the category
    if (category.user.toString() !== req.user.id) {
      res.status(401);
      throw new Error('User not authorized to delete this category');
    }
    
    // Optional: Check if this category is used by any expenses before deleting?
    // This adds complexity but might be desirable.
    // Example: const expensesUsingCategory = await Expense.countDocuments({ user: req.user.id, category: category.name });
    // if (expensesUsingCategory > 0) { ... return error ... }

    await category.deleteOne();

    res.json({ message: 'Category removed' });

  } catch (err) {
    console.error(err);
    next(err);
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory, // Added update function
  deleteCategory,
}; 