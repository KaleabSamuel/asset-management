/**
 * @module server
 * @description Main server configuration for the application.
 */

const express = require('express');
const connectDB = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const itemRoutes = require('./routes/itemRoutes');
const logger = require('./config/logger');
const expressWinston = require('express-winston');

require('dotenv').config();
const app = express();
app.use(express.json());

/**
 * Middleware to log all HTTP requests.
 */
app.use(
  expressWinston.logger({
    winstonInstance: logger,
    meta: true, // Include request metadata
    msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}}',
    expressFormat: true, // Use default Express format
    colorize: false,
  })
);

// Route handlers
app.use('/users', userRoutes);
app.use('/items', itemRoutes);

// Connect to MongoDB
connectDB();

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));

app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`);
  res.status(500).json({ message: 'Something went wrong' });
});
