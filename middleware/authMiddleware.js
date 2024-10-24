const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

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

const storekeeperOnly = (req, res, next) => {
  if (req.user.role !== 'storekeeper') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

module.exports = { protect, storekeeperOnly };