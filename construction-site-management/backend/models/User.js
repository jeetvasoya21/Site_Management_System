const pool = require('../config/db');
const crypto = require('crypto');

class User {
  static hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const derived = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${derived}`;
  }

  static verifyPassword(password, storedHash) {
    if (!storedHash) return false;
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return false;
    const derived = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(derived, 'hex'));
  }

  static async getAll() {
    const query = 'SELECT * FROM "User" ORDER BY user_id';
    const result = await pool.query(query);
    return result.rows;
  }

  static async getById(id) {
    const query = 'SELECT * FROM "User" WHERE user_id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getByEmail(email) {
    const query = 'SELECT * FROM "User" WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  }

  static async create(userData) {
    const { name, role, email, phone, password, is_active } = userData;
    const passwordHash = password ? User.hashPassword(password) : null;
    const query = `
      INSERT INTO "User" (name, role, email, phone, password, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING user_id, name, role, email, phone, is_active, created_at, updated_at
    `;
    const result = await pool.query(query, [name, role, email, phone, passwordHash, is_active ?? true]);
    return result.rows[0];
  }

  static async update(id, userData) {
    const { name, role, email, phone, password, is_active } = userData;
    if (password) {
      const passwordHash = User.hashPassword(password);
      const query = `
        UPDATE "User"
        SET name = $1, role = $2, email = $3, phone = $4, password = $5, is_active = $6, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $7
        RETURNING user_id, name, role, email, phone, is_active, created_at, updated_at
      `;
      const result = await pool.query(query, [name, role, email, phone, passwordHash, is_active, id]);
      return result.rows[0];
    }

    const query = `
      UPDATE "User"
      SET name = $1, role = $2, email = $3, phone = $4, is_active = $5, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $6
      RETURNING user_id, name, role, email, phone, is_active, created_at, updated_at
    `;
    const result = await pool.query(query, [name, role, email, phone, is_active, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM "User" WHERE user_id = $1 RETURNING user_id, name, role, email';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getResetCount(email) {
    const query = 'SELECT password_reset_count FROM "User" WHERE email = $1';
    const result = await pool.query(query, [email]);
    if (result.rows.length === 0) return null;
    return result.rows[0].password_reset_count || 0;
  }

  static async incrementResetCount(email) {
    const query = `
      UPDATE "User"
      SET password_reset_count = COALESCE(password_reset_count, 0) + 1, updated_at = CURRENT_TIMESTAMP
      WHERE email = $1
      RETURNING password_reset_count
    `;
    const result = await pool.query(query, [email]);
    return result.rows[0]?.password_reset_count;
  }

  static async resetPassword(email, newPassword) {
    const passwordHash = User.hashPassword(newPassword);
    const query = `
      UPDATE "User"
      SET password = $1, updated_at = CURRENT_TIMESTAMP
      WHERE email = $2
      RETURNING user_id, name, role, email
    `;
    const result = await pool.query(query, [passwordHash, email]);
    return result.rows[0];
  }
}

module.exports = User;