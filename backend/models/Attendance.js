const pool = require('../config/db');

class Attendance {
  static async getAll() {
    const query = 'SELECT * FROM attendance ORDER BY attendance_id';
    const result = await pool.query(query);
    return result.rows;
  }

  static async getById(id) {
    const query = 'SELECT * FROM attendance WHERE attendance_id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getByProjectId(projectId) {
    const query = 'SELECT * FROM attendance WHERE project_id = $1';
    const result = await pool.query(query, [projectId]);
    return result.rows;
  }

  static async getByWorkerId(workerId) {
    const query = 'SELECT * FROM attendance WHERE worker_id = $1';
    const result = await pool.query(query, [workerId]);
    return result.rows;
  }

  static async create(attendanceData) {
    const { worker_id, project_id, date, status, hours_worked, labor_cost, recorded_by } = attendanceData;
    // Only pass recorded_by if it is a valid integer user id
    const safeRecordedBy = recorded_by && !isNaN(Number(recorded_by)) ? Number(recorded_by) : null;
    const query = `
      INSERT INTO attendance (worker_id, project_id, date, status, hours_worked, labor_cost, recorded_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (worker_id, date)
      DO UPDATE SET status = $4, hours_worked = $5, labor_cost = $6, recorded_by = $7, project_id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [worker_id, project_id, date || new Date().toISOString().split('T')[0], status || 'Present', hours_worked || 0, labor_cost || 0, safeRecordedBy]);
    return result.rows[0];
  }

  static async update(id, attendanceData) {
    const att = await Attendance.getById(id);
    if (!att) return null;

    const worker_id = attendanceData.worker_id !== undefined ? attendanceData.worker_id : att.worker_id;
    const project_id = attendanceData.project_id !== undefined ? attendanceData.project_id : att.project_id;
    const date = attendanceData.date !== undefined ? attendanceData.date : att.date;
    const status = attendanceData.status !== undefined ? attendanceData.status : att.status;
    const hours_worked = attendanceData.hours_worked !== undefined ? attendanceData.hours_worked : att.hours_worked;
    const labor_cost = attendanceData.labor_cost !== undefined ? attendanceData.labor_cost : att.labor_cost;
    const recorded_by = attendanceData.recorded_by !== undefined ? attendanceData.recorded_by : att.recorded_by;

    const query = `
      UPDATE attendance
      SET worker_id = $1, project_id = $2, date = $3, status = $4, hours_worked = $5, labor_cost = $6, recorded_by = $7
      WHERE attendance_id = $8
      RETURNING *
    `;
    const result = await pool.query(query, [worker_id, project_id, date, status, hours_worked, labor_cost, recorded_by, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM attendance WHERE attendance_id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Attendance;