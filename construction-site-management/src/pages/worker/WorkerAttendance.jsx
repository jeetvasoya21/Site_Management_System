/**
 * WorkerAttendance Page
 * Shows a worker's personal attendance history with lunar holiday indicators
 */

import { useContext, useMemo, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { Card, Badge } from '../../components/ui';
import { getLunarHolidaysForMonth, getLunarHolidayType } from '../../utils/lunarHolidays';
import { CalendarDays, Moon } from 'lucide-react';

const today = new Date();

export default function WorkerAttendance() {
  const { workers, attendanceRecords } = useContext(AppContext);
  const { user } = useAuth();

  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth()); // 0-indexed

  const worker = useMemo(
    () => workers.find((w) => w.userId === user?.id) || workers[0],
    [workers, user]
  );

  const myAttendance = useMemo(
    () => attendanceRecords.filter((a) => a.workerId === worker?.id),
    [attendanceRecords, worker]
  );

  // Build a date→record map for quick lookup
  const attendanceMap = useMemo(() => {
    const map = {};
    myAttendance.forEach((a) => { map[a.date] = a; });
    return map;
  }, [myAttendance]);

  // Lunar holidays for the selected month
  const lunarHolidays = useMemo(
    () => getLunarHolidaysForMonth(selectedYear, selectedMonth),
    [selectedYear, selectedMonth]
  );
  const lunarHolidayMap = useMemo(() => {
    const map = {};
    lunarHolidays.forEach((h) => { map[h.date] = h.type; });
    return map;
  }, [lunarHolidays]);

  // Generate all days in selected month
  const daysInMonth = useMemo(() => {
    const days = [];
    const count = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    for (let d = 1; d <= count; d++) {
      const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const record = attendanceMap[dateStr];
      const lunarType = lunarHolidayMap[dateStr];
      days.push({ date: dateStr, day: d, record, lunarType });
    }
    return days;
  }, [selectedYear, selectedMonth, attendanceMap, lunarHolidayMap]);

  // Monthly summary
  const summary = useMemo(() => {
    const monthPrefix = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
    const monthRecords = myAttendance.filter((a) => a.date.startsWith(monthPrefix));
    return {
      present: monthRecords.filter((a) => a.status === 'Present').length,
      halfDay: monthRecords.filter((a) => a.status === 'Half Day').length,
      absent: monthRecords.filter((a) => a.status === 'Absent').length,
      holidays: lunarHolidays.length,
      totalHours: monthRecords.reduce((s, a) => s + Number(a.hours_worked || 0), 0),
      totalEarned: monthRecords.reduce((s, a) => s + Number(a.labor_cost || 0), 0),
    };
  }, [myAttendance, selectedYear, selectedMonth, lunarHolidays]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const years = [2024, 2025, 2026, 2027];

  function getStatusBadge(entry) {
    if (!entry.record) return null;
    const { status } = entry.record;
    if (status === 'Holiday') return <Badge variant="status">Holiday</Badge>;
    if (status === 'Absent') return <Badge variant="danger">Absent</Badge>;
    if (status === 'Half Day') return <Badge variant="warning">Half Day</Badge>;
    return <Badge variant="success">Present</Badge>;
  }

  if (!worker) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-slate-50">My Attendance</h1>
        <Card><p className="text-slate-400 text-center py-8">Worker profile not found.</p></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-50">My Attendance</h1>
        <p className="text-slate-400 mt-1">View your attendance history including lunar holidays</p>
      </div>

      {/* Month/Year Selector */}
      <Card>
        <div className="flex flex-wrap gap-4 items-center">
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
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 mt-5 text-slate-400 text-sm">
            <Moon size={14} className="text-amber-400" />
            <span>Lunar holidays for {months[selectedMonth]} {selectedYear}:</span>
            {lunarHolidays.length === 0 ? (
              <span>None</span>
            ) : (
              lunarHolidays.map((h) => (
                <Badge key={h.date} variant="warning">{h.date} ({h.type})</Badge>
              ))
            )}
          </div>
        </div>
      </Card>

      {/* Monthly Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Present', value: summary.present, color: 'text-emerald-500' },
          { label: 'Half Day', value: summary.halfDay, color: 'text-amber-500' },
          { label: 'Absent', value: summary.absent, color: 'text-rose-500' },
          { label: 'Holidays', value: summary.holidays, color: 'text-blue-400' },
          { label: 'Total Hours', value: summary.totalHours, color: 'text-slate-50' },
          { label: 'Earned', value: `$${summary.totalEarned.toLocaleString()}`, color: 'text-amber-500' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
            <p className="text-slate-400 text-xs">{label}</p>
            <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Attendance Table */}
      <Card title={`${months[selectedMonth]} ${selectedYear} — Daily Log`}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 px-4 text-slate-400 text-sm">Date</th>
                <th className="text-left py-3 px-4 text-slate-400 text-sm">Day</th>
                <th className="text-left py-3 px-4 text-slate-400 text-sm">Status</th>
                <th className="text-left py-3 px-4 text-slate-400 text-sm">Hours</th>
                <th className="text-left py-3 px-4 text-slate-400 text-sm">Earned</th>
                <th className="text-left py-3 px-4 text-slate-400 text-sm">Note</th>
              </tr>
            </thead>
            <tbody>
              {daysInMonth.map((entry) => {
                const dayName = new Date(entry.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' });
                const isSunday = new Date(entry.date + 'T12:00:00').getDay() === 0;
                const isHolidayDate = !!entry.lunarType;
                return (
                  <tr
                    key={entry.date}
                    className={`border-b border-slate-800 ${
                      isHolidayDate ? 'bg-amber-500/5' : isSunday ? 'bg-slate-800/20' : ''
                    }`}
                  >
                    <td className="py-3 px-4 text-slate-50 text-sm font-medium">{entry.date}</td>
                    <td className={`py-3 px-4 text-sm ${isSunday ? 'text-rose-400' : 'text-slate-400'}`}>{dayName}</td>
                    <td className="py-3 px-4">
                      {entry.lunarType ? (
                        <div className="flex items-center gap-2">
                          <Moon size={12} className="text-amber-400" />
                          <Badge variant="warning">{entry.lunarType}</Badge>
                        </div>
                      ) : entry.record ? (
                        getStatusBadge(entry)
                      ) : (
                        <span className="text-slate-600 text-xs">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-sm">
                      {entry.record && !entry.lunarType ? entry.record.hours_worked : '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-50 text-sm">
                      {entry.record && !entry.lunarType ? `$${Number(entry.record.labor_cost || 0).toLocaleString()}` : '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs">
                      {entry.lunarType ? `Lunar holiday: ${entry.lunarType}` : isSunday ? 'Sunday' : ''}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
