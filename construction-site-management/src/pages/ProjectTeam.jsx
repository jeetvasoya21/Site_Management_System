import { useContext, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Card, Button, Select, Badge } from '../components/ui';
import { Trash2 } from 'lucide-react';

const defaultForm = {
  projectId: '',
  userId: '',
  project_role: 'Site_Engineer',
};

export default function ProjectTeam() {
  const { projects, users, projectMembers, assignProjectMember, removeProjectMember } = useContext(AppContext);
  const [form, setForm] = useState(defaultForm);
  const [projectFilter, setProjectFilter] = useState('');

  const filteredMembers = useMemo(() => {
    return projectMembers.filter((member) => !projectFilter || member.projectId === projectFilter);
  }, [projectFilter, projectMembers]);

  const handleAssign = (e) => {
    e.preventDefault();

    if (!form.projectId || !form.userId) {
      window.alert('Please select project and user');
      return;
    }

    const created = assignProjectMember(form);
    if (!created) {
      window.alert('This user is already assigned to the selected project');
      return;
    }

    setForm(defaultForm);
  };

  const getProjectName = (id) => projects.find((project) => project.id === id)?.project_name || id;
  const getUserName = (id) => users.find((user) => user.id === id)?.name || id;

  const siteEngineers = users.filter((user) => user.role === 'Site_Engineer');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-50">Project Team Management</h1>
        <p className="text-slate-400 mt-1">Assign site engineers to projects</p>
      </div>

      <Card title="Assign Project Member">
        <form className="grid grid-cols-1 md:grid-cols-4 gap-4" onSubmit={handleAssign}>
          <Select
            label="Project"
            required
            value={form.projectId}
            options={projects.map((project) => ({ value: project.id, label: project.project_name }))}
            onChange={(e) => setForm({ ...form, projectId: e.target.value })}
          />
          <Select
            label="Member"
            required
            value={form.userId}
            options={siteEngineers.map((member) => ({ value: member.id, label: `${member.name} (${member.role})` }))}
            onChange={(e) => {
              const selected = users.find((user) => user.id === e.target.value);
              setForm({ ...form, userId: e.target.value, project_role: selected?.role || 'Site_Engineer' });
            }}
          />
          <Select
            label="Project Role"
            value={form.project_role}
            options={[
              { value: 'Site_Engineer', label: 'Site Engineer' },
            ]}
            onChange={(e) => setForm({ ...form, project_role: e.target.value })}
          />
          <div className="flex items-end">
            <Button type="submit" className="w-full">Assign</Button>
          </div>
        </form>
      </Card>

      <Card title="Project Members">
        <div className="mb-4">
          <Select
            label="Filter by Project"
            value={projectFilter}
            options={[
              { value: '', label: 'All Projects' },
              ...projects.map((project) => ({ value: project.id, label: project.project_name })),
            ]}
            onChange={(e) => setProjectFilter(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Project</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Member</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Role</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id} className="border-b border-slate-800">
                  <td className="py-3 px-4 text-slate-50">{getProjectName(member.projectId)}</td>
                  <td className="py-3 px-4 text-slate-300">{getUserName(member.userId)}</td>
                  <td className="py-3 px-4"><Badge variant="status">{member.project_role}</Badge></td>
                  <td className="py-3 px-4">
                    <button className="p-1 text-rose-500 hover:bg-slate-800 rounded" onClick={() => removeProjectMember(member.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
