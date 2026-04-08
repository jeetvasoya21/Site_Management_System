/**
 * WorkerSalary Page
 * Shows a worker's salary summary based on attendance records
 * Supports daily rate and hourly rate calculations
 */

import { useContext, useMemo, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { Card, Badge } from '../../components/ui';
import { formatCurrencyINR } from '../../utils/formatCurrency';
import { TrendingDown, Calendar, Clock } from 'lucide-react';

const today = new Date();

export default function WorkerSalary() {
  const { workers, attendanceRecords, calculateSalary } = useContext(AppContext);
  const { user } = useAuth();

  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth()); // 0-indexed

  const worker = useMemo(
    () => workers.find((w) => w.userId === user?.id) || workers[0],
    [workers, user]
  );

  const monthPrefix = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
  const fromDate = `${monthPrefix}-01`;
  const lastDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const toDate = `${monthPrefix}-${String(lastDay).padStart(2, '0')}`;

  const salary = useMemo(() => {
    if (!worker) return null;
    return calculateSalary(worker.id, fromDate, toDate);
  }, [worker, calculateSalary, fromDate, toDate]);

  // All-time total
  const allTime = useMemo(() => {
    if (!worker) return null;
    return calculateSalary(worker.id);
  }, [worker, calculateSalary]);

  const monthRecords = useMemo(() => {
    if (!worker) return [];
    return attendanceRecords
      .filter((a) => a.workerId === worker.id && a.date.startsWith(monthPrefix))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [attendanceRecords, worker, monthPrefix]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  if (!worker || !salary) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-50">My Salary</h1>
        <Card><p className="text-slate-400 text-center py-8">Worker profile not found.</p></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-50">My Salary</h1>
        <p className="text-slate-400 mt-1">Salary breakdown based on attendance records</p>
      </div>

      {/* Month Selector */}
      <Card>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 focus:border-amber-500 focus:outline-none"
            >
              {months.map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-50 focus:border-amber-500 focus:outline-none"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="text-slate-400 text-sm pb-2">
            Rate: <span className="text-amber-500 font-semibold">
              ₹{worker.base_rate}/{worker.rate_type === 'Hourly' ? 'hr' : 'day'} ({worker.rate_type})
            </span>
          </div>
        </div>
      </Card>

      {/* Monthly Salary Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SalaryCard
          icon={Calendar}
          label="Days Worked"
          value={`${salary.totalDaysWorked} + ${salary.halfDays}×½`}
          color="text-emerald-500"
        />
        <SalaryCard
          icon={Clock}
          label="Total Hours"
          value={`${salary.totalHours} hrs`}
          color="text-blue-400"
        />
        <div className="p-4 bg-slate-800/50 rounded-lg">
          <p className="text-slate-400 text-sm">Gross Salary</p>
          <p className="text-2xl font-bold text-amber-500 mt-2">{formatCurrencyINR(salary.totalSalary)}</p>
        </div>
        <SalaryCard
          icon={TrendingDown}
          label="Absence Deduction"
          value={`-${formatCurrencyINR(salary.absenceDeduction).substring(1)}`}
          color="text-rose-500"
        />
      </div>

      {/* Net Salary Highlight */}
      <Card className="bg-amber-500/10 border-amber-500/50">
        <div className="flex items-center justify-between p-2">
          <div>
            <p className="text-slate-400 text-sm">Net Salary — {months[selectedMonth]} {selectedYear}</p>
            <p className="text-4xl font-bold text-amber-500 mt-1">{formatCurrencyINR(salary.netSalary)}</p>
            <p className="text-slate-400 text-xs mt-1">
              {salary.totalDaysWorked} full days + {salary.halfDays} half days &nbsp;|&nbsp;
              {salary.absentDays} absent day{salary.absentDays !== 1 ? 's' : ''} deducted
            </p>
          </div>
        </div>
      </Card>

      {/* All-Time Summary */}
      {allTime && (
        <Card title="All-Time Summary">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat label="Total Days Worked" value={allTime.totalDaysWorked} />
            <Stat label="Total Hours" value={`${allTime.totalHours} hrs`} />
            <Stat label="Total Earned" value={formatCurrencyINR(allTime.totalSalary)} accent />
            <Stat label="Total Absent Days" value={allTime.absentDays} />
          </div>
        </Card>
      )}

      {/* Monthly Detail Log */}
      <Card title={`${months[selectedMonth]} ${selectedYear} — Daily Earnings`}>
        {monthRecords.length === 0 ? (
          <p className="text-slate-400 text-center py-6">No attendance records for this month.</p>
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
                {monthRecords.map((entry) => (
                  <tr key={entry.id} className="border-b border-slate-800">
                    <td className="py-3 px-4 text-slate-50 text-sm">{entry.date}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          entry.status === 'Absent' ? 'danger'
                          : entry.status === 'Half Day' ? 'warning'
                          : entry.status === 'Holiday' ? 'status'
                          : 'success'
                        }
                      >
                        {entry.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-sm">{entry.hours_worked}</td>
                    <td className="py-3 px-4 text-slate-50 text-sm font-medium">
                      {formatCurrencyINR(Number(entry.labor_cost || 0))}
                    </td>
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

function SalaryCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className={color} />
        <p className="text-slate-400 text-sm">{label}</p>
      </div>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function Stat({ label, value, accent }) {
  return (
    <div>
      <p className="text-slate-400 text-sm">{label}</p>
      <p className={`text-xl font-bold mt-1 ${accent ? 'text-amber-500' : 'text-slate-50'}`}>{value}</p>
    </div>
  );
}
