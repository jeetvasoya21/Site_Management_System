const MaterialIssue = require('../models/MaterialIssue');

class MaterialIssueController {
  static async getAllIssues(req, res) {
    try {
      const issues = await MaterialIssue.getAll();
      res.json(issues);
    } catch (error) {
      console.error('Error fetching material issues:', error);
      res.status(500).json({ error: 'Failed to fetch material issues' });
    }
  }

  static async getIssueById(req, res) {
    try {
      const { id } = req.params;
      const issue = await MaterialIssue.getById(id);
      if (!issue) {
        return res.status(404).json({ error: 'Material issue not found' });
      }
      res.json(issue);
    } catch (error) {
      console.error('Error fetching material issue:', error);
      res.status(500).json({ error: 'Failed to fetch material issue' });
    }
  }

  static async getIssuesByProject(req, res) {
    try {
      const { projectId } = req.params;
      const issues = await MaterialIssue.getByProjectId(projectId);
      res.json(issues);
    } catch (error) {
      console.error('Error fetching material issues by project:', error);
      res.status(500).json({ error: 'Failed to fetch material issues' });
    }
  }

  static async createIssue(req, res) {
    try {
      const issueData = req.body;
      const newIssue = await MaterialIssue.create(issueData);
      res.status(201).json(newIssue);
    } catch (error) {
      console.error('Error creating material issue:', error);
      res.status(500).json({ error: 'Failed to create material issue' });
    }
  }

  static async updateIssue(req, res) {
    try {
      const { id } = req.params;
      const issueData = req.body;
      const updatedIssue = await MaterialIssue.update(id, issueData);
      if (!updatedIssue) {
        return res.status(404).json({ error: 'Material issue not found' });
      }
      res.json(updatedIssue);
    } catch (error) {
      console.error('Error updating material issue:', error);
      res.status(500).json({ error: 'Failed to update material issue' });
    }
  }

  static async deleteIssue(req, res) {
    try {
      const { id } = req.params;
      const deletedIssue = await MaterialIssue.delete(id);
      if (!deletedIssue) {
        return res.status(404).json({ error: 'Material issue not found' });
      }
      res.json({ message: 'Material issue deleted successfully' });
    } catch (error) {
      console.error('Error deleting material issue:', error);
      res.status(500).json({ error: 'Failed to delete material issue' });
    }
  }
}

module.exports = MaterialIssueController;