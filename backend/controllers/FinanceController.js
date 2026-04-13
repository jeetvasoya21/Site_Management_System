const Finance = require('../models/Finance');

class FinanceController {
  static async getAllFinance(req, res) {
    try {
      const finance = await Finance.getAll();
      res.json(finance);
    } catch (error) {
      console.error('Error fetching finance records:', error);
      res.status(500).json({ error: 'Failed to fetch finance records' });
    }
  }

  static async getFinanceById(req, res) {
    try {
      const { id } = req.params;
      const finance = await Finance.getById(id);
      if (!finance) {
        return res.status(404).json({ error: 'Finance record not found' });
      }
      res.json(finance);
    } catch (error) {
      console.error('Error fetching finance record:', error);
      res.status(500).json({ error: 'Failed to fetch finance record' });
    }
  }

  static async getFinanceByProject(req, res) {
    try {
      const { projectId } = req.params;
      const finance = await Finance.getByProjectId(projectId);
      res.json(finance);
    } catch (error) {
      console.error('Error fetching finance by project:', error);
      res.status(500).json({ error: 'Failed to fetch finance records' });
    }
  }

  static async createFinance(req, res) {
    try {
      const financeData = req.body;
      const newFinance = await Finance.create(financeData);
      res.status(201).json(newFinance);
    } catch (error) {
      console.error('Error creating finance record:', error);
      res.status(500).json({ error: 'Failed to create finance record' });
    }
  }

  static async updateFinance(req, res) {
    try {
      const { id } = req.params;
      const financeData = req.body;
      const updatedFinance = await Finance.update(id, financeData);
      if (!updatedFinance) {
        return res.status(404).json({ error: 'Finance record not found' });
      }
      res.json(updatedFinance);
    } catch (error) {
      console.error('Error updating finance record:', error);
      res.status(500).json({ error: 'Failed to update finance record' });
    }
  }

  static async deleteFinance(req, res) {
    try {
      const { id } = req.params;
      const deletedFinance = await Finance.delete(id);
      if (!deletedFinance) {
        return res.status(404).json({ error: 'Finance record not found' });
      }
      res.json({ message: 'Finance record deleted successfully' });
    } catch (error) {
      console.error('Error deleting finance record:', error);
      res.status(500).json({ error: 'Failed to delete finance record' });
    }
  }
}

module.exports = FinanceController;