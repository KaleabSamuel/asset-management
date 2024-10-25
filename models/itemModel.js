/**
 * @module itemModel
 * @description Mongoose model for managing inventory items and assignments.
 */

const mongoose = require('mongoose');

/**
 * @typedef Assignment
 * @property {ObjectId} user - Reference to the user assigned the item.
 * @property {Date} assignedDate - Date of assignment.
 * @property {Date} returnDate - Date the item was returned.
 */
const assignmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedDate: { type: Date, default: Date.now },
  returnDate: { type: Date },
});

/**
 * @typedef Item
 * @property {string} name - Name of the item.
 * @property {string} description - Description of the item.
 * @property {string} model - Model name of the item.
 * @property {string} category - Category to which the item belongs.
 * @property {number} quantity - Quantity of the item in stock.
 * @property {Assignment[]} assignments - List of assignments for the item.
 */
const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    model: String,
    category: String,
    quantity: { type: Number, required: true, min: 0 },
    assignments: [assignmentSchema], // Allow multiple assignments
  },
  { timestamps: true }
);

module.exports = mongoose.model('Item', itemSchema);
