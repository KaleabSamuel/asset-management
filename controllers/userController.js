const User = require('../models/userModel');
const {
  generateAccessToken,
  generateRefreshToken,
} = require('../utils/jwtUtils');
const logger = require('../config/logger');
const jwt = require('jsonwebtoken');

/**
 * @function register
 * @description Registers a new user.
 * @route POST /users/register
 * @access Public
 * @param {string} firstName - User's first name.
 * @param {string} lastName - User's last name.
 * @param {string} email - User's email.
 * @param {string} password - User's password.
 * @param {string} role - Role of the user (e.g., employee, storekeeper).
 * @returns {Object} Success message and user details.
 */
exports.register = async (req, res) => {
  const { firstName, lastName, email, password, role } = req.body; // Updated
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      logger.warn(`User registration failed: Email ${email} already exists`);
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
    }); // Updated
    logger.info(`User registered: ${email}`);
    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    logger.error(`User registration error: ${error.message}`);
    res.status(400).json({ message: error.message });
  }
};

/**
 * @function login
 * @description Logs in a user and generates tokens.
 * @route POST /users/login
 * @access Public
 * @param {string} email - User's email.
 * @param {string} password - User's password.
 * @returns {Object} Access and refresh tokens.
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      logger.warn(`Login failed for ${email}: Invalid credentials`);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    logger.info(`User logged in: ${email}`);
    res.json({ accessToken, refreshToken });
  } catch (error) {
    logger.error(`Login error for ${email}: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @function logout
 * @description Logs out the current user.
 * @route POST /users/logout
 * @access Authenticated User
 * @returns {Object} Success message.
 */
exports.logout = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.refreshToken = null;
    await user.save();
    logger.info(`User logged out: ${user.email}`);
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @function refreshToken
 * @description Generates a new access token using the refresh token.
 * @route POST /users/refresh-token
 * @access Public
 * @param {string} refreshToken - User's refresh token.
 * @returns {Object} New access token.
 */
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(401).json({ message: 'Refresh token required' });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const newAccessToken = generateAccessToken(user);
    logger.info(`Token Refreshed: ${user.email}`);
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    logger.error(`Token Refresh Failed: ${error.message}`);
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

/**
 * @function getUserProfile
 * @description Retrieves the profile of the authenticated user.
 * @route GET /users/profile
 * @access Authenticated User
 * @returns {Object} User profile details.
 */
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user); // Profile now includes firstName and lastName
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @function updateNotificationSettings
 * @description Updates the notification settings for the user.
 * @route PUT /users/notification-settings
 * @access Authenticated User
 * @param {boolean} notificationsEnabled - New notification setting.
 * @returns {Object} Success message.
 */
exports.updateNotificationSettings = async (req, res) => {
  const { notificationsEnabled } = req.body;

  try {
    const user = await User.findById(req.user._id);
    user.enabled = notificationsEnabled;
    await user.save();

    logger.info(`Notification Changed Successfully: ${user.email}`);
    res.json({ message: 'Notification settings updated successfully' });
  } catch (error) {
    logger.error(`Notification Change Failed: ${error.message}`);
    res
      .status(500)
      .json({ message: 'Failed to update settings', error: error.message });
  }
};
