const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', 
  },
  name: {
    type: String,
    required: [true, 'Please add a category name'],
    trim: true,
    unique: false, // Category names don't need to be globally unique, but maybe per user?
  },
}, {
  timestamps: true,
});

// Optional: Add a compound index to ensure category name is unique per user
CategorySchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Category', CategorySchema); 