const mongoose = require('mongoose');

/**
 * @typedef Assignment
 * @property {ObjectId} user - User assigned the item.
 * @property {ObjectId} item - Assigned item.
 * @property {Date} assignedDate - Date of assignment.
 * @property {Date} returnDate - Expected return date.
 */
const assignmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true },
  assignedDate: { type: Date, default: Date.now },
  returnDate: { type: Date },
});

module.exports = mongoose.model('Assignment', assignmentSchema);
