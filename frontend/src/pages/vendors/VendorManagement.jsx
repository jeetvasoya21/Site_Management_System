import { useContext, useMemo, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { Card, Button, Input, Modal, Table, Badge } from '../../components/ui';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const defaultForm = {
  vendor_name: '',
  contact: '',
  email: '',
  address: '',
  rating: 4,
};

export default function VendorManagement() {
  const { vendors, purchaseOrders, addVendor, updateVendor, deleteVendor } = useContext(AppContext);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const filteredVendors = useMemo(() => {
    return vendors.filter((vendor) => {
      const text = `${vendor.vendor_name} ${vendor.contact} ${vendor.email}`.toLowerCase();
      return text.includes(search.toLowerCase());
    });
  }, [search, vendors]);

  const vendorSpending = useMemo(() => {
    return purchaseOrders.reduce((map, po) => {
      map[po.vendorId] = (map[po.vendorId] || 0) + Number(po.quantity) * Number(po.unit_price);
      return map;
    }, {});
  }, [purchaseOrders]);

  const vendorOrders = useMemo(() => {
    return purchaseOrders.reduce((map, po) => {
      map[po.vendorId] = (map[po.vendorId] || 0) + 1;
      return map;
    }, {});
  }, [purchaseOrders]);

  const resetForm = () => {
    setForm(defaultForm);
    setEditing(null);
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (!form.vendor_name || !form.contact || !form.email || !form.address) {
      window.alert('Please fill all required fields');
      return;
    }

    if (editing) {
      updateVendor(editing.id, { ...form, rating: Number(form.rating) });
    } else {
      addVendor({ ...form, rating: Number(form.rating) });
    }

    setIsModalOpen(false);
    resetForm();
  };

  const columns = [
    { key: 'vendor_name', label: 'Vendor Name' },
    { key: 'contact', label: 'Contact' },
    { key: 'email', label: 'Email' },
    { key: 'address', label: 'Address' },
    {
      key: 'rating',
      label: 'Rating',
      render: (value) => <Badge variant={value >= 4 ? 'success' : 'warning'}>{Number(value).toFixed(1)}</Badge>,
    },
    {
      key: 'id',
      label: 'Purchase History',
      render: (value) => (
        <div>
          <p className="text-slate-200 text-sm">Orders: {vendorOrders[value] || 0}</p>
          <p className="text-slate-400 text-xs">Spent: ${(vendorSpending[value] || 0).toLocaleString()}</p>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-2">
          <button
            className="p-1 text-blue-500 hover:bg-slate-800 rounded"
            onClick={() => {
              setEditing(row);
              setForm({
                vendor_name: row.vendor_name,
                contact: row.contact,
                email: row.email,
                address: row.address,
                rating: row.rating,
              });
              setIsModalOpen(true);
            }}
          >
            <Edit2 size={16} />
          </button>
          <button
            className="p-1 text-rose-500 hover:bg-slate-800 rounded"
            onClick={() => {
              if (window.confirm('Delete this vendor?')) {
                deleteVendor(row.id);
              }
            }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50">Vendor Management</h1>
          <p className="text-slate-400 mt-1">Manage vendors and track purchase performance</p>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
        >
          <Plus size={18} />
          Add Vendor
        </Button>
      </div>

      <Card>
        <Input
          label="Search Vendor"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by vendor name, email, contact"
        />
      </Card>

      <Card title={`Vendors (${filteredVendors.length})`}>
        <Table columns={columns} data={filteredVendors} />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editing ? 'Edit Vendor' : 'Create Vendor'}
      >
        <form className="space-y-4" onSubmit={handleSave}>
          <Input label="Vendor Name" required value={form.vendor_name} onChange={(e) => setForm({ ...form, vendor_name: e.target.value })} />
          <Input label="Contact" required value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
          <Input label="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Address" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Input label="Rating" type="number" min="1" max="5" step="0.1" value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} />

          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1">{editing ? 'Update Vendor' : 'Create Vendor'}</Button>
            <Button type="button" variant="secondary" className="flex-1" onClick={() => { setIsModalOpen(false); resetForm(); }}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
