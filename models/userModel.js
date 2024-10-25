/**
 * @module userModel
 * @description Mongoose model for managing users and notifications.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * @typedef Notification
 * @property {string} message - Notification message.
 * @property {boolean} read - Whether the notification has been read.
 * @property {string} type - Type of notification ('assignment', 'request', or 'other').
 * @property {boolean} enabled - Whether the notification has been enabled or not.
 */
const notificationSchema = new mongoose.Schema({
  message: String,
  read: { type: Boolean, default: false },
  type: {
    type: String,
    enum: ['assignment', 'request', 'other'],
    default: 'other',
  },
  enabled: {
    type: Boolean,
    default: true,
  },
});

/**
 * @typedef User
 * @property {string} firstName - User's first name.
 * @property {string} lastName - User's last name.
 * @property {string} email - User's email address.
 * @property {string} password - User's hashed password.
 * @property {string} role - Role of the user ('employee' or 'storekeeper').
 * @property {Notification[]} notifications - List of notifications for the user.
 * @property {string} refreshToken - JWT refresh token for the user.
 */
const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true }, // Changed from 'name'
    lastName: { type: String, required: true }, // New field added
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['employee', 'storekeeper'],
      default: 'employee',
    },
    notifications: [notificationSchema],
    refreshToken: { type: String },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare passwords
userSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
