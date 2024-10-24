const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedDate: { type: Date, default: Date.now },
  returnDate: { type: Date },
});

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
