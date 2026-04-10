const pool = require('../config/db');

class Leave {
  static async getAll() {
    const query = 'SELECT * FROM leave_application ORDER BY applied_on DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  static async getById(id) {
    const query = 'SELECT * FROM leave_application WHERE leave_id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getByWorkerId(workerId) {
    const query = 'SELECT * FROM leave_application WHERE worker_id = $1 ORDER BY applied_on DESC';
    const result = await pool.query(query, [workerId]);
    return result.rows;
  }

  static async create(leaveData) {
    const { worker_id, start_date, end_date, reason } = leaveData;
    const query = `
      INSERT INTO leave_application (worker_id, start_date, end_date, reason, status)
      VALUES ($1, $2, $3, $4, 'Pending')
      RETURNING *
    `;
    const result = await pool.query(query, [worker_id, start_date, end_date, reason]);
    return result.rows[0];
  }

  static async updateStatus(id, status, reviewerId, rejectionReason = '') {
    const query = `
      UPDATE leave_application
      SET status = $1, reviewed_by = $2, reviewed_on = CURRENT_TIMESTAMP
      WHERE leave_id = $3
      RETURNING *
    `;
    const result = await pool.query(query, [status, reviewerId, id]);
    return result.rows[0];
  }
}

module.exports = Leave;
