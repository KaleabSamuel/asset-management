/**
 * @module itemModel
 * @description Mongoose model for managing inventory items and assignments.
 */

const mongoose = require('mongoose');

/**
 * @typedef Item
 * @property {string} name - Name of the item.
 * @property {string} description - Description of the item.
 * @property {string} model - Model name of the item.
 * @property {string} category - Category to which the item belongs.
 * @property {number} quantity - Quantity of the item in stock.
 */
const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    model: String,
    category: String,
    quantity: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Item', itemSchema);
