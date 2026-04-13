const WorkerAssignment = require('../models/WorkerAssignment');

class WorkerAssignmentController {
  static async getAllAssignments(req, res) {
    try {
      const assignments = await WorkerAssignment.getAll();
      res.json(assignments);
    } catch (error) {
      console.error('Error fetching worker assignments:', error);
      res.status(500).json({ error: 'Failed to fetch worker assignments' });
    }
  }

  static async getAssignmentById(req, res) {
    try {
      const { id } = req.params;
      const assignment = await WorkerAssignment.getById(id);
      if (!assignment) {
        return res.status(404).json({ error: 'Assignment not found' });
      }
      res.json(assignment);
    } catch (error) {
      console.error('Error fetching assignment:', error);
      res.status(500).json({ error: 'Failed to fetch assignment' });
    }
  }

  static async getAssignmentsByTask(req, res) {
    try {
      const { taskId } = req.params;
      const assignments = await WorkerAssignment.getByTaskId(taskId);
      res.json(assignments);
    } catch (error) {
      console.error('Error fetching assignments by task:', error);
      res.status(500).json({ error: 'Failed to fetch assignments' });
    }
  }

  static async createAssignment(req, res) {
    try {
      const { worker_id, task_id, from_date, to_date } = req.body;
      if (!worker_id || !task_id) {
        return res.status(400).json({ error: 'worker_id and task_id are required' });
      }
      const newAssignment = await WorkerAssignment.create({ task_id, worker_id, from_date, to_date });
      res.status(201).json(newAssignment);
    } catch (error) {
      console.error('Error creating worker assignment:', error);
      res.status(500).json({ error: 'Failed to create worker assignment' });
    }
  }

  static async deleteAssignment(req, res) {
    try {
      const { id } = req.params;
      const deleted = await WorkerAssignment.delete(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Assignment not found' });
      }
      res.json({ message: 'Assignment deleted successfully' });
    } catch (error) {
      console.error('Error deleting assignment:', error);
      res.status(500).json({ error: 'Failed to delete assignment' });
    }
  }
}

module.exports = WorkerAssignmentController;
