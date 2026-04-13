const pool = require('../config/db');

class Project {
  static async getAll() {
    const query = 'SELECT * FROM project ORDER BY project_id';
    const result = await pool.query(query);
    return result.rows;
  }

  static async getById(id) {
    const query = 'SELECT * FROM project WHERE project_id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async create(projectData) {
    const { project_name, site_location, project_type, start_date, end_date, budget, status, created_by } = projectData;
    const query = `
      INSERT INTO project (project_name, site_location, project_type, start_date, end_date, budget, status, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const result = await pool.query(query, [project_name, site_location, project_type, start_date, end_date, budget, status || 'Active', created_by]);
    return result.rows[0];
  }

  static async update(id, projectData) {
    const { project_name, site_location, project_type, start_date, end_date, budget, status } = projectData;
    const query = `
      UPDATE project
      SET project_name = $1, site_location = $2, project_type = $3, start_date = $4, end_date = $5, budget = $6, status = $7, updated_at = CURRENT_TIMESTAMP
      WHERE project_id = $8
      RETURNING *
    `;
    const result = await pool.query(query, [project_name, site_location, project_type, start_date, end_date, budget, status, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM project WHERE project_id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Project;