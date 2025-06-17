const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (Bearer token)
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token payload (id) and attach to request
      // Exclude password field from the user object attached to req
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
          // Handle case where user associated with token no longer exists
          res.status(401);
          throw new Error('Not authorized, user not found');
      }

      next(); // Proceed to the next middleware/route handler
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401);
      // Distinguish between different errors if needed (e.g., expired token)
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Not authorized, token failed');
      } else if (error.name === 'TokenExpiredError') {
        throw new Error('Not authorized, token expired');
      } else {
         throw new Error('Not authorized, token issue');
      }
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
};

module.exports = { protect }; 