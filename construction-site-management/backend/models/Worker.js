const pool = require('../config/db');

class Worker {
  static async getAll() {
    const query = 'SELECT * FROM worker ORDER BY worker_id';
    const result = await pool.query(query);
    return result.rows;
  }

  static async getById(id) {
    const query = 'SELECT * FROM worker WHERE worker_id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async create(workerData) {
    const { user_id, project_id, name, skill_type, contact, rate_type, base_rate, salary, attendance } = workerData;
    const query = `
      INSERT INTO worker (user_id, project_id, name, skill_type, contact, rate_type, base_rate, salary, attendance)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const result = await pool.query(query, [
      user_id || null, 
      project_id || null, 
      name, 
      skill_type, 
      contact, 
      rate_type, 
      base_rate, 
      salary || 0,
      attendance ? JSON.stringify(attendance) : '[]'
    ]);
    return result.rows[0];
  }

  static async update(id, workerData) {
    const worker = await Worker.getById(id);
    if (!worker) return null;

    const user_id = workerData.user_id !== undefined ? workerData.user_id : worker.user_id;
    const project_id = workerData.project_id !== undefined ? workerData.project_id : worker.project_id;
    const name = workerData.name !== undefined ? workerData.name : worker.name;
    const skill_type = workerData.skill_type !== undefined ? workerData.skill_type : worker.skill_type;
    const contact = workerData.contact !== undefined ? workerData.contact : worker.contact;
    const rate_type = workerData.rate_type !== undefined ? workerData.rate_type : worker.rate_type;
    const base_rate = workerData.base_rate !== undefined ? workerData.base_rate : worker.base_rate;
    const salary = workerData.salary !== undefined ? workerData.salary : worker.salary;
    const attendance = workerData.attendance !== undefined ? JSON.stringify(workerData.attendance) : JSON.stringify(worker.attendance);

    const query = `
      UPDATE worker
      SET user_id = $1, project_id = $2, name = $3, skill_type = $4, contact = $5, rate_type = $6, base_rate = $7, salary = $8, attendance = $9
      WHERE worker_id = $10
      RETURNING *
    `;
    const result = await pool.query(query, [
      user_id, project_id, name, skill_type, contact, rate_type, base_rate, salary, attendance, id
    ]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM worker WHERE worker_id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Worker;