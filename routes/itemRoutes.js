const express = require('express');
const {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  assignItem,
  returnOrReassignItem,
} = require('../controllers/itemController');
const { protect, storekeeperOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all items with optional filters (available to all authenticated users)
router.get('/', protect, getItems);

// Get a single item by ID
router.get('/:id', protect, getItemById);

// Create a new item (storekeepers only)
router.post('/', protect, storekeeperOnly, createItem);

// Update an item by ID (storekeepers only)
router.put('/:id', protect, storekeeperOnly, updateItem);

// Delete an item by ID (storekeepers only)
router.delete('/:id', protect, storekeeperOnly, deleteItem);

// Assign an item to a user (storekeepers only)
router.post('/assign/:itemId', protect, storekeeperOnly, assignItem);

// Return or reassign an item (storekeepers only)
router.post(
  '/return-or-reassign/:itemId',
  protect,
  storekeeperOnly,
  returnOrReassignItem
);

module.exports = router;
