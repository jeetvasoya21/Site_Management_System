import { useContext, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { Card, Button, Select, Input, Badge } from '../components/ui';
import { formatCurrency } from '../utils/currency';

const localToday = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];

const defaultForm = {
  workerId: '',
  projectId: '',
  date: localToday,
  status: 'Present',
  hours_worked: 8,
};

export default function Attendance() {
  const { workers, projects, attendanceRecords, recordAttendance } = useContext(AppContext);
  const { user } = useAuth();
  const [form, setForm] = useState(defaultForm);
  const [selectedDate, setSelectedDate] = useState(defaultForm.date);

  const filtered = useMemo(() => {
    return attendanceRecords.filter((entry) => entry.date === selectedDate);
  }, [attendanceRecords, selectedDate]);

  const dailyLaborCost = useMemo(() => {
    return filtered.reduce((sum, entry) => sum + Number(entry.labor_cost || 0), 0);
  }, [filtered]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.workerId || !form.projectId || !form.date || !form.status) {
      window.alert('Please fill all required fields');
      return;
    }

    // workerId and projectId are already normalized strings from AppContext
    recordAttendance(
      {
        ...form,
        hours_worked: Number(form.hours_worked),
      },
      user?.id || null
    );
  };

  const getWorkerName = (id) => workers.find((worker) => String(worker.id) === String(id))?.name || String(id);
  const getProjectName = (id) => projects.find((project) => String(project.id) === String(id))?.project_name || String(id);

  return (
    <div className="space-y-6">
      {/* TOP SECTION */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
            <span>Home</span>
            <span>/</span>
            <span className="text-primary-600 font-medium">Attendance</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Attendance Management</h1>
          <p className="text-slate-400 mt-1">Track attendance, hours worked and automated labor cost</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary">Export Register</Button>
        </div>
      </div>

      <Card title="Record Attendance">
        <form className="grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={handleSubmit}>
          <Select
            label="Worker"
            required
            value={form.workerId}
            options={workers.map((worker) => ({ value: worker.id, label: worker.name }))}
            onChange={(e) => setForm({ ...form, workerId: e.target.value })}
          />
          <Select
            label="Project"
            required
            value={form.projectId}
            options={projects.map((project) => ({ value: project.id, label: project.project_name }))}
            onChange={(e) => setForm({ ...form, projectId: e.target.value })}
          />
          <Input label="Date" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <Select
            label="Status"
            value={form.status}
            options={[
              { value: 'Present', label: 'Present' },
              { value: 'Half Day', label: 'Half Day' },
              { value: 'Absent', label: 'Absent' },
            ]}
            onChange={(e) => {
              const status = e.target.value;
              const hours = status === 'Present' ? 8 : status === 'Half Day' ? 4 : 0;
              setForm({ ...form, status, hours_worked: hours });
            }}
          />
          <Input
            label="Hours Worked"
            type="number"
            min="0"
            max="24"
            value={form.hours_worked}
            onChange={(e) => setForm({ ...form, hours_worked: e.target.value })}
          />
          <div className="md:col-span-3">
            <Button type="submit">Save Attendance</Button>
          </div>
        </form>
      </Card>

      <Card title="Daily Attendance Table">
        <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Attendance Date" type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
            <p className="text-slate-400 text-sm">Workers Marked</p>
            <p className="text-2xl font-bold text-slate-100">{filtered.length}</p>
          </div>
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
            <p className="text-slate-400 text-sm">Labor Cost (Auto)</p>
            <p className="text-2xl font-bold text-amber-500">{formatCurrency(dailyLaborCost)}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Worker</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Project</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Hours</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Labor Cost</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <tr key={entry.id} className="border-b border-slate-800 hover:bg-slate-800/40">
                  <td className="py-3 px-4 text-slate-300">{getWorkerName(entry.workerId)}</td>
                  <td className="py-3 px-4 text-slate-400">{getProjectName(entry.projectId)}</td>
                  <td className="py-3 px-4">
                    <Badge variant={entry.status === 'Absent' ? 'danger' : entry.status === 'Half Day' ? 'warning' : 'success'}>
                      {entry.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-400">{entry.hours_worked}</td>
                  <td className="py-3 px-4 text-slate-300 font-medium">{formatCurrency(entry.labor_cost || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
