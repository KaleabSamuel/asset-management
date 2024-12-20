const Item = require('../models/itemModel');
const User = require('../models/userModel');
const Request = require('../models/requestModel');
const Assignment = require('../models/assignmentModel');
const logger = require('../config/logger');
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const validateItemData = (data) => {
  const { name, description, model, category, quantity } = data;

  if (name && typeof name !== 'string') {
    throw new Error('Item name is required and must be a string.');
  }
  if (quantity && typeof quantity !== 'number' && quantity < 0) {
    throw new Error('Quantity must be a positive number.');
  }
  if (description && typeof description !== 'string') {
    throw new Error('Description must be a string.');
  }
  if (model && typeof model !== 'string') {
    throw new Error('Model must be a string.');
  }
  if (category && typeof category !== 'string') {
    throw new Error('Category must be a string.');
  }
};

/**
 * @function createItem
 * @description Creates a new item in the inventory.
 * @route POST /items
 * @access Storekeeper
 * @param {string} name - Name of the item.
 * @param {string} description - Description of the item.
 * @param {string} model - Model of the item.
 * @param {string} category - Category of the item.
 * @param {number} quantity - Quantity of the item in stock.
 * @returns {Object} Created item and success message.
 */
exports.createItem = async (req, res) => {
  const { name, description, model, category, quantity } = req.body;
  try {
    validateItemData(req.body);
    const item = await Item.create({
      name,
      description,
      model,
      category,
      quantity,
    });
    logger.info(`Item created: ${name}`);
    res.status(201).json({ message: 'Item created successfully', item });
  } catch (error) {
    logger.error(`Item creation error: ${error.message}`);
    res.status(400).json({ message: error.message });
  }
};

/**
 * @function getItems
 * @description Retrieves all items with optional filters.
 * @route GET /items
 * @access Public
 * @query {Object} filters - Optional filters to apply.
 * @returns {Array} List of items.
 */
