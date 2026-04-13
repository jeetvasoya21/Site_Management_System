const pool = require('../config/db');

class MaterialIssue {
  static async getAll() {
    const query = 'SELECT * FROM material_issue ORDER BY material_issue_id';
    const result = await pool.query(query);
    return result.rows;
  }

  static async getById(id) {
    const query = 'SELECT * FROM material_issue WHERE material_issue_id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getByProjectId(projectId) {
    const query = 'SELECT * FROM material_issue WHERE project_id = $1';
    const result = await pool.query(query, [projectId]);
    return result.rows;
  }

  static async create(issueData) {
    const { project_id, task_id, item_id, quantity, issued_by } = issueData;
    const query = `
      INSERT INTO material_issue (project_id, task_id, item_id, quantity, issued_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [project_id, task_id, item_id, quantity, issued_by]);
    return result.rows[0];
  }

  static async update(id, issueData) {
    const issue = await MaterialIssue.getById(id);
    if (!issue) return null;

    const project_id = issueData.project_id !== undefined ? issueData.project_id : issue.project_id;
    const task_id = issueData.task_id !== undefined ? issueData.task_id : issue.task_id;
    const item_id = issueData.item_id !== undefined ? issueData.item_id : issue.item_id;
    const quantity = issueData.quantity !== undefined ? issueData.quantity : issue.quantity;
    const issued_by = issueData.issued_by !== undefined ? issueData.issued_by : issue.issued_by;

    const query = `
      UPDATE material_issue
      SET project_id = $1, task_id = $2, item_id = $3, quantity = $4, issued_by = $5
      WHERE material_issue_id = $6
      RETURNING *
    `;
    const result = await pool.query(query, [project_id, task_id, item_id, quantity, issued_by, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM material_issue WHERE material_issue_id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = MaterialIssue;