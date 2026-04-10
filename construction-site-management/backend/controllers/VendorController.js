const Vendor = require('../models/Vendor');

class VendorController {
  static async getAllVendors(req, res) {
    try {
      const vendors = await Vendor.getAll();
      res.json(vendors);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      res.status(500).json({ error: 'Failed to fetch vendors' });
    }
  }

  static async getVendorById(req, res) {
    try {
      const { id } = req.params;
      const vendor = await Vendor.getById(id);
      if (!vendor) {
        return res.status(404).json({ error: 'Vendor not found' });
      }
      res.json(vendor);
    } catch (error) {
      console.error('Error fetching vendor:', error);
      res.status(500).json({ error: 'Failed to fetch vendor' });
    }
  }

  static async createVendor(req, res) {
    try {
      const vendorData = req.body;
      const newVendor = await Vendor.create(vendorData);
      res.status(201).json(newVendor);
    } catch (error) {
      console.error('Error creating vendor:', error);
      res.status(500).json({ error: 'Failed to create vendor' });
    }
  }

  static async updateVendor(req, res) {
    try {
      const { id } = req.params;
      const vendorData = req.body;
      const updatedVendor = await Vendor.update(id, vendorData);
      if (!updatedVendor) {
        return res.status(404).json({ error: 'Vendor not found' });
      }
      res.json(updatedVendor);
    } catch (error) {
      console.error('Error updating vendor:', error);
      res.status(500).json({ error: 'Failed to update vendor' });
    }
  }

  static async deleteVendor(req, res) {
    try {
      const { id } = req.params;
      const deletedVendor = await Vendor.delete(id);
      if (!deletedVendor) {
        return res.status(404).json({ error: 'Vendor not found' });
      }
      res.json({ message: 'Vendor deleted successfully' });
    } catch (error) {
      console.error('Error deleting vendor:', error);
      res.status(500).json({ error: 'Failed to delete vendor' });
    }
  }
}

module.exports = VendorController;