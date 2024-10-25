const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
