const pool = require('../config/db');

class Procurement {
  static async getAll() {
    const query = 'SELECT * FROM procurement ORDER BY id';
    const result = await pool.query(query);
    return result.rows;
  }

  static async getById(id) {
    // Try by integer id first, then by procurement_id string
    let result;
    if (!isNaN(Number(id))) {
      result = await pool.query('SELECT * FROM procurement WHERE id = $1', [Number(id)]);
    }
    if (!result || result.rows.length === 0) {
      result = await pool.query('SELECT * FROM procurement WHERE procurement_id = $1', [String(id)]);
    }
    return result.rows[0];
  }

  static async getByProjectId(projectId) {
    const query = 'SELECT * FROM procurement WHERE project_id = $1';
    const result = await pool.query(query, [projectId]);
    return result.rows;
  }

  static async create(procurementData) {
    const { procurement_id, project_id, vendor_id, item_id, quantity, unit_price, delivery_status, expected_delivery, created_by } = procurementData;
    const query = `
      INSERT INTO procurement (procurement_id, project_id, vendor_id, item_id, quantity, unit_price, delivery_status, expected_delivery, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const result = await pool.query(query, [
      procurement_id || `PO-${Date.now()}`,
      project_id, vendor_id, item_id, quantity, unit_price, delivery_status || 'ordered', expected_delivery, created_by
    ]);
    return result.rows[0];
  }

  static async update(id, procurementData) {
    const proc = await Procurement.getById(id);
    if (!proc) return null;

    // Always use the actual integer id from the found record
    const dbId = proc.id;

    const project_id = procurementData.project_id !== undefined ? procurementData.project_id : proc.project_id;
    const vendor_id = procurementData.vendor_id !== undefined ? procurementData.vendor_id : proc.vendor_id;
    const item_id = procurementData.item_id !== undefined ? procurementData.item_id : proc.item_id;
    const quantity = procurementData.quantity !== undefined ? procurementData.quantity : proc.quantity;
    const unit_price = procurementData.unit_price !== undefined ? procurementData.unit_price : proc.unit_price;
    const delivery_status = procurementData.delivery_status !== undefined ? procurementData.delivery_status : proc.delivery_status;
    const expected_delivery = procurementData.expected_delivery !== undefined ? procurementData.expected_delivery : proc.expected_delivery;
    const delivered_at = procurementData.delivered_at !== undefined ? procurementData.delivered_at : proc.delivered_at;

    const query = `
      UPDATE procurement
      SET project_id = $1, vendor_id = $2, item_id = $3, quantity = $4, unit_price = $5, delivery_status = $6, expected_delivery = $7, delivered_at = $8
      WHERE id = $9
      RETURNING *
    `;
    const result = await pool.query(query, [project_id, vendor_id, item_id, quantity, unit_price, delivery_status, expected_delivery, delivered_at, dbId]);
    return result.rows[0];
  }

  static async delete(id) {
    // Try by integer id first, then by procurement_id string
    let result;
    if (!isNaN(Number(id))) {
      result = await pool.query('DELETE FROM procurement WHERE id = $1 RETURNING *', [Number(id)]);
    }
    if (!result || result.rows.length === 0) {
      result = await pool.query('DELETE FROM procurement WHERE procurement_id = $1 RETURNING *', [String(id)]);
    }
    return result.rows[0];
  }
}

module.exports = Procurement;