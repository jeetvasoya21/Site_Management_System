/**
 * Workforce Page
 * Worker management with per-worker attendance tracking
 * Features: worker table, per-worker attendance buttons, add worker modal
 * Role-based visibility - Admin, Project Manager and Site Engineer
 */

import { useContext, useState, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { Card, Button, Input, Select, Modal, Badge } from '../components/ui';
import { Plus, Lock } from 'lucide-react';
import { formatCurrency } from '../utils/currency';

const defaultWorkerForm = {
  name: '',
  skill_type: 'Mason',
  contact: '',
  rate_type: 'Daily',
  base_rate: '',
};

const Workforce = () => {
  const { workers, attendanceRecords, addWorker, updateWorkerAttendance, projects } = useContext(AppContext);
  const { user } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const localToday = new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(localToday);
  const [formData, setFormData] = useState(defaultWorkerForm);
  const [submitting, setSubmitting] = useState(false);

  const canManageWorkforce = ['Admin', 'Project_Manager', 'Site_Engineer'].includes(user?.role);

  if (!canManageWorkforce) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Workforce</h1>
          <p className="text-slate-400 mt-1">Manage workers and attendance</p>
        </div>
        <Card className="bg-rose-500/10 border border-rose-500/50">
          <div className="flex items-center gap-3">
            <Lock size={20} className="text-rose-500" />
            <p className="text-rose-400">
              You don't have access to workforce management. Only Admin, Project Managers and Site Engineers can view this section.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Get attendance status from DB records for a specific worker on selectedDate
  const getAttendanceStatus = (workerId) => {
    const record = attendanceRecords.find(
      a => String(a.workerId) === String(workerId) && a.date === selectedDate
    );
    return record?.status || null;
  };

  // Per-worker attendance — each click updates ONLY that specific worker
  const handleAttendance = (workerId, status) => {
    updateWorkerAttendance(workerId, status, selectedDate);
  };

  // Attendance counts for selected date
  const attendanceSummary = useMemo(() => {
    const dayRecords = attendanceRecords.filter(a => a.date === selectedDate);
    return {
      present: dayRecords.filter(a => a.status === 'Present').length,
      halfDay: dayRecords.filter(a => a.status === 'Half Day' || a.status === 'Half_Day').length,
      absent: dayRecords.filter(a => a.status === 'Absent').length,
    };
  }, [attendanceRecords, selectedDate]);

  // Handle Add Worker form submission
  const handleAddWorker = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.base_rate) {
      window.alert('Name and base rate are required');
      return;
    }
    setSubmitting(true);
    try {
      await addWorker({
        name: formData.name,
        skill_type: formData.skill_type,
        contact: formData.contact,
        rate_type: formData.rate_type,
        base_rate: Number(formData.base_rate),
      });
      setFormData(defaultWorkerForm);
      setIsModalOpen(false);
    } catch (err) {
      window.alert('Failed to add worker: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const AttendanceButtons = ({ workerId }) => {
    const currentStatus = getAttendanceStatus(workerId);

    return (
      <div className="flex gap-2">
        <button
          onClick={() => handleAttendance(workerId, 'Present')}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            currentStatus === 'Present'
              ? 'bg-emerald-500 text-slate-950'
              : 'bg-slate-800/40 text-slate-400 hover:bg-slate-700'
          }`}
        >
          Present
        </button>
        <button
          onClick={() => handleAttendance(workerId, 'Half Day')}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            currentStatus === 'Half Day' || currentStatus === 'Half_Day'
              ? 'bg-yellow-500 text-slate-950'
              : 'bg-slate-800/40 text-slate-400 hover:bg-slate-700'
          }`}
        >
          Half Day
        </button>
        <button
          onClick={() => handleAttendance(workerId, 'Absent')}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            currentStatus === 'Absent'
              ? 'bg-rose-500 text-slate-50'
              : 'bg-slate-800/40 text-slate-400 hover:bg-slate-700'
          }`}
        >
          Absent
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Workforce</h1>
          <p className="text-slate-400 mt-1">Manage workers and attendance</p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Add Worker
        </Button>
      </div>

      {/* Date Selector */}
      <Card>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-slate-300">Attendance Date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500"
          />
        </div>
      </Card>

      {/* Workers Table */}
      <Card title={`Workers (${workers.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800/40 border-b border-slate-700">
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-400">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-400">Skill</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-400">Contact</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-400">Rate Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-400">Base Rate</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-400">Attendance</th>
              </tr>
            </thead>
            <tbody>
              {workers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    No workers available
                  </td>
                </tr>
              ) : (
                workers.map((worker) => (
                  <tr key={worker.id} className="border-b border-slate-800 hover:bg-slate-800/40/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-300">{worker.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{worker.skill_type}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{worker.contact}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">{worker.rate_type}</td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {formatCurrency(worker.base_rate)}/{worker.rate_type?.toLowerCase() === 'daily' ? 'day' : 'hr'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <AttendanceButtons workerId={worker.id} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Attendance Summary */}
      <Card title="Attendance Summary">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-slate-800/50 rounded-lg">
            <p className="text-slate-400 text-sm">Present</p>
            <p className="text-2xl font-bold text-emerald-500 mt-2">{attendanceSummary.present}</p>
          </div>
          <div className="text-center p-4 bg-slate-800/50 rounded-lg">
            <p className="text-slate-400 text-sm">Half Day</p>
            <p className="text-2xl font-bold text-yellow-500 mt-2">{attendanceSummary.halfDay}</p>
          </div>
          <div className="text-center p-4 bg-slate-800/50 rounded-lg">
            <p className="text-slate-400 text-sm">Absent</p>
            <p className="text-2xl font-bold text-rose-500 mt-2">{attendanceSummary.absent}</p>
          </div>
        </div>
      </Card>

      {/* Add Worker Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Worker">
        <form onSubmit={handleAddWorker} className="space-y-4">
          <Input
            label="Worker Name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter worker name"
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Skill Type"
              value={formData.skill_type}
              options={[
                { value: 'Mason', label: 'Mason' },
                { value: 'Helper', label: 'Helper' },
                { value: 'Electrician', label: 'Electrician' },
                { value: 'Plumber', label: 'Plumber' },
                { value: 'Carpenter', label: 'Carpenter' },
                { value: 'Welder', label: 'Welder' },
                { value: 'Painter', label: 'Painter' },
                { value: 'Steel Fixer', label: 'Steel Fixer' },
                { value: 'Tiler', label: 'Tiler' },
              ]}
              onChange={(e) => setFormData({ ...formData, skill_type: e.target.value })}
            />
            <Select
              label="Rate Type"
              value={formData.rate_type}
              options={[
                { value: 'Daily', label: 'Daily' },
                { value: 'Hourly', label: 'Hourly' },
              ]}
              onChange={(e) => setFormData({ ...formData, rate_type: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Contact"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
              placeholder="Phone number"
            />
            <Input
              label="Base Rate (₹)"
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.base_rate}
              onChange={(e) => setFormData({ ...formData, base_rate: e.target.value })}
              placeholder="e.g. 900"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Worker'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Workforce;
