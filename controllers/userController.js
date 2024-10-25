const User = require('../models/userModel');
const {
  generateAccessToken,
  generateRefreshToken,
} = require('../utils/jwtUtils');
const logger = require('../config/logger');

// Register a new user
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

// User login
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

// User logout
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

// Refresh access token using refresh token
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
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

// Get user profile (authenticated users only)
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user); // Profile now includes firstName and lastName
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
