const Task = require('../models/Task');

class TaskController {
  static async getAllTasks(req, res) {
    try {
      const tasks = await Task.getAll();
      res.json(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  }

  static async getTaskById(req, res) {
    try {
      const { id } = req.params;
      const task = await Task.getById(id);
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json(task);
    } catch (error) {
      console.error('Error fetching task:', error);
      res.status(500).json({ error: 'Failed to fetch task' });
    }
  }

  static async getTasksByProject(req, res) {
    try {
      const { projectId } = req.params;
      const tasks = await Task.getByProjectId(projectId);
      res.json(tasks);
    } catch (error) {
      console.error('Error fetching tasks by project:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  }

  static async createTask(req, res) {
    try {
      const taskData = req.body;
      const newTask = await Task.create(taskData);
      res.status(201).json(newTask);
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  }

  static async updateTask(req, res) {
    try {
      const { id } = req.params;
      const taskData = req.body;
      const updatedTask = await Task.update(id, taskData);
      if (!updatedTask) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json(updatedTask);
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  }

  static async deleteTask(req, res) {
    try {
      const { id } = req.params;
      const deletedTask = await Task.delete(id);
      if (!deletedTask) {
        return res.status(404).json({ error: 'Task not found' });
      }
      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  }
}

module.exports = TaskController;