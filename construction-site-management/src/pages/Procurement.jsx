import { useContext, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { Card, Button, Input, Select, Badge } from '../components/ui';

const defaultForm = {
  projectId: '',
  vendorId: '',
  itemId: '',
  quantity: '',
  unit_price: '',
  expectedDelivery: '',
  delivery_status: 'ordered',
};

export default function Procurement() {
  const {
    projects,
    vendors,
    inventory,
    purchaseOrders,
    createPurchaseOrder,
    updatePurchaseDeliveryStatus,
  } = useContext(AppContext);
  const { user } = useAuth();

  const [form, setForm] = useState(defaultForm);
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = useMemo(() => {
    return purchaseOrders.filter((po) => statusFilter === 'all' || po.delivery_status === statusFilter);
  }, [purchaseOrders, statusFilter]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.projectId || !form.vendorId || !form.itemId || !form.quantity || !form.unit_price) {
      window.alert('Please fill all required fields');
      return;
    }

    createPurchaseOrder(
      {
        ...form,
        quantity: Number(form.quantity),
        unit_price: Number(form.unit_price),
      },
      user?.id || 'system'
    );

    setForm(defaultForm);
  };

  const getProjectName = (id) => projects.find((p) => p.id === id)?.project_name || id;
  const getVendorName = (id) => vendors.find((v) => v.id === id)?.vendor_name || id;
  const getItemName = (id) => inventory.find((i) => i.id === id)?.item_name || id;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-50">Procurement Management</h1>
        <p className="text-slate-400 mt-1">Create purchase orders and track delivery lifecycle</p>
      </div>

      <Card title="Create Purchase Order">
        <form className="grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={handleSubmit}>
          <Select
            label="Project"
            required
            value={form.projectId}
            options={projects.map((project) => ({ value: project.id, label: project.project_name }))}
            onChange={(e) => setForm({ ...form, projectId: e.target.value })}
          />
          <Select
            label="Vendor"
            required
            value={form.vendorId}
            options={vendors.map((vendor) => ({ value: vendor.id, label: vendor.vendor_name }))}
            onChange={(e) => setForm({ ...form, vendorId: e.target.value })}
          />
          <Select
            label="Item"
            required
            value={form.itemId}
            options={inventory.map((item) => ({ value: item.id, label: `${item.item_name} (${item.uom})` }))}
            onChange={(e) => {
              const item = inventory.find((inv) => inv.id === e.target.value);
              setForm({ ...form, itemId: e.target.value, unit_price: item?.unit_cost || '' });
            }}
          />
          <Input
            label="Quantity"
            type="number"
            min="1"
            required
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          />
          <Input
            label="Unit Price"
            type="number"
            min="0"
            step="0.01"
            required
            value={form.unit_price}
            onChange={(e) => setForm({ ...form, unit_price: e.target.value })}
          />
          <Input
            label="Expected Delivery"
            type="date"
            value={form.expectedDelivery}
            onChange={(e) => setForm({ ...form, expectedDelivery: e.target.value })}
          />
          <Select
            label="Delivery Status"
            value={form.delivery_status}
            options={[
              { value: 'ordered', label: 'Ordered' },
              { value: 'delivered', label: 'Delivered' },
            ]}
            onChange={(e) => setForm({ ...form, delivery_status: e.target.value })}
          />

          <div className="md:col-span-3">
            <Button type="submit">Create Purchase Order</Button>
          </div>
        </form>
      </Card>

      <Card title="Purchase Orders">
        <div className="mb-4">
          <Select
            label="Filter by Delivery Status"
            value={statusFilter}
            options={[
              { value: 'all', label: 'All' },
              { value: 'ordered', label: 'Ordered' },
              { value: 'delivered', label: 'Delivered' },
            ]}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">PO</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Project</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Vendor</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Item</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Total</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((po) => (
                <tr key={po.id} className="border-b border-slate-800">
                  <td className="py-3 px-4 text-slate-50">{po.id}</td>
                  <td className="py-3 px-4 text-slate-300">{getProjectName(po.projectId)}</td>
                  <td className="py-3 px-4 text-slate-300">{getVendorName(po.vendorId)}</td>
                  <td className="py-3 px-4 text-slate-300">{getItemName(po.itemId)}</td>
                  <td className="py-3 px-4 text-slate-50">${(Number(po.quantity) * Number(po.unit_price)).toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <Badge variant={po.delivery_status === 'delivered' ? 'success' : 'warning'}>
                      {po.delivery_status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    {po.delivery_status === 'ordered' && (
                      <Button size="sm" onClick={() => updatePurchaseDeliveryStatus(po.id, 'delivered')}>
                        Mark Delivered
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
