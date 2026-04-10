const Procurement = require('../models/Procurement');

class ProcurementController {
  static async getAllProcurements(req, res) {
    try {
      const procurements = await Procurement.getAll();
      res.json(procurements);
    } catch (error) {
      console.error('Error fetching procurements:', error);
      res.status(500).json({ error: 'Failed to fetch procurements' });
    }
  }

  static async getProcurementById(req, res) {
    try {
      const { id } = req.params;
      const procurement = await Procurement.getById(id);
      if (!procurement) {
        return res.status(404).json({ error: 'Procurement not found' });
      }
      res.json(procurement);
    } catch (error) {
      console.error('Error fetching procurement:', error);
      res.status(500).json({ error: 'Failed to fetch procurement' });
    }
  }

  static async getProcurementsByProject(req, res) {
    try {
      const { projectId } = req.params;
      const procurements = await Procurement.getByProjectId(projectId);
      res.json(procurements);
    } catch (error) {
      console.error('Error fetching procurements by project:', error);
      res.status(500).json({ error: 'Failed to fetch procurements' });
    }
  }

  static async createProcurement(req, res) {
    try {
      const procurementData = req.body;
      const newProcurement = await Procurement.create(procurementData);
      res.status(201).json(newProcurement);
    } catch (error) {
      console.error('Error creating procurement:', error);
      res.status(500).json({ error: 'Failed to create procurement' });
    }
  }

  static async updateProcurement(req, res) {
    try {
      const { id } = req.params;
      const procurementData = req.body;
      const updatedProcurement = await Procurement.update(id, procurementData);
      if (!updatedProcurement) {
        return res.status(404).json({ error: 'Procurement not found' });
      }
      res.json(updatedProcurement);
    } catch (error) {
      console.error('Error updating procurement:', error);
      res.status(500).json({ error: 'Failed to update procurement: ' + error.message });
    }
  }

  static async deleteProcurement(req, res) {
    try {
      const { id } = req.params;
      const deletedProcurement = await Procurement.delete(id);
      if (!deletedProcurement) {
        return res.status(404).json({ error: 'Procurement not found' });
      }
      res.json({ message: 'Procurement deleted successfully' });
    } catch (error) {
      console.error('Error deleting procurement:', error);
      res.status(500).json({ error: 'Failed to delete procurement' });
    }
  }
}

module.exports = ProcurementController;