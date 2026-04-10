const InventoryItem = require('../models/InventoryItem');

class InventoryController {
  static async getAllItems(req, res) {
    try {
      const items = await InventoryItem.getAll();
      res.json(items);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      res.status(500).json({ error: 'Failed to fetch inventory items' });
    }
  }

  static async getItemById(req, res) {
    try {
      const { id } = req.params;
      const item = await InventoryItem.getById(id);
      if (!item) {
        return res.status(404).json({ error: 'Inventory item not found' });
      }
      res.json(item);
    } catch (error) {
      console.error('Error fetching inventory item:', error);
      res.status(500).json({ error: 'Failed to fetch inventory item' });
    }
  }

  static async createItem(req, res) {
    try {
      const itemData = req.body;
      const newItem = await InventoryItem.create(itemData);
      res.status(201).json(newItem);
    } catch (error) {
      console.error('Error creating inventory item:', error);
      res.status(500).json({ error: 'Failed to create inventory item' });
    }
  }

  static async updateItem(req, res) {
    try {
      const { id } = req.params;
      const itemData = req.body;
      const updatedItem = await InventoryItem.update(id, itemData);
      if (!updatedItem) {
        return res.status(404).json({ error: 'Inventory item not found' });
      }
      res.json(updatedItem);
    } catch (error) {
      console.error('Error updating inventory item:', error);
      res.status(500).json({ error: 'Failed to update inventory item' });
    }
  }

  static async deleteItem(req, res) {
    try {
      const { id } = req.params;
      const deletedItem = await InventoryItem.delete(id);
      if (!deletedItem) {
        return res.status(404).json({ error: 'Inventory item not found' });
      }
      res.json({ message: 'Inventory item deleted successfully' });
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      res.status(500).json({ error: 'Failed to delete inventory item' });
    }
  }
}

module.exports = InventoryController;