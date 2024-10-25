/**
 * @module authMiddleware
 * @description Middleware for authentication and authorization using JWT.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

/**
 * @function protect
 * @description Middleware to authenticate users using JWT.
 * @param {Object} req - Request object, containing headers with the token.
 * @param {Object} res - Response object.
 * @param {Function} next - Callback to the next middleware.
 * @throws {401} If no valid token is provided.
 */
const protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/**
 * @function storekeeperOnly
 * @description Middleware to restrict access to storekeepers.
 * @param {Object} req - Request object containing authenticated user data.
 * @param {Object} res - Response object.
 * @param {Function} next - Callback to the next middleware.
 * @throws {403} If the user is not a storekeeper.
 */
const storekeeperOnly = (req, res, next) => {
  if (req.user.role !== 'storekeeper') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

module.exports = { protect, storekeeperOnly };
