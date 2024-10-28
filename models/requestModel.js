const mongoose = require('mongoose');

/**
 * @typedef Request
 * @property {ObjectId} user - User who made the request.
 * @property {ObjectId} item - Item requested by the user.
 * @property {Date} requestDate - Date the request was made.
 * @property {string} status - Status of the request ('pending', 'approved', 'rejected').
 */
const requestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  requestDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
});

module.exports = mongoose.model('Request', requestSchema);
