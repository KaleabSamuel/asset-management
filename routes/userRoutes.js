const express = require('express');
const {
  register,
  login,
  logout,
  refreshToken,
  getUserProfile,
  updateNotificationSettings,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Register a new user
router.post('/register', register);

// User login
router.post('/login', login);

// User logout (requires authentication)
router.post('/logout', protect, logout);

// Refresh access token
router.post('/refresh-token', refreshToken);

// Get authenticated user profile
router.get('/profile', protect, getUserProfile);

router.post('/notifications/settings', protect, updateNotificationSettings);

module.exports = router;
