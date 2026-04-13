const pool = require('../config/db');

class Task {
  static async getAll() {
    const query = 'SELECT * FROM task ORDER BY task_id';
    const result = await pool.query(query);
    return result.rows;
  }

  static async getById(id) {
    const query = 'SELECT * FROM task WHERE task_id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getByProjectId(projectId) {
    const query = 'SELECT * FROM task WHERE project_id = $1';
    const result = await pool.query(query, [projectId]);
    return result.rows;
  }

  static async create(taskData) {
    const { 
      project_id, task_name, assigned_to, start_date, end_date, status, 
      priority, due_date, deadline, progress, workers_assigned, materials_used, dependencies 
    } = taskData;
    const query = `
      INSERT INTO task (project_id, task_name, assigned_to, start_date, end_date, status, priority, due_date, deadline, progress, workers_assigned, materials_used, dependencies)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;
    const result = await pool.query(query, [
      project_id, 
      task_name, 
      assigned_to, 
      start_date, 
      end_date, 
      status || 'Open',
      priority || 'Medium',
      due_date,
      deadline,
      progress || 0,
      workers_assigned ? JSON.stringify(workers_assigned) : '[]',
      materials_used ? JSON.stringify(materials_used) : '[]',
      dependencies ? JSON.stringify(dependencies) : '[]'
    ]);
    return result.rows[0];
  }

  static async update(id, taskData) {
    // Allows partial updates for any fields provided
    const task = await Task.getById(id);
    if (!task) return null;

    const project_id = taskData.project_id !== undefined ? taskData.project_id : task.project_id;
    const task_name = taskData.task_name !== undefined ? taskData.task_name : task.task_name;
    const assigned_to = taskData.assigned_to !== undefined ? taskData.assigned_to : task.assigned_to;
    const start_date = taskData.start_date !== undefined ? taskData.start_date : task.start_date;
    const end_date = taskData.end_date !== undefined ? taskData.end_date : task.end_date;
    const status = taskData.status !== undefined ? taskData.status : task.status;
    const priority = taskData.priority !== undefined ? taskData.priority : task.priority;
    const due_date = taskData.due_date !== undefined ? taskData.due_date : task.due_date;
    const deadline = taskData.deadline !== undefined ? taskData.deadline : task.deadline;
    const progress = taskData.progress !== undefined ? taskData.progress : task.progress;
    const workers_assigned = taskData.workers_assigned !== undefined ? JSON.stringify(taskData.workers_assigned) : JSON.stringify(task.workers_assigned);
    const materials_used = taskData.materials_used !== undefined ? JSON.stringify(taskData.materials_used) : JSON.stringify(task.materials_used);
    const dependencies = taskData.dependencies !== undefined ? JSON.stringify(taskData.dependencies) : JSON.stringify(task.dependencies);

    const query = `
      UPDATE task
      SET project_id = $1, task_name = $2, assigned_to = $3, start_date = $4, end_date = $5, status = $6,
          priority = $7, due_date = $8, deadline = $9, progress = $10, workers_assigned = $11, materials_used = $12, dependencies = $13
      WHERE task_id = $14
      RETURNING *
    `;
    const result = await pool.query(query, [
      project_id, task_name, assigned_to, start_date, end_date, status,
      priority, due_date, deadline, progress, workers_assigned, materials_used, dependencies,
      id
    ]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM task WHERE task_id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Task;