const ProjectMember = require('../models/ProjectMember');
const User = require('../models/User');

class ProjectMemberController {
  static async getAllMembers(req, res) {
    try {
      const members = await ProjectMember.getAll();
      res.json(members);
    } catch (error) {
      console.error('Error fetching project members:', error);
      res.status(500).json({ error: 'Failed to fetch project members' });
    }
  }

  static async getMembersByProject(req, res) {
    try {
      const { projectId } = req.params;
      const members = await ProjectMember.getByProjectId(projectId);
      res.json(members);
    } catch (error) {
      console.error('Error fetching project members by project:', error);
      res.status(500).json({ error: 'Failed to fetch project members' });
    }
  }

  static async createMember(req, res) {
    try {
      const { project_id, user_id, member_role, from_date, to_date } = req.body;

      if (!project_id || !user_id) {
        return res.status(400).json({ error: 'project_id and user_id are required' });
      }

      // Validate that user exists and has Site_Engineer role (or allow Admin override)
      const user = await User.getById(user_id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      if (user.role !== 'Site_Engineer' && user.role !== 'Admin' && user.role !== 'Project_Manager') {
        return res.status(400).json({ error: 'Only Site Engineers can be assigned to projects' });
      }

      const newMember = await ProjectMember.create({ project_id, user_id, member_role: member_role || 'Site_Engineer', from_date, to_date });
      res.status(201).json(newMember);
    } catch (error) {
      console.error('Error creating project member:', error);
      if (error.code === '23505') {
        return res.status(409).json({ error: 'This user is already assigned to the selected project' });
      }
      res.status(500).json({ error: 'Failed to create project member' });
    }
  }

  static async deleteMember(req, res) {
    try {
      const { id } = req.params;
      const deleted = await ProjectMember.delete(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Project member not found' });
      }
      res.json({ message: 'Project member removed successfully' });
    } catch (error) {
      console.error('Error deleting project member:', error);
      res.status(500).json({ error: 'Failed to delete project member' });
    }
  }
}

module.exports = ProjectMemberController;
