const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token expires in 30 days
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Create user (password hashing is handled by pre-save hook in User model)
    const user = await User.create({
      username,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error); // Pass error to the error handler middleware
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // Check for user by email (include password in selection)
    const user = await User.findOne({ email }).select('+password');

    // Check if user exists and password matches
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user password
// @route   PUT /api/auth/updatepassword
// @access  Private
const updatePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  // Basic validation
  if (!currentPassword || !newPassword) {
    res.status(400);
    return next(new Error('Please provide current and new passwords'));
  }

  if (newPassword.length < 6) {
      res.status(400);
      return next(new Error('New password must be at least 6 characters long'));
  }

  try {
    // Get user from DB (req.user is added by protect middleware)
    // Need to select the password field specifically as it's excluded by default
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      // Should not happen if protect middleware works, but good practice
      res.status(404);
      return next(new Error('User not found'));
    }

    // Check if current password matches
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      res.status(401);
      return next(new Error('Incorrect current password'));
    }

    // Hash and update the new password (pre-save hook will hash it)
    user.password = newPassword;
    await user.save();

    // Password updated successfully
    // Optional: Send back a success message or the updated user (without password)
    res.json({ success: true, message: 'Password updated successfully' });

  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    // req.user is set by the protect middleware
    const user = await User.findById(req.user.id).select('-password'); // Exclude password

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    let fullProfilePictureUrl = user.profilePictureUrl;
    if (user.profilePictureUrl && !user.profilePictureUrl.startsWith('http')) {
      fullProfilePictureUrl = `${req.protocol}://${req.get('host')}${user.profilePictureUrl}`;
    }

    res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePictureUrl: fullProfilePictureUrl, // Send full URL
        currency: user.currency,
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  updatePassword,
  getMe,
};
