const pool = require('../config/db');

class Vendor {
  static async getAll() {
    const query = 'SELECT * FROM vendor ORDER BY vendor_id';
    const result = await pool.query(query);
    return result.rows;
  }

  static async getById(id) {
    const query = 'SELECT * FROM vendor WHERE vendor_id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async create(vendorData) {
    const { vendor_name, contact, email, address, rating } = vendorData;
    const query = `
      INSERT INTO vendor (vendor_name, contact, email, address, rating)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [vendor_name, contact, email, address, rating || 0]);
    return result.rows[0];
  }

  static async update(id, vendorData) {
    const { vendor_name, contact, email, address, rating } = vendorData;
    const query = `
      UPDATE vendor
      SET vendor_name = $1, contact = $2, email = $3, address = $4, rating = $5
      WHERE vendor_id = $6
      RETURNING *
    `;
    const result = await pool.query(query, [vendor_name, contact, email, address, rating, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM vendor WHERE vendor_id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Vendor;