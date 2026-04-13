const Project = require('../models/Project');

class ProjectController {
  static async getAllProjects(req, res) {
    try {
      const projects = await Project.getAll();
      res.json(projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ error: 'Failed to fetch projects' });
    }
  }

  static async getProjectById(req, res) {
    try {
      const { id } = req.params;
      const project = await Project.getById(id);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json(project);
    } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).json({ error: 'Failed to fetch project' });
    }
  }

  static async createProject(req, res) {
    try {
      const projectData = req.body;
      const newProject = await Project.create(projectData);
      res.status(201).json(newProject);
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ error: 'Failed to create project' });
    }
  }

  static async updateProject(req, res) {
    try {
      const { id } = req.params;
      const projectData = req.body;
      const updatedProject = await Project.update(id, projectData);
      if (!updatedProject) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json(updatedProject);
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).json({ error: 'Failed to update project' });
    }
  }

  static async deleteProject(req, res) {
    try {
      const { id } = req.params;
      const deletedProject = await Project.delete(id);
      if (!deletedProject) {
        return res.status(404).json({ error: 'Project not found' });
      }
      res.json({ message: 'Project deleted successfully' });
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({ error: 'Failed to delete project' });
    }
  }
}

module.exports = ProjectController;