const mongoose = require('mongoose');
const logger = require('../config/logger');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
    logger.info('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    logger.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;