import { useContext, useMemo, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { Card, Select, Badge } from '../../components/ui';

export default function WorkerPortal() {
  const { workers, attendanceRecords, workerAssignments, tasks } = useContext(AppContext);
  const [selectedWorker, setSelectedWorker] = useState(workers[0]?.id || '');

  const worker = useMemo(() => workers.find((entry) => entry.id === selectedWorker), [selectedWorker, workers]);

  const attendanceHistory = useMemo(() => {
    return attendanceRecords
      .filter((entry) => entry.workerId === selectedWorker)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [attendanceRecords, selectedWorker]);

  const assignedTasks = useMemo(() => {
    const taskIds = workerAssignments
      .filter((entry) => entry.workerId === selectedWorker)
      .map((entry) => entry.taskId);

    return tasks.filter((task) => taskIds.includes(task.id));
  }, [selectedWorker, tasks, workerAssignments]);

  const salaryFromAttendance = useMemo(() => {
    return attendanceHistory.reduce((sum, entry) => sum + Number(entry.labor_cost || 0), 0);
  }, [attendanceHistory]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-50">Worker Portal</h1>
        <p className="text-slate-400 mt-1">View attendance history, salary and assigned tasks</p>
      </div>

      <Card>
        <Select
          label="Worker"
          value={selectedWorker}
          options={workers.map((entry) => ({ value: entry.id, label: `${entry.name} (${entry.skill_type})` }))}
          onChange={(e) => setSelectedWorker(e.target.value)}
        />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <p className="text-slate-400 text-sm">Current Salary (Profile)</p>
          <p className="text-2xl font-bold text-slate-50 mt-2">${Number(worker?.salary || 0).toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-slate-400 text-sm">Salary from Attendance</p>
          <p className="text-2xl font-bold text-amber-500 mt-2">${salaryFromAttendance.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-slate-400 text-sm">Assigned Tasks</p>
          <p className="text-2xl font-bold text-slate-50 mt-2">{assignedTasks.length}</p>
        </Card>
      </div>

      <Card title="Attendance History">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Date</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Hours</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Labor Cost</th>
              </tr>
            </thead>
            <tbody>
              {attendanceHistory.map((entry) => (
                <tr key={entry.id} className="border-b border-slate-800">
                  <td className="py-3 px-4 text-slate-50">{entry.date}</td>
                  <td className="py-3 px-4">
                    <Badge variant={entry.status === 'Absent' ? 'danger' : entry.status === 'Half Day' ? 'warning' : 'success'}>
                      {entry.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{entry.hours_worked}</td>
                  <td className="py-3 px-4 text-slate-300">${Number(entry.labor_cost || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Assigned Tasks">
        <div className="space-y-3">
          {assignedTasks.map((task) => (
            <div key={task.id} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-slate-50 font-medium">{task.task_name}</p>
                <p className="text-slate-400 text-sm">Deadline: {task.deadline || task.due_date}</p>
              </div>
              <Badge variant={task.status === 'Completed' ? 'success' : task.status === 'In Progress' ? 'warning' : 'status'}>
                {task.status}
              </Badge>
            </div>
          ))}
          {assignedTasks.length === 0 && <p className="text-slate-400">No assigned tasks</p>}
        </div>
      </Card>
    </div>
  );
}
