import { useContext, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Card, Button, Select, Input } from '../components/ui';

const defaultForm = {
  workerId: '',
  taskId: '',
  from_date: '',
  to_date: '',
};

export default function Assignments() {
  const { workers, tasks, workerAssignments, assignWorkerToTask } = useContext(AppContext);
  const [form, setForm] = useState(defaultForm);
  const [taskFilter, setTaskFilter] = useState('');

  const filteredAssignments = useMemo(() => {
    return workerAssignments.filter((assignment) => !taskFilter || assignment.taskId === taskFilter);
  }, [taskFilter, workerAssignments]);

  const handleAssign = (e) => {
    e.preventDefault();

    if (!form.workerId || !form.taskId || !form.from_date || !form.to_date) {
      window.alert('Please fill all fields');
      return;
    }

    assignWorkerToTask(form);
    setForm(defaultForm);
  };

  const getWorkerName = (id) => workers.find((worker) => worker.id === id)?.name || id;
  const getTaskName = (id) => tasks.find((task) => task.id === id)?.task_name || id;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-50">Worker Assignment</h1>
        <p className="text-slate-400 mt-1">Assign workers to tasks with date ranges</p>
      </div>

      <Card title="Assign Worker to Task">
        <form className="grid grid-cols-1 md:grid-cols-4 gap-4" onSubmit={handleAssign}>
          <Select
            label="Worker"
            value={form.workerId}
            required
            options={workers.map((worker) => ({ value: worker.id, label: worker.name }))}
            onChange={(e) => setForm({ ...form, workerId: e.target.value })}
          />
          <Select
            label="Task"
            value={form.taskId}
            required
            options={tasks.map((task) => ({ value: task.id, label: task.task_name }))}
            onChange={(e) => setForm({ ...form, taskId: e.target.value })}
          />
          <Input label="From Date" type="date" required value={form.from_date} onChange={(e) => setForm({ ...form, from_date: e.target.value })} />
          <Input label="To Date" type="date" required value={form.to_date} onChange={(e) => setForm({ ...form, to_date: e.target.value })} />
          <div className="md:col-span-4">
            <Button type="submit">Assign Worker</Button>
          </div>
        </form>
      </Card>

      <Card title="Assignment Register">
        <div className="mb-4">
          <Select
            label="Filter by Task"
            value={taskFilter}
            options={[
              { value: '', label: 'All Tasks' },
              ...tasks.map((task) => ({ value: task.id, label: task.task_name })),
            ]}
            onChange={(e) => setTaskFilter(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Worker</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Task</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">From</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">To</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssignments.map((assignment) => (
                <tr key={assignment.id} className="border-b border-slate-800">
                  <td className="py-3 px-4 text-slate-50">{getWorkerName(assignment.workerId)}</td>
                  <td className="py-3 px-4 text-slate-300">{getTaskName(assignment.taskId)}</td>
                  <td className="py-3 px-4 text-slate-300">{assignment.from_date}</td>
                  <td className="py-3 px-4 text-slate-300">{assignment.to_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
