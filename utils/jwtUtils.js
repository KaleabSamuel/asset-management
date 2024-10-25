/**
 * @module jwtUtils
 * @description Utilities for generating JWT access and refresh tokens.
 */

const jwt = require('jsonwebtoken');

/**
 * @function generateAccessToken
 * @description Generates a short-lived access token.
 * @param {Object} user - The user object containing the user ID and role.
 * @returns {string} JWT access token.
 */
const generateAccessToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });
};

/**
 * @function generateRefreshToken
 * @description Generates a long-lived refresh token.
 * @param {Object} user - The user object containing the user ID.
 * @returns {string} JWT refresh token.
 */
const generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
};

module.exports = { generateAccessToken, generateRefreshToken };
