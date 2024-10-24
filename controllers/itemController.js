const Item = require('../models/itemModel');

// Create a new item
exports.createItem = async (req, res) => {
  const { name, description, model, category, quantity } = req.body;
  try {
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
    const item = await Item.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item updated successfully', item });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete an item by ID
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign an item to a user
exports.assignItem = async (req, res) => {
  const { userId, returnDate } = req.body;
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    item.assignments.push({ user: userId, returnDate });
    await item.save();
    logger.info(`Item assigned: ${item.name} to user ${userId}`);
    res.json({ message: 'Item assigned successfully', item });
  } catch (error) {
    logger.error(`Item assignment error: ${error.message}`);
    res.status(500).json({ message: error.message });
  }
};

// Return or reassign an item
exports.returnOrReassignItem = async (req, res) => {
  const { userId, newUserId, returnDate } = req.body;
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const currentAssignment = item.assignments.find(
      (a) => a.user.toString() === userId
    );
    if (currentAssignment) currentAssignment.returnDate = returnDate;

    if (newUserId) {
      item.assignments.push({ user: newUserId });
    }

    await item.save();
    res.json({ message: 'Item returned or reassigned successfully', item });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
