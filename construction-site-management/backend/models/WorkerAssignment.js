const pool = require('../config/db');

class WorkerAssignment {
  static async getAll() {
    const query = 'SELECT * FROM workerassignment ORDER BY assignment_id';
    const result = await pool.query(query);
    return result.rows;
  }

  static async getById(id) {
    const query = 'SELECT * FROM workerassignment WHERE assignment_id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getByTaskId(taskId) {
    const query = 'SELECT * FROM workerassignment WHERE task_id = $1';
    const result = await pool.query(query, [taskId]);
    return result.rows;
  }

  static async create(assignmentData) {
    const { task_id, worker_id, from_date, to_date } = assignmentData;
    const query = `
      INSERT INTO workerassignment (task_id, worker_id, from_date, to_date)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [task_id, worker_id, from_date, to_date]);
    return result.rows[0];
  }

  static async update(id, assignmentData) {
    const { task_id, worker_id, from_date, to_date } = assignmentData;
    const query = `
      UPDATE workerassignment
      SET task_id = $1, worker_id = $2, from_date = $3, to_date = $4
      WHERE assignment_id = $5
      RETURNING *
    `;
    const result = await pool.query(query, [task_id, worker_id, from_date, to_date, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM workerassignment WHERE assignment_id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = WorkerAssignment;