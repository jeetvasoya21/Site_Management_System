const pool = require('../config/db');

class ProjectMember {
  static async getAll() {
    const query = 'SELECT * FROM project_members ORDER BY project_member_id';
    const result = await pool.query(query);
    return result.rows;
  }

  static async getById(id) {
    const query = 'SELECT * FROM project_members WHERE project_member_id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getByProjectId(projectId) {
    const query = 'SELECT * FROM project_members WHERE project_id = $1';
    const result = await pool.query(query, [projectId]);
    return result.rows;
  }

  static async create(memberData) {
    const { project_id, user_id, member_role, from_date, to_date } = memberData;
    
    const checkQuery = 'SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2';
    const existing = await pool.query(checkQuery, [project_id, user_id]);
    if (existing.rows.length > 0) {
      throw new Error('User is already a member of this project');
    }

    const query = `
      INSERT INTO project_members (project_id, user_id, member_role, from_date, to_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [project_id, user_id, member_role, from_date, to_date]);
    return result.rows[0];
  }

  static async update(id, memberData) {
    const { project_id, user_id, member_role, from_date, to_date } = memberData;
    const query = `
      UPDATE project_members
      SET project_id = $1, user_id = $2, member_role = $3, from_date = $4, to_date = $5
      WHERE project_member_id = $6
      RETURNING *
    `;
    const result = await pool.query(query, [project_id, user_id, member_role, from_date, to_date, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM project_members WHERE project_member_id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = ProjectMember;