const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize } = format;

// Custom log format
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

// Create Winston logger
const logger = createLogger({
  level: 'info', // Log levels: error, warn, info, verbose, debug, silly
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Add timestamp
    logFormat // Apply custom format
  ),
  transports: [
    new transports.Console({ format: combine(colorize(), logFormat) }), // Console logs with color
    new transports.File({ filename: 'logs/app.log' }), // File logs
  ],
});

module.exports = logger;
