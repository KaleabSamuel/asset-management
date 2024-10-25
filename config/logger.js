const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize } = format;

// Custom log format
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

/**
 * @module logger
 * @description Custom logger using Winston for logging application events.
 * Supports console and file logging with timestamps and custom formats.
 */
const logger = createLogger({
  level: 'info', // Log levels: error, warn, info, verbose, debug, silly
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Add timestamp
    logFormat // Apply custom format
  ),
  transports: [
    new transports.Console({ format: combine(colorize(), logFormat) }),
    new transports.File({ filename: 'logs/app.log' }), // File logs
  ],
});

module.exports = logger;
