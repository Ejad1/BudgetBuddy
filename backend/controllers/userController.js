const User = require('../models/User');
const asyncHandler = require('express-async-handler'); // For handling errors in async express routes
const path = require('path');
const fs = require('fs');

// @desc    Update user email
// @route   PUT /api/user/email
// @access  Private
const updateEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const userId = req.user.id; // Assuming authMiddleware adds user to req

  if (!email) {
    res.status(400);
    throw new Error('Please provide an email');
  }

  // Validate email format (basic validation, mongoose schema also validates)
  const emailRegex = /^(([^<>()[\\]\\.,;:\s@\"]+(\.[^<>()[\\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!emailRegex.test(String(email).toLowerCase())) {
      res.status(400);
      throw new Error('Please provide a valid email format');
  }

  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if email is already taken by another user
  const emailExists = await User.findOne({ email: String(email).toLowerCase(), _id: { $ne: userId } });
  if (emailExists) {
    res.status(400);
    throw new Error('Email already in use by another account');
  }

  user.email = String(email).toLowerCase();
  const updatedUser = await user.save();

  let fullProfilePictureUrl = updatedUser.profilePictureUrl;
  if (updatedUser.profilePictureUrl && !updatedUser.profilePictureUrl.startsWith('http')) {
    fullProfilePictureUrl = `${req.protocol}://${req.get('host')}${updatedUser.profilePictureUrl}`;
  }

  res.status(200).json({
    message: 'Email updated successfully',
    user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        profilePictureUrl: fullProfilePictureUrl,
        currency: updatedUser.currency
    }
  });
});

// @desc    Update user profile picture
// @route   PUT /api/user/profile-picture
// @access  Private
const updateProfilePicture = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const user = await User.findById(userId).select('+password'); // select password to save it back later if needed

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (!req.file) {
    res.status(400);
    throw new Error('Please upload an image file');
  }

  // Optionally: Delete old profile picture if it exists and is not a default one
  if (user.profilePictureUrl && user.profilePictureUrl !== '') {
    const oldPicRelativePath = user.profilePictureUrl;
    if (oldPicRelativePath.startsWith('/uploads/')) { // Only attempt to delete if it looks like our uploaded path
        const oldPicAbsolutePath = path.join(__dirname, '..', '..', oldPicRelativePath); // Navigate up from controllers to project root then to uploads
        // Check if file exists before attempting to delete
        if (fs.existsSync(oldPicAbsolutePath)) {
            fs.unlink(oldPicAbsolutePath, (err) => {
                if (err) console.error('Error deleting old profile picture:', err);
                else console.log('Old profile picture deleted:', oldPicAbsolutePath);
            });
        } else {
            console.log('Old profile picture not found, skipping delete:', oldPicAbsolutePath);
        }
    }
  }

  // Path for the new picture, relative to the server root, suitable for URL
  const newProfilePictureUrl = `/uploads/profile_pictures/${req.file.filename}`;

  user.profilePictureUrl = newProfilePictureUrl;
  await user.save(); // This will trigger the 'save' pre-hook if only password was modified, but here we modify profilePictureUrl

  let fullProfilePictureUrlAfterUpdate = user.profilePictureUrl;
  if (user.profilePictureUrl && !user.profilePictureUrl.startsWith('http')) {
    fullProfilePictureUrlAfterUpdate = `${req.protocol}://${req.get('host')}${user.profilePictureUrl}`;
  }

  res.status(200).json({
    message: 'Profile picture updated successfully',
    user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePictureUrl: fullProfilePictureUrlAfterUpdate,
        currency: user.currency
    }
  });
});

// @desc    Update user preferences (e.g., currency)
// @route   PUT /api/user/preferences
// @access  Private
const updatePreferences = asyncHandler(async (req, res) => {
  const { currency } = req.body;
  const userId = req.user.id;

  // TODO: Validate currency against a predefined list of allowed currencies
  if (!currency || typeof currency !== 'string' || currency.length > 5) { 
    res.status(400);
    throw new Error('Please provide a valid currency code (e.g., USD, EUR)');
  }

  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.currency = currency.toUpperCase();
  await user.save();

  let fullProfilePictureUrlPrefs = user.profilePictureUrl;
  if (user.profilePictureUrl && !user.profilePictureUrl.startsWith('http')) {
    fullProfilePictureUrlPrefs = `${req.protocol}://${req.get('host')}${user.profilePictureUrl}`;
  }

  res.status(200).json({
    message: 'Preferences updated successfully',
    user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePictureUrl: fullProfilePictureUrlPrefs,
        currency: user.currency
    }
  });
});

module.exports = { 
  updateEmail, 
  updateProfilePicture, 
  updatePreferences 
}; 