exports.getItems = async (req, res) => {
  const filters = req.query;
  try {
    const items = await Item.find(filters).populate();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @function getItemById
 * @description Retrieves a specific item by ID.
 * @route GET /items/:id
 * @access Public
 * @param {string} id - ID of the item to retrieve.
 * @returns {Object} Retrieved item.
 */
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate(
      'assignments.user',
      'name email'
    );
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @function updateItem
 * @description Updates an existing item by ID.
 * @route PUT /items/:id
 * @access Storekeeper
 * @param {string} id - ID of the item to update.
 * @returns {Object} Updated item and success message.
 */
exports.updateItem = async (req, res) => {
  try {
    validateItemData(req.body);
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    logger.info(`Item ${item.name} updated Successully`);
    res.json({ message: 'Item updated successfully', item });
  } catch (error) {
    logger.error(`Item Update failed: ${error.message}`);
    res.status(400).json({ message: error.message });
  }
};

/**
 * @function deleteItem
 * @description Deletes an item by ID.
 * @route DELETE /items/:id
 * @access Storekeeper
 * @param {string} id - ID of the item to delete.
 * @returns {Object} Success message.
 */
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    logger.info(`${item.name} Item deleted successfully`);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    logger.error(`Item Deletion error: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @function assignItem
 * @description Assigns an item to a user.
 * @route POST /items/:itemId/assign
 * @access Storekeeper
 * @param {string} itemId - ID of the item to assign.
 * @param {string} userId - ID of the user to assign the item.
 * @param {Date} returnDate - Expected return date of the item.
 * @returns {Object} Success message and updated item.
 */
exports.assignItem = async (req, res) => {
  const { userId, returnDate } = req.body;
  const itemId = req.params.id;
  try {
    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.quantity < 1) {
      return res
        .status(400)
        .json({ message: 'Insufficient stock to assign this item.' });
    }

    const currentAssignment = await Assignment.findOne({
      user: userId,
      item: itemId,
    });
    if (currentAssignment) {
      currentAssignment.returnDate = returnDate;
      currentAssignment.save();
      logger.info(`Item is already assigned: ${item.name} to user ${userId}`);
      return res
        .status(201)
        .json({ message: 'Item is already assigned successfully', item });
    } else {
      const userRequest = await Request.findOne({ user: userId, item: itemId });

      if (userRequest) {
        await Request.deleteOne({ _id: userRequest._id });
      }
      item.quantity--;

      const assignment = await Assignment.create({
        user: userId,
        item: itemId,
        assignedDate: new Date(),
        returnDate: returnDate || null,
      });
    }

    await item.save();
    const user = await User.findById(userId);
    user.notifications.push({
      message: `Assigned a new item: ${item.name}`,
      type: 'assignment',
    });
    await user.save();
    logger.info(`Item assigned: ${item.name} to user ${userId}`);
    res.status(201).json({ message: 'Item assigned successfully', item });
  } catch (error) {
    logger.error(`Item assignment error: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @function returnItem
 * @description Returns an assigned item to the inventory.
 * @route PUT /items/:itemId/return
 * @access Storekeeper
 * @param {string} itemId - ID of the item being returned.
 * @param {string} userId - ID of the user returning the item.
 * @returns {Object} Success message and updated item.
 */
exports.returnItem = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    const item = await Item.findById(id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const assignment = await Assignment.findOneAndDelete({
      user: userId,
      item: id,
    });

    if (!assignment) {
      return res
        .status(400)
        .json({ message: 'No active assignment found for this user.' });
    }

    item.quantity++;
    await item.save();

    const user = await User.findById(userId);
    user.notifications.push({
      message: `You have returned ${item.name}.`,
      type: 'other',
    });
    await user.save();

    logger.info(`Item Returned Successfully: ${item.name}`);
    res.json({ message: 'Item returned successfully', item });
  } catch (error) {
    logger.error(`Item Return Error: ${error.message}`);
    res
      .status(500)
      .json({ message: 'Failed to return item', error: error.message });
  }
};

/**
 * @function reassignItem
 * @description Reassigns an item from one user to another.
 * @route PUT /items/:itemId/reassign
 * @access Storekeeper
 * @param {string} itemId - ID of the item being reassigned.
 * @param {string} currentUserId - ID of the current user.
 * @param {string} newUserId - ID of the new user.
 * @param {Date} returnDate - Expected return date of the item.
 * @returns {Object} Success message and updated item.
 */
exports.reassignItem = async (req, res) => {
  const { id } = req.params;
  const { currentUserId, newUserId, returnDate } = req.body;

  try {
    const item = await Item.findById(id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Find the index of the current assignment
    const assignment = await Assignment.findOneAndDelete({
      user: currentUserId,
      item: id,
    });

    if (!assignment) {
      return res
        .status(400)
        .json({ message: 'No active assignment found for the current user.' });
    }

    const newAssigned = await Assignment.findOne({
      user: newUserId,
      item: id,
    });

    if (!newAssigned) {
      const newAssignment = await Assignment.create({
        user: newUserId,
        item: id,
        assignedDate: new Date(),
        returnDate: returnDate || null,
      });

      // Notify the new user
      const newUser = await User.findById(newUserId);
      newUser.notifications.push({
        message: `You have been assigned ${item.name}.`,
        type: 'assignment',
      });
      await newUser.save();

      item.quantity++;
      await item.save();
    }

    // Notify the previous user
    const currentUser = await User.findById(currentUserId);
    currentUser.notifications.push({
      message: `Item ${item.name} has been reassigned from you.`,
    });
    await currentUser.save();

    logger.info(`Item reassigned successfully ${item.name}`);
    res.json({ message: 'Item reassigned successfully', item });
  } catch (error) {
    logger.error(`Item Reassignment Failed: ${error.message}`);
    res
      .status(500)
      .json({ message: 'Failed to reassign item', error: error.message });
  }
};

/**
 * @function requestItem
 * @description Allows a user to request an item.
 * @route POST /items/:itemId/request
 * @access Employee
 * @param {string} itemId - ID of the item to request.
 * @param {string} userId - ID of the user making the request.
 * @returns {Object} Success message.
 */
exports.requestItem = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const item = await Item.findById(id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.quantity <= 0) {
      return res.status(400).json({ message: 'Item is out of stock' });
    }

    const userRequest = await Request.findOne({ user: userId, item: id });

    if (userRequest) {
      return res
        .status(404)
        .json({ message: 'You have already requested for this Item' });
    }

    const assigned = await Assignment.findOne({
      user: userId,
      item: id,
    });

    if (assigned)
      return res
        .status(404)
        .json({ message: 'You have been already assigned for this Item' });

    const user = await User.findById(userId);
    const request = await Request.create({
      user: userId,
      item: id,
    });

    logger.info(`User ${user.name} Requested ${item.name} Successfully`);
    res.json({
      message: `Request for item ${item.name} submitted successfully.`,
    });
  } catch (error) {
    logger.info(`Request Item Failed: ${error.message}`);
    res
      .status(500)
      .json({ message: 'Failed to request item', error: error.message });
  }
};

/**
 * @function searchItems
 * @description Searches items by name or category.
 * @route GET /items/search
 * @access Public
 * @query {string} name - Name of the item (optional).
 * @query {string} category - Category of the item (optional).
 * @returns {Array} List of matching items.
 */
exports.searchItems = async (req, res) => {
  const { name, category } = req.query;
  const filter = {};
  if (name) filter.name = new RegExp(name, 'i');
  if (category) filter.category = new RegExp(category, 'i');

  try {
    const items = await Item.find(filter);
    res.json(items);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to search items', error: error.message });
  }
};

/**
 * @function viewAssignedItems
 * @description Retrieves all items assigned to the current user.
 * @route GET /items/assigned
 * @access Employee
 * @returns {Array} List of assigned items.
 */
exports.viewAssignedItems = async (req, res) => {
  try {
    // const items = await Item.find({
    //   'assignments.user': req.user.id,
    // });

    const items = await Assignment.find({ user: req.user.id })
      .populate('user', 'firstName lastName')
      .populate('item', 'name description model category');

    if (!items || items.length === 0) {
      return res.status(404).json({ message: 'No items assigned to you.' });
    }
    res.json(items);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to retrieve assigned items',
      error: error.message,
    });
  }
};
