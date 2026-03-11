/**
 * WorkerDashboard Page
 * Personal dashboard for workers showing their own data
 */

import { useContext, useMemo } from 'react';
import { AppContext } from '../../context/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { Card, Badge } from '../../components/ui';
import { CalendarClock, DollarSign, CheckSquare, Clock, FileText } from 'lucide-react';

export default function WorkerDashboard() {
  const { workers, attendanceRecords, workerAssignments, tasks, leaveApplications, projects } =
    useContext(AppContext);
  const { user } = useAuth();

  // Find this worker's record linked to the logged-in user
  const worker = useMemo(
    () => workers.find((w) => w.userId === user?.id) || workers[0],
    [workers, user]
  );

  const myAttendance = useMemo(
    () => attendanceRecords.filter((a) => a.workerId === worker?.id),
    [attendanceRecords, worker]
  );

  const myAssignments = useMemo(() => {
    if (!worker) return [];
    const taskIds = workerAssignments.filter((wa) => wa.workerId === worker.id).map((wa) => wa.taskId);
    return tasks.filter((t) => taskIds.includes(t.id) || (t.workers_assigned || []).includes(worker.id));
  }, [workerAssignments, tasks, worker]);

  const myLeaves = useMemo(
    () => leaveApplications.filter((l) => l.workerId === worker?.id),
    [leaveApplications, worker]
  );

  const totalEarned = useMemo(
    () => myAttendance.reduce((sum, a) => sum + Number(a.labor_cost || 0), 0),
    [myAttendance]
  );

  const presentDays = myAttendance.filter((a) => a.status === 'Present').length;
  const absentDays = myAttendance.filter((a) => a.status === 'Absent').length;
  const pendingLeaves = myLeaves.filter((l) => l.status === 'Pending').length;

  const recentAttendance = useMemo(
    () => [...myAttendance].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    [myAttendance]
  );

  const project = useMemo(
    () => projects.find((p) => p.id === worker?.projectId),
    [projects, worker]
  );

  if (!worker) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-50">My Dashboard</h1>
        <Card><p className="text-slate-400 text-center py-8">Worker profile not found.</p></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center">
          <span className="text-amber-500 font-bold text-2xl">{worker.name[0]}</span>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-50">{worker.name}</h1>
          <p className="text-slate-400">{worker.skill_type} · {worker.rate_type} Rate · ₹{worker.base_rate}/{worker.rate_type === 'Hourly' ? 'hr' : 'day'}</p>
          {project && <p className="text-amber-500 text-sm mt-1">Assigned: {project.project_name}</p>}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard icon={CalendarClock} label="Days Present" value={presentDays} color="text-emerald-500" />
        <KpiCard icon={Clock} label="Days Absent" value={absentDays} color="text-rose-500" />
        <KpiCard icon={DollarSign} label="Total Earned" value={`₹${totalEarned.toLocaleString()}`} color="text-amber-500" />
        <KpiCard icon={FileText} label="Leave Requests" value={`${pendingLeaves} pending`} color="text-blue-500" />
      </div>

      {/* Assigned Tasks */}
      <Card title="My Tasks">
        {myAssignments.length === 0 ? (
          <p className="text-slate-400 text-center py-6">No tasks assigned.</p>
        ) : (
          <div className="space-y-3">
            {myAssignments.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800">
                <div>
                  <p className="text-slate-50 font-medium">{task.task_name}</p>
                  <p className="text-slate-400 text-sm">Due: {task.due_date || task.deadline}</p>
                </div>
                <Badge variant={task.status === 'Completed' ? 'success' : task.status === 'In Progress' ? 'warning' : 'status'}>
                  {task.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Recent Attendance */}
      <Card title="Recent Attendance">
        {recentAttendance.length === 0 ? (
          <p className="text-slate-400 text-center py-6">No attendance records yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left py-3 px-4 text-slate-400 text-sm">Date</th>
                  <th className="text-left py-3 px-4 text-slate-400 text-sm">Status</th>
                  <th className="text-left py-3 px-4 text-slate-400 text-sm">Hours</th>
                  <th className="text-left py-3 px-4 text-slate-400 text-sm">Earned</th>
                </tr>
              </thead>
              <tbody>
                {recentAttendance.map((entry) => (
                  <tr key={entry.id} className="border-b border-slate-800">
                    <td className="py-3 px-4 text-slate-50">{entry.date}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          entry.status === 'Holiday' ? 'status'
                            : entry.status === 'Absent' ? 'danger'
                            : entry.status === 'Half Day' ? 'warning'
                            : 'success'
                        }
                      >
                        {entry.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{entry.hours_worked}</td>
                    <td className="py-3 px-4 text-slate-50">${Number(entry.labor_cost || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-2">
        <Icon size={18} className={color} />
        <p className="text-slate-400 text-sm">{label}</p>
      </div>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}
