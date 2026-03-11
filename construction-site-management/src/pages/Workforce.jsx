/**
 * Workforce Page
 * Worker management with attendance tracking
 * Features: worker table, attendance buttons, add/delete workers
 * Role-based visibility - Admin and Site Engineer only
 */

import { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { Card, Button, Input, Select, Modal, Table, Badge } from '../components/ui';
import { Plus, Trash2, Edit2, Lock } from 'lucide-react';

const Workforce = () => {
  const { workers, updateWorkerAttendance } = useContext(AppContext);
  const { user } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [formData, setFormData] = useState({
    name: '',
    skill_type: 'Mason',
    contact: '',
    rate_type: 'Daily',
    base_rate: '',
  });

  // Check if user can manage workforce (Admin and Site Engineer only)
  const canManageWorkforce = ['Admin', 'Project_Manager', 'Site_Engineer'].includes(user?.role);

  // Render access denied for other roles
  if (!canManageWorkforce) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-50">Workforce</h1>
          <p className="text-slate-400 mt-1">Manage workers and attendance</p>
        </div>
        <Card className="bg-rose-500/10 border border-rose-500/50">
          <div className="flex items-center gap-3">
            <Lock size={20} className="text-rose-500" />
            <p className="text-rose-400">
              You don't have access to workforce management. Only Admin and Site Engineers can view this section.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Handle attendance update
  const handleAttendance = (workerId, status) => {
    updateWorkerAttendance(workerId, status, selectedDate);
  };

  // Get attendance for selected date
  const getAttendanceStatus = (worker) => {
    const attendance = worker.attendance.find((a) => a.date === selectedDate);
    return attendance?.status || null;
  };

  // Attendance button component
  const AttendanceButtons = ({ worker }) => {
    const currentStatus = getAttendanceStatus(worker);

    return (
      <div className="flex gap-2">
        <button
          onClick={() => handleAttendance(worker.id, 'Present')}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            currentStatus === 'Present'
              ? 'bg-emerald-500 text-slate-950'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Present
        </button>
        <button
          onClick={() => handleAttendance(worker.id, 'Half Day')}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            currentStatus === 'Half Day'
              ? 'bg-yellow-500 text-slate-950'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Half Day
        </button>
        <button
          onClick={() => handleAttendance(worker.id, 'Absent')}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            currentStatus === 'Absent'
              ? 'bg-rose-500 text-slate-50'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
          }`}
        >
          Absent
        </button>
      </div>
    );
  };

  // Table columns
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'skill_type', label: 'Skill' },
    { key: 'contact', label: 'Contact' },
    { key: 'rate_type', label: 'Rate Type' },
    {
      key: 'base_rate',
      label: 'Base Rate',
      render: (value, row) =>
        `₹${value}/${row.rate_type === 'Daily' ? 'day' : 'hr'}`,
    },
    {
      key: 'id',
      label: 'Attendance',
      render: (value, row) => <AttendanceButtons worker={row} />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50">Workforce</h1>
          <p className="text-slate-400 mt-1">Manage workers and attendance</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus size={18} />
          Add Worker
        </Button>
      </div>

      {/* Date Selector */}
      <Card>
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-slate-300">
            Attendance Date:
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-50 focus:outline-none focus:border-amber-500"
          />
        </div>
      </Card>

      {/* Workers Table */}
      <Card title={`Workers (${workers.length})`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-800 border-b border-slate-700">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-6 py-3 text-left text-sm font-semibold text-slate-400"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {workers.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-8 text-center text-slate-400"
                  >
                    No workers available
                  </td>
                </tr>
              ) : (
                workers.map((worker) => (
                  <tr
                    key={worker.id}
                    className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors"
                  >
                    {columns.map((col) => (
                      <td
                        key={`${worker.id}-${col.key}`}
                        className="px-6 py-4 text-sm text-slate-300"
                      >
                        {col.render
                          ? col.render(worker[col.key], worker)
                          : worker[col.key]}
                      </td>
                    ))}
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
            <p className="text-2xl font-bold text-emerald-500 mt-2">
              {workers.filter(
                (w) => getAttendanceStatus(w) === 'Present'
              ).length}
            </p>
          </div>
          <div className="text-center p-4 bg-slate-800/50 rounded-lg">
            <p className="text-slate-400 text-sm">Half Day</p>
            <p className="text-2xl font-bold text-yellow-500 mt-2">
              {workers.filter(
                (w) => getAttendanceStatus(w) === 'Half Day'
              ).length}
            </p>
          </div>
          <div className="text-center p-4 bg-slate-800/50 rounded-lg">
            <p className="text-slate-400 text-sm">Absent</p>
            <p className="text-2xl font-bold text-rose-500 mt-2">
              {workers.filter(
                (w) => getAttendanceStatus(w) === 'Absent'
              ).length}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Workforce;
