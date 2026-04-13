const pool = require('../config/db');

class Finance {
  static async getAll() {
    const query = 'SELECT * FROM finance ORDER BY finance_id';
    const result = await pool.query(query);
    return result.rows;
  }

  static async getById(id) {
    const query = 'SELECT * FROM finance WHERE finance_id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getByProjectId(projectId) {
    const query = 'SELECT * FROM finance WHERE project_id = $1';
    const result = await pool.query(query, [projectId]);
    return result.rows;
  }

  static async create(financeData) {
    const { project_id, cost_category, amount, date, description, payment_status, source } = financeData;
    const query = `
      INSERT INTO finance (project_id, cost_category, amount, date, description, payment_status, source)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const result = await pool.query(query, [project_id, cost_category, amount, date || new Date().toISOString().split('T')[0], description, payment_status || 'Pending', source || 'manual']);
    return result.rows[0];
  }

  static async update(id, financeData) {
    const fin = await Finance.getById(id);
    if (!fin) return null;

    const project_id = financeData.project_id !== undefined ? financeData.project_id : fin.project_id;
    const cost_category = financeData.cost_category !== undefined ? financeData.cost_category : fin.cost_category;
    const amount = financeData.amount !== undefined ? financeData.amount : fin.amount;
    const date = financeData.date !== undefined ? financeData.date : fin.date;
    const description = financeData.description !== undefined ? financeData.description : fin.description;
    const payment_status = financeData.payment_status !== undefined ? financeData.payment_status : fin.payment_status;
    const source = financeData.source !== undefined ? financeData.source : fin.source;

    const query = `
      UPDATE finance
      SET project_id = $1, cost_category = $2, amount = $3, date = $4, description = $5, payment_status = $6, source = $7
      WHERE finance_id = $8
      RETURNING *
    `;
    const result = await pool.query(query, [project_id, cost_category, amount, date, description, payment_status, source, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM finance WHERE finance_id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Finance;