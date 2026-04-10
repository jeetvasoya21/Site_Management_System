const pool = require('../config/db');

class InventoryItem {
  static async getAll() {
    const query = 'SELECT * FROM inventory_item ORDER BY item_id';
    const result = await pool.query(query);
    return result.rows;
  }

  static async getById(id) {
    const query = 'SELECT * FROM inventory_item WHERE item_id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async create(itemData) {
    const { item_name, category, uom, unit_cost, min_stock_qty, current_stock, supplier } = itemData;
    const query = `
      INSERT INTO inventory_item (item_name, category, uom, unit_cost, min_stock_qty, current_stock, supplier)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const result = await pool.query(query, [item_name, category, uom, unit_cost, min_stock_qty || 0, current_stock || 0, supplier]);
    return result.rows[0];
  }

  static async update(id, itemData) {
    const item = await InventoryItem.getById(id);
    if (!item) return null;

    const item_name = itemData.item_name !== undefined ? itemData.item_name : item.item_name;
    const category = itemData.category !== undefined ? itemData.category : item.category;
    const uom = itemData.uom !== undefined ? itemData.uom : item.uom;
    const unit_cost = itemData.unit_cost !== undefined ? itemData.unit_cost : item.unit_cost;
    const min_stock_qty = itemData.min_stock_qty !== undefined ? itemData.min_stock_qty : item.min_stock_qty;
    const current_stock = itemData.current_stock !== undefined ? itemData.current_stock : item.current_stock;
    const supplier = itemData.supplier !== undefined ? itemData.supplier : item.supplier;

    const query = `
      UPDATE inventory_item
      SET item_name = $1, category = $2, uom = $3, unit_cost = $4, min_stock_qty = $5, current_stock = $6, supplier = $7
      WHERE item_id = $8
      RETURNING *
    `;
    const result = await pool.query(query, [item_name, category, uom, unit_cost, min_stock_qty, current_stock, supplier, id]);
    return result.rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM inventory_item WHERE item_id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = InventoryItem;