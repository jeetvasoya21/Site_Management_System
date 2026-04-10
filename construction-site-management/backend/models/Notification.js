const pool = require('../config/db');

class Notification {
  static async getByUserId(userId) {
    const query = `
      SELECT * FROM notifications
      WHERE user_id = $1 OR user_id IS NULL
      ORDER BY created_at DESC
      LIMIT 50
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async getAll() {
    const query = 'SELECT * FROM notifications ORDER BY created_at DESC LIMIT 100';
    const result = await pool.query(query);
    return result.rows;
  }

  static async create(notificationData) {
    const { user_id, message, title, type, severity } = notificationData;
    const query = `
      INSERT INTO notifications (user_id, message, title, type, severity, is_read)
      VALUES ($1, $2, $3, $4, $5, false)
      RETURNING *
    `;
    const result = await pool.query(query, [
      user_id || null,
      message,
      title || message,
      type || 'general',
      severity || 'medium',
    ]);
    return result.rows[0];
  }

  static async markRead(id) {
    const query = `
      UPDATE notifications SET is_read = true WHERE id = $1 RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async markAllRead(userId) {
    const query = `
      UPDATE notifications SET is_read = true
      WHERE user_id = $1 OR user_id IS NULL
      RETURNING *
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }

  static async delete(id) {
    const query = 'DELETE FROM notifications WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Notification;
