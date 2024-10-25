/**
 * @module itemRoutes
 * @description Express routes for managing items and assignments.
 */

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

/**
 * GET /items - Get all items.
 * POST /items - Create a new item (Storekeeper only).
 * PUT /items/:id - Update an item (Storekeeper only).
 * DELETE /items/:id - Delete an item (Storekeeper only).
 * POST /items/assign/:itemId - Assign an item to a user (Storekeeper only).
 * PUT /items/return/:itemId - Return an assigned item (Storekeeper only).
 * PUT /items/reassign/:itemId - Reassign an item (Storekeeper only).
 * POST /items/request/:itemId - Request an item.
 * GET /items/assigned - Get assigned items for the logged-in user.
 */

router.get('/', protect, getItems);

router.get('/search', protect, searchItems);

router.get('/assigned', protect, viewAssignedItems);

router.get('/:id', protect, getItemById);

router.post('/', protect, storekeeperOnly, createItem);

router.put('/:id', protect, storekeeperOnly, updateItem);

router.delete('/:id', protect, storekeeperOnly, deleteItem);

router.post('/assign/:itemId', protect, storekeeperOnly, assignItem);

router.put('/return/:itemId', protect, storekeeperOnly, returnItem);

router.put('/reassign/:itemId', protect, storekeeperOnly, reassignItem);

router.post('/request/:itemId', protect, requestItem);

module.exports = router;
