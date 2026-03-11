import { useContext, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Card, Button, Select, Badge } from '../components/ui';

export default function Notifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useContext(AppContext);
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    return notifications.filter((note) => filter === 'all' || note.type === filter);
  }, [filter, notifications]);

  const variantBySeverity = {
    low: 'status',
    medium: 'warning',
    high: 'danger',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50">Notification Center</h1>
          <p className="text-slate-400 mt-1">Low stock, overdue tasks, deliveries, absences and budget alerts</p>
        </div>
        <Button variant="secondary" onClick={markAllNotificationsRead}>Mark all as read</Button>
      </div>

      <Card>
        <Select
          label="Filter"
          value={filter}
          options={[
            { value: 'all', label: 'All' },
            { value: 'low_stock', label: 'Low Stock' },
            { value: 'overdue_tasks', label: 'Overdue Tasks' },
            { value: 'procurement_delivery', label: 'Procurement Delivery' },
            { value: 'worker_absence', label: 'Worker Absence' },
            { value: 'budget_exceed', label: 'Budget Exceed' },
          ]}
          onChange={(e) => setFilter(e.target.value)}
        />
      </Card>

      <Card title={`Notifications (${filtered.length})`}>
        <div className="space-y-3">
          {filtered.map((note) => (
            <div
              key={note.id}
              className={`p-4 rounded-lg border ${
                note.read ? 'bg-slate-900 border-slate-800' : 'bg-slate-800/70 border-amber-500/50'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-slate-50 font-medium">{note.title}</h3>
                    <Badge variant={variantBySeverity[note.severity] || 'status'}>{note.severity}</Badge>
                    {!note.read && <Badge variant="warning">new</Badge>}
                  </div>
                  <p className="text-slate-300 text-sm">{note.message}</p>
                  <p className="text-xs text-slate-500 mt-2">{new Date(note.createdAt).toLocaleString()}</p>
                </div>
                {!note.read && (
                  <Button size="sm" onClick={() => markNotificationRead(note.id)}>
                    Mark Read
                  </Button>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-slate-400">No notifications found</p>}
        </div>
      </Card>
    </div>
  );
}
