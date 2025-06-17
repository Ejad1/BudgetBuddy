const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const profileUpload = require('../middlewares/profileUploadMiddleware');
const { 
  updateEmail, 
  updateProfilePicture, 
  updatePreferences 
} = require('../controllers/userController');

// All routes here are prefixed with /api/user (defined in server.js)

// PUT /api/user/email - Update user email
router.put('/email', protect, updateEmail);

// PUT /api/user/profile-picture - Update user profile picture
router.put('/profile-picture', protect, profileUpload, updateProfilePicture);

// PUT /api/user/preferences - Update user preferences (e.g., currency)
router.put('/preferences', protect, updatePreferences);

module.exports = router; 