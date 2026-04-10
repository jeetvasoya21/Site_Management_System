const Worker = require('../models/Worker');

class WorkerController {
  static async getAllWorkers(req, res) {
    try {
      const workers = await Worker.getAll();
      res.json(workers);
    } catch (error) {
      console.error('Error fetching workers:', error);
      res.status(500).json({ error: 'Failed to fetch workers' });
    }
  }

  static async getWorkerById(req, res) {
    try {
      const { id } = req.params;
      const worker = await Worker.getById(id);
      if (!worker) {
        return res.status(404).json({ error: 'Worker not found' });
      }
      res.json(worker);
    } catch (error) {
      console.error('Error fetching worker:', error);
      res.status(500).json({ error: 'Failed to fetch worker' });
    }
  }

  static async createWorker(req, res) {
    try {
      const workerData = req.body;
      const newWorker = await Worker.create(workerData);
      res.status(201).json(newWorker);
    } catch (error) {
      console.error('Error creating worker:', error);
      res.status(500).json({ error: 'Failed to create worker' });
    }
  }

  static async updateWorker(req, res) {
    try {
      const { id } = req.params;
      const workerData = req.body;
      const updatedWorker = await Worker.update(id, workerData);
      if (!updatedWorker) {
        return res.status(404).json({ error: 'Worker not found' });
      }
      res.json(updatedWorker);
    } catch (error) {
      console.error('Error updating worker:', error);
      res.status(500).json({ error: 'Failed to update worker' });
    }
  }

  static async deleteWorker(req, res) {
    try {
      const { id } = req.params;
      const deletedWorker = await Worker.delete(id);
      if (!deletedWorker) {
        return res.status(404).json({ error: 'Worker not found' });
      }
      res.json({ message: 'Worker deleted successfully' });
    } catch (error) {
      console.error('Error deleting worker:', error);
      res.status(500).json({ error: 'Failed to delete worker' });
    }
  }
}

module.exports = WorkerController;