import { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { Card, Badge, Button, Input, Modal, Select } from '../../components/ui';
import { formatCurrencyINR } from '../../utils/formatCurrency';
import { AlertTriangle, Plus, PackagePlus } from 'lucide-react';

const defaultItemForm = { item_name: '', category: '', uom: '', unit_cost: '', min_stock_qty: '', supplier: '' };

export default function Inventory() {
  const { inventory, purchaseOrders, materialIssues, addInventoryItem, addInventoryStock } = useContext(AppContext);
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [addStockModal, setAddStockModal] = useState(null); // item id
  const [addStockQty, setAddStockQty] = useState('');
  const [addItemModal, setAddItemModal] = useState(false);
  const [itemForm, setItemForm] = useState(defaultItemForm);

  // Admin, Project Manager, and Site Engineer can manage inventory
  const canManageInventory = ['Admin', 'Project_Manager', 'Site_Engineer'].includes(user?.role);

  // Filter inventory based on search and category
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ['All', ...new Set(inventory.map(item => item.category))];

  // Check if item is low stock
  const isLowStock = (item) => item.current_stock < item.min_stock_qty;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50">Inventory Management</h1>
          <p className="text-slate-400 mt-2">Monitor material stock levels and manage reorders</p>
        </div>
        {canManageInventory && (
          <Button onClick={() => setAddItemModal(true)}>
            <Plus size={14} className="mr-1" /> Add Item
          </Button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Search items"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or category..."
        />
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Category</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-50 focus:border-amber-500 focus:outline-none"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <Card title="Inventory Items">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Item Name</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Category</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Unit Cost</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Current Stock</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Min Stock</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Supplier</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                {canManageInventory && <th className="text-left py-3 px-4 text-slate-400 font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredInventory.length > 0 ? (
                filteredInventory.map(item => (
                  <tr
                    key={item.id}
                    className={`border-b border-slate-800 hover:bg-slate-800/50 transition-colors ${
                      isLowStock(item) ? 'bg-rose-500/10' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-slate-50">{item.item_name}</td>
                    <td className="py-3 px-4 text-slate-400">{item.category}</td>
                    <td className="py-3 px-4 text-slate-50">{formatCurrencyINR(item.unit_cost)}</td>
                    <td className="py-3 px-4 text-slate-50">{item.current_stock} {item.uom}</td>
                    <td className="py-3 px-4 text-slate-50">{item.min_stock_qty} {item.uom}</td>
                    <td className="py-3 px-4 text-slate-400 text-sm">{item.supplier || '—'}</td>
                    <td className="py-3 px-4">
                      {isLowStock(item) ? (
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-rose-500" />
                          <Badge variant="danger">Low Stock</Badge>
                        </div>
                      ) : (
                        <Badge variant="success">In Stock</Badge>
                      )}
                    </td>
                    {canManageInventory && (
                      <td className="py-3 px-4">
                        {isLowStock(item) && (
                          <Button variant="primary" size="sm" onClick={() => { setAddStockModal(item.id); setAddStockQty(''); }}>
                            <PackagePlus size={13} className="mr-1" /> Add Stock
                          </Button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={canManageInventory ? 8 : 7} className="py-8 px-4 text-center text-slate-400">
                    No inventory items found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Low Stock Summary */}
      <Card title="Low Stock Alert">
        <div className="space-y-2">
          {inventory.filter(isLowStock).length > 0 ? (
            <div>
              <p className="text-slate-50 font-medium mb-3">
                {inventory.filter(isLowStock).length} item(s) below minimum stock level
              </p>
              <div className="space-y-2">
                {inventory.filter(isLowStock).map(item => (
                  <div key={item.id} className="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
                    <div>
                      <p className="text-slate-50">{item.item_name}</p>
                      <p className="text-sm text-slate-400">
                        Current: {item.current_stock} {item.uom} | Min: {item.min_stock_qty} {item.uom}
                      </p>
                    </div>
                    <Button variant="danger" size="sm" onClick={() => { setAddStockModal(item.id); setAddStockQty(''); }}>
                      Add Stock
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-emerald-500">All items are above minimum stock level</p>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <p className="text-slate-400 text-sm">Open Procurement Orders</p>
          <p className="text-2xl font-bold text-amber-500 mt-2">
            {purchaseOrders.filter((po) => po.delivery_status === 'ordered').length}
          </p>
        </Card>
        <Card>
          <p className="text-slate-400 text-sm">Materials Issued (30 days)</p>
          <p className="text-2xl font-bold text-slate-50 mt-2">
            {
              materialIssues.filter((issue) => {
                const age = Date.now() - new Date(issue.issuedAt).getTime();
                return age <= 30 * 24 * 60 * 60 * 1000;
              }).length
            }
          </p>
        </Card>
        <Card>
          <p className="text-slate-400 text-sm">Integrated Low Stock Alerts</p>
          <p className="text-2xl font-bold text-rose-500 mt-2">{inventory.filter(isLowStock).length}</p>
        </Card>
      </div>

      {/* Add Stock Modal */}
      <Modal isOpen={!!addStockModal} onClose={() => setAddStockModal(null)} title="Add Stock">
        <div className="space-y-4">
          <p className="text-slate-400 text-sm">
            Adding stock for: <span className="text-slate-50 font-medium">
              {inventory.find((i) => i.id === addStockModal)?.item_name}
            </span>
          </p>
          <Input
            label="Quantity to Add"
            type="number"
            min="1"
            value={addStockQty}
            onChange={(e) => setAddStockQty(e.target.value)}
          />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setAddStockModal(null)}>Cancel</Button>
            <Button onClick={() => {
              if (addStockModal && addStockQty) {
                addInventoryStock(addStockModal, Number(addStockQty));
                setAddStockModal(null);
              }
            }}>Add Stock</Button>
          </div>
        </div>
      </Modal>

      {/* Add Item Modal */}
      <Modal isOpen={addItemModal} onClose={() => setAddItemModal(false)} title="Add Inventory Item">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!itemForm.item_name || !itemForm.uom) return;
            addInventoryItem({
              ...itemForm,
              unit_cost: Number(itemForm.unit_cost),
              min_stock_qty: Number(itemForm.min_stock_qty),
              current_stock: 0,
            });
            setItemForm(defaultItemForm);
            setAddItemModal(false);
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <Input label="Item Name" required value={itemForm.item_name} onChange={(e) => setItemForm({ ...itemForm, item_name: e.target.value })} />
            <Input label="Category" value={itemForm.category} onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })} />
            <Input label="Unit of Measure" required value={itemForm.uom} onChange={(e) => setItemForm({ ...itemForm, uom: e.target.value })} placeholder="bags, kg, tonne, litre, m³, sq ft..." />
            <Input label="Unit Cost" type="number" min="0" step="0.01" value={itemForm.unit_cost} onChange={(e) => setItemForm({ ...itemForm, unit_cost: e.target.value })} />
            <Input label="Min Stock Qty" type="number" min="0" value={itemForm.min_stock_qty} onChange={(e) => setItemForm({ ...itemForm, min_stock_qty: e.target.value })} />
            <Input label="Supplier" value={itemForm.supplier} onChange={(e) => setItemForm({ ...itemForm, supplier: e.target.value })} />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" type="button" onClick={() => setAddItemModal(false)}>Cancel</Button>
            <Button type="submit">Add Item</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
