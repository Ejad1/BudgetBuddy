const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  updatePassword,
  getMe,
} = require('../controllers/authController');
const { protect } = require('../middlewares/protectMiddleware');

// @route   POST /api/auth/register
router.post('/register', registerUser);

// @route   POST /api/auth/login
router.post('/login', loginUser);

// @route   GET /api/auth/me - Get current user profile
router.get('/me', protect, getMe);

// Private route for updating password
router.put('/updatepassword', protect, updatePassword);

module.exports = router; 