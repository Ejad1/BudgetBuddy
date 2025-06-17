const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define the upload directory path for profile pictures
const profileUploadDir = path.join(__dirname, '..', 'uploads', 'profile_pictures');

// Ensure the profile picture upload directory exists
if (!fs.existsSync(profileUploadDir)) {
  fs.mkdirSync(profileUploadDir, { recursive: true });
}

// Set storage engine for profile pictures
const profilePictureStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, profileUploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename: user-<userId>-timestamp.ext (assuming req.user.id is available)
    const userId = req.user ? req.user.id : 'guest';
    cb(null, `user-${userId}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

// Check file type for images
function checkImageType(file, cb) {
  const filetypes = /jpeg|jpg|png|gif/i; // Case insensitive regex
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Error: Images Only! Allowed types: jpeg, jpg, png, gif'), false);
  }
}

// Init upload variable for profile picture
const profileUpload = multer({
  storage: profilePictureStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Limit file size to 2MB for profile pictures
  fileFilter: function (req, file, cb) {
    checkImageType(file, cb);
  }
}).single('profilePicture'); // Expect a single file with the field name 'profilePicture'

module.exports = profileUpload; 