/**
 * @module userRoutes
 * @description Express routes for managing user authentication and profiles.
 */

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

/**
 * POST /users/register - Register a new user.
 * POST /users/login - Log in a user and generate tokens.
 * POST /users/logout - Log out the current user.
 * POST /users/refresh-token - Refresh the access token.
 * GET /users/profile - Get the logged-in user's profile.
 * POST /users/notifications/settings - Update notification settings.
 */

router.post('/register', register);

router.post('/login', login);

router.post('/logout', protect, logout);

router.post('/refresh-token', refreshToken);

router.get('/profile', protect, getUserProfile);

router.post('/notifications/settings', protect, updateNotificationSettings);

module.exports = router;
