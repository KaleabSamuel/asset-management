const Item = require('../models/itemModel');
const User = require('../models/userModel');
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

// Create a new item
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

// Get all items with optional filters
exports.getItems = async (req, res) => {
  const filters = req.query;
  try {
    const items = await Item.find(filters).populate(
      'assignments.user',
      'name email'
    );
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single item by ID
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

// Update an item by ID
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

// Delete an item by ID
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

// Assign an item to a user
exports.assignItem = async (req, res) => {
  const { userId, returnDate } = req.body;
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.quantity < 1) {
      return res
        .status(400)
        .json({ message: 'Insufficient stock to assign this item.' });
    }

    const currentAssignment = item.assignments.find(
      (a) => a.user.toString() === userId
    );
    if (currentAssignment) {
      currentAssignment.returnDate = returnDate;
    } else {
      item.assignments.push({ user: userId, returnDate });
      item.quantity--;
    }

    await item.save();
    const user = await User.findById(userId);
    user.notifications.push({
      message: `Assigned a new item: ${item.name}`,
      type: 'assignment',
    });
    await user.save();
    logger.info(`Item assigned: ${item.name} to user ${userId}`);
    res.json({ message: 'Item assigned successfully', item });
  } catch (error) {
    logger.error(`Item assignment error: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

exports.returnItem = async (req, res) => {
  const { itemId } = req.params;
  const { userId } = req.body;

  try {
    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const assignmentIndex = item.assignments.findIndex(
      (a) => a.user.toString() === userId
    );

    if (assignmentIndex === -1) {
      return res
        .status(400)
        .json({ message: 'No active assignment found for this user.' });
    }

    item.assignments.splice(assignmentIndex, 1);
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

exports.reassignItem = async (req, res) => {
  const { itemId } = req.params;
  const { currentUserId, newUserId, returnDate } = req.body;

  try {
    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Find the index of the current assignment
    const assignmentIndex = item.assignments.findIndex(
      (a) => a.user.toString() === currentUserId
    );

    if (assignmentIndex === -1) {
      return res
        .status(400)
        .json({ message: 'No active assignment found for the current user.' });
    }

    // Remove the old assignment from the array
    item.assignments.splice(assignmentIndex, 1);

    // Create a new assignment for the new user
    item.assignments.push({ user: newUserId, returnDate });

    await item.save();

    // Notify the previous user
    const currentUser = await User.findById(currentUserId);
    currentUser.notifications.push({
      message: `Item ${item.name} has been reassigned from you.`,
    });
    await currentUser.save();

    // Notify the new user
    const newUser = await User.findById(newUserId);
    newUser.notifications.push({
      message: `You have been assigned ${item.name}.`,
      type: 'assignment',
    });
    await newUser.save();

    logger.info(`Item reassigned successfully ${item.name}`);
    res.json({ message: 'Item reassigned successfully', item });
  } catch (error) {
    logger.error(`Item Reassignment Failed: ${error.message}`);
    res
      .status(500)
      .json({ message: 'Failed to reassign item', error: error.message });
  }
};

exports.requestItem = async (req, res) => {
  const { itemId } = req.params;
  const userId = req.body.userId;

  try {
    const item = await Item.findById(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    if (item.quantity <= 0) {
      return res.status(400).json({ message: 'Item is out of stock' });
    }

    const user = await User.findById(userId);
    user.notifications.push({ message: `Requested item: ${item.name}` });
    await user.save();

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

exports.searchItems = async (req, res) => {
  const { name, category } = req.query;
  const filter = {};
  console.log('works');
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

exports.viewAssignedItems = async (req, res) => {
  try {
    const items = await Item.find({
      'assignments.user': req.user.id,
    });

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
