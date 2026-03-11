import { useContext, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { Card, Button, Select, Input } from '../components/ui';

const defaultForm = {
  projectId: '',
  taskId: '',
  itemId: '',
  quantity: '',
};

export default function MaterialIssue() {
  const { projects, tasks, inventory, materialIssues, issueMaterial } = useContext(AppContext);
  const { user } = useAuth();
  const [form, setForm] = useState(defaultForm);

  const taskOptions = useMemo(() => {
    if (!form.projectId) {
      return [];
    }

    return tasks
      .filter((task) => task.projectId === form.projectId)
      .map((task) => ({ value: task.id, label: task.task_name }));
  }, [form.projectId, tasks]);

  const handleIssue = (e) => {
    e.preventDefault();

    if (!form.projectId || !form.itemId || !form.quantity) {
      window.alert('Please select project, item and quantity');
      return;
    }

    issueMaterial(
      {
        ...form,
        quantity: Number(form.quantity),
      },
      user?.id || 'system'
    );

    setForm(defaultForm);
  };

  const getItemName = (id) => inventory.find((item) => item.id === id)?.item_name || id;
  const getProjectName = (id) => projects.find((project) => project.id === id)?.project_name || id;
  const getTaskName = (id) => tasks.find((task) => task.id === id)?.task_name || '-';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-50">Material Issue Module</h1>
        <p className="text-slate-400 mt-1">Issue inventory to projects or tasks and track issued-by user</p>
      </div>

      <Card title="Issue Material">
        <form className="grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={handleIssue}>
          <Select
            label="Project"
            required
            value={form.projectId}
            options={projects.map((project) => ({ value: project.id, label: project.project_name }))}
            onChange={(e) => setForm({ ...form, projectId: e.target.value, taskId: '' })}
          />
          <Select
            label="Task (Optional)"
            value={form.taskId}
            options={taskOptions}
            onChange={(e) => setForm({ ...form, taskId: e.target.value })}
          />
          <Select
            label="Inventory Item"
            required
            value={form.itemId}
            options={inventory.map((item) => ({
              value: item.id,
              label: `${item.item_name} (Stock: ${item.current_stock} ${item.uom})`,
            }))}
            onChange={(e) => setForm({ ...form, itemId: e.target.value })}
          />
          <Input
            label="Quantity"
            type="number"
            min="1"
            required
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          />
          <div className="md:col-span-3">
            <Button type="submit">Issue Material</Button>
          </div>
        </form>
      </Card>

      <Card title="Issue Register">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Date</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Project</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Task</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Item</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Quantity</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Issued By</th>
              </tr>
            </thead>
            <tbody>
              {materialIssues.map((entry) => (
                <tr key={entry.id} className="border-b border-slate-800">
                  <td className="py-3 px-4 text-slate-300">{entry.issuedAt}</td>
                  <td className="py-3 px-4 text-slate-50">{getProjectName(entry.projectId)}</td>
                  <td className="py-3 px-4 text-slate-300">{getTaskName(entry.taskId)}</td>
                  <td className="py-3 px-4 text-slate-300">{getItemName(entry.itemId)}</td>
                  <td className="py-3 px-4 text-slate-300">{entry.quantity}</td>
                  <td className="py-3 px-4 text-slate-300">{entry.issued_by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
