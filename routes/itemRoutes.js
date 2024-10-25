const express = require('express');
const {
  createItem,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  assignItem,
  returnItem,
  reassignItem,
  requestItem,
  searchItems,
  viewAssignedItems,
} = require('../controllers/itemController');
const { protect, storekeeperOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all items with optional filters (available to all authenticated users)
router.get('/', protect, getItems);

router.get('/search', protect, searchItems);
router.get('/assigned', protect, viewAssignedItems);
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

router.put('/return/:itemId', protect, storekeeperOnly, returnItem);

router.put('/reassign/:itemId', protect, storekeeperOnly, reassignItem);

router.post('/request/:itemId', protect, requestItem);

module.exports = router;
