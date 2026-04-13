/**
 * ProjectDetails Page
 * Full project information with tabbed sections for Project Manager and Site Engineer
 * Tabs: Overview, Tasks, Workers, Inventory, Procurement, Finance
 */

import { useContext, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { Card, Badge, Button, Input, Select, Modal } from '../../components/ui';
import {
  ArrowLeft,
  Plus,
  Trash2,
  UserPlus,
  UserMinus,
  IndianRupee,
  Users,
  Package,
  ClipboardList,
  BarChart3,
  LayoutDashboard,
  AlertTriangle,
} from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', icon: ClipboardList },
  { id: 'workers', label: 'Workers', icon: Users },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'procurement', label: 'Procurement', icon: ClipboardList },
  { id: 'finance', label: 'Finance', icon: BarChart3 },
];

const statusColors = {
  Active: 'success',
  Planning: 'warning',
  Completed: 'status',
  'On Hold': 'danger',
};

export default function ProjectDetails() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    projects,
    tasks,
    workers,
    inventory,
    purchaseOrders,
    financeRecords,
    materialIssues,
    attendanceRecords,
    projectMembers,
    users,
    vendors,
    assignProjectMember,
    removeProjectMember,
    deleteProject,
    addTask,
    updateTaskStatus,
  } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignUserId, setAssignUserId] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);
  const [taskForm, setTaskForm] = useState({
    task_name: '',
    priority: 'Medium',
    due_date: '',
    assigned_to: '',
  });

  // NOTE: projectId from useParams is a string; AppContext mappers normalize all IDs to strings.
  const pid = String(projectId);

  const project = useMemo(() => projects.find((p) => String(p.id) === pid), [projects, pid]);

  const projectTasks = useMemo(() => tasks.filter((t) => String(t.projectId) === pid), [tasks, pid]);

  const projectMemb = useMemo(
    () => projectMembers.filter((pm) => String(pm.projectId) === pid),
    [projectMembers, pid]
  );

  const assignedSiteEngineers = useMemo(() => {
    return projectMemb
      .filter((pm) => pm.project_role === 'Site_Engineer')
      .map((pm) => users.find((u) => String(u.id) === String(pm.userId)))
      .filter(Boolean);
  }, [projectMemb, users]);

  const projectWorkers = useMemo(() => {
    const workerIds = new Set(
      projectTasks.flatMap((t) => t.workers_assigned || []).map(String)
    );
    return workers.filter((w) => workerIds.has(String(w.id)) || String(w.project_id) === pid);
  }, [projectTasks, workers, pid]);

  const projectFinance = useMemo(
    () => financeRecords.filter((f) => String(f.projectId) === pid),
    [financeRecords, pid]
  );

  const projectPOs = useMemo(
    () => purchaseOrders.filter((po) => String(po.projectId) === pid),
    [purchaseOrders, pid]
  );

  const projectInventory = useMemo(() => {
    const usedItemIds = new Set(
      materialIssues.filter((mi) => String(mi.projectId) === pid).map((mi) => String(mi.itemId))
    );
    return inventory.filter((item) => usedItemIds.has(String(item.id)));
  }, [inventory, materialIssues, pid]);

  const totalSpent = useMemo(
    () => projectFinance.reduce((sum, f) => sum + f.amount, 0),
    [projectFinance]
  );

  const budgetUsedPct = project ? Math.min(100, Math.round((totalSpent / project.budget) * 100)) : 0;

  const availableSiteEngineers = useMemo(() => {
    const already = new Set(projectMemb.map((pm) => String(pm.userId)));
    return users.filter((u) => u.role === 'Site_Engineer' && !already.has(String(u.id)));
  }, [users, projectMemb]);

  const canManage = ['Admin', 'Project_Manager'].includes(user?.role);

  if (!project) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2">
          <ArrowLeft size={16} /> Back
        </Button>
        <Card>
          <p className="text-slate-400 text-center py-8">Project not found.</p>
        </Card>
      </div>
    );
  }

  const handleDeleteProject = () => {
    deleteProject(pid);
    navigate('/projects');
  };

  const handleAssignEngineer = async (e) => {
    e.preventDefault();
    if (!assignUserId) return;
    try {
      const result = await assignProjectMember({ projectId: pid, userId: assignUserId, project_role: 'Site_Engineer' });
      if (!result) {
        window.alert('This engineer is already assigned to this project');
        return;
      }
      setAssignUserId('');
      setShowAssignModal(false);
    } catch (err) {
      window.alert('Failed to assign site engineer: ' + err.message);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskForm.task_name || !taskForm.due_date) return;
    try {
      await addTask({
        ...taskForm,
        projectId: pid,
        workers_assigned: [],
        materials_used: [],
        progress: 0,
        dependencies: [],
      });
      setTaskForm({ task_name: '', priority: 'Medium', due_date: '', assigned_to: '' });
      setShowAddTask(false);
    } catch (err) {
      window.alert('Failed to add task: ' + err.message);
    }
  };

  const getVendorName = (id) => vendors.find((v) => v.id === id)?.vendor_name || id;
  const getItemName = (id) => inventory.find((i) => i.id === id)?.item_name || id;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/projects')}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-100">{project.project_name}</h1>
            <p className="text-slate-400 mt-1">{project.site_location} · {project.project_type}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={statusColors[project.status] || 'status'}>{project.status}</Badge>
          {canManage && (
            <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 size={14} className="mr-1" /> Delete
            </Button>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-slate-800 overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'text-amber-500 border-amber-500'
                  : 'text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoTile label="Start Date" value={project.start_date} />
            <InfoTile label="End Date" value={project.end_date} />
            <InfoTile label="Budget" value={formatCurrency(project.budget)} />
            <InfoTile label="Total Spent" value={formatCurrency(totalSpent)} accent />
            <InfoTile label="Tasks" value={projectTasks.length} />
            <InfoTile label="Workers" value={projectWorkers.length} />
          </div>

          {/* Budget Bar */}
          <Card title="Budget Utilization">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Spent: {formatCurrency(totalSpent)}</span>
                <span className="text-slate-400">Budget: {formatCurrency(project.budget)}</span>
              </div>
              <div className="w-full h-3 bg-slate-800/40 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    budgetUsedPct >= 90 ? 'bg-rose-500' : budgetUsedPct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${budgetUsedPct}%` }}
                />
              </div>
              <p className="text-slate-400 text-sm text-right">{budgetUsedPct}% used</p>
            </div>
          </Card>

          {/* Team Management */}
          <Card
            title="Site Engineers"
            headerClassName="flex items-center justify-between"
          >
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-100">Site Engineers Assigned</h3>
              {canManage && (
                <Button size="sm" onClick={() => setShowAssignModal(true)}>
                  <UserPlus size={14} className="mr-1" /> Assign
                </Button>
              )}
            </div>
            <div className="p-6">
              {assignedSiteEngineers.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">No site engineers assigned yet.</p>
              ) : (
                <div className="space-y-3">
                  {assignedSiteEngineers.map((eng) => {
                    const member = projectMemb.find((pm) => String(pm.userId) === String(eng.id));
                    return (
                      <div key={eng.id} className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg">
                        <div>
                          <p className="text-slate-100 font-medium">{eng.name}</p>
                          <p className="text-slate-400 text-sm">{eng.email}</p>
                        </div>
                        {canManage && member && (
                          <button
                            onClick={() => removeProjectMember(member.id)}
                            className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                            title="Remove from project"
                          >
                            <UserMinus size={16} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <Card title="Tasks">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-100">Project Tasks</h3>
            {canManage && (
              <Button size="sm" onClick={() => setShowAddTask(true)}>
                <Plus size={14} className="mr-1" /> Add Task
              </Button>
            )}
          </div>
          <div className="p-6">
            {projectTasks.length === 0 ? (
              <p className="text-slate-400 text-center py-6">No tasks for this project yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left py-3 px-4 text-slate-400 text-sm">Task</th>
                      <th className="text-left py-3 px-4 text-slate-400 text-sm">Priority</th>
                      <th className="text-left py-3 px-4 text-slate-400 text-sm">Status</th>
                      <th className="text-left py-3 px-4 text-slate-400 text-sm">Due Date</th>
                      <th className="text-left py-3 px-4 text-slate-400 text-sm">Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectTasks.map((task) => (
                      <tr key={task.id} className="border-b border-slate-800 hover:bg-slate-800/40">
                        <td className="py-3 px-4 text-slate-100 font-medium">{task.task_name}</td>
                        <td className="py-3 px-4">
                          <Badge variant={task.priority === 'High' ? 'danger' : task.priority === 'Medium' ? 'warning' : 'status'}>
                            {task.priority}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={task.status === 'Completed' ? 'success' : task.status === 'In Progress' ? 'warning' : 'status'}>
                            {task.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-sm">{task.due_date || task.deadline}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-800/40 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-500 rounded-full"
                                style={{ width: `${task.progress || 0}%` }}
                              />
                            </div>
                            <span className="text-slate-400 text-xs w-8">{task.progress || 0}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Workers Tab */}
      {activeTab === 'workers' && (
        <Card title="Workers on Project">
          <div className="p-6">
            {projectWorkers.length === 0 ? (
              <p className="text-slate-400 text-center py-6">No workers assigned to this project yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left py-3 px-4 text-slate-400 text-sm">Name</th>
                      <th className="text-left py-3 px-4 text-slate-400 text-sm">Skill</th>
                      <th className="text-left py-3 px-4 text-slate-400 text-sm">Rate Type</th>
                      <th className="text-left py-3 px-4 text-slate-400 text-sm">Base Rate</th>
                      <th className="text-left py-3 px-4 text-slate-400 text-sm">Days Present</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectWorkers.map((worker) => {
                      const daysPresent = attendanceRecords.filter(
                        (a) => String(a.workerId) === String(worker.id) && String(a.projectId) === pid && a.status === 'Present'
                      ).length;
                      return (
                        <tr key={worker.id} className="border-b border-slate-800 hover:bg-slate-800/40">
                          <td className="py-3 px-4 text-slate-100 font-medium">{worker.name}</td>
                          <td className="py-3 px-4 text-slate-400">{worker.skill_type}</td>
                          <td className="py-3 px-4 text-slate-400">{worker.rate_type}</td>
                          <td className="py-3 px-4 text-slate-100">{formatCurrency(worker.base_rate)}/{worker.rate_type?.toLowerCase() === 'daily' ? 'day' : 'hr'}</td>
                          <td className="py-3 px-4 text-slate-400">{daysPresent}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <Card title="Materials Used">
          <div className="p-6">
            {projectInventory.length === 0 ? (
              <p className="text-slate-400 text-center py-6">No materials issued to this project.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left py-3 px-4 text-slate-400 text-sm">Item</th>
                      <th className="text-left py-3 px-4 text-slate-400 text-sm">Category</th>
                      <th className="text-left py-3 px-4 text-slate-400 text-sm">Total Issued</th>
                      <th className="text-left py-3 px-4 text-slate-400 text-sm">Current Stock</th>
                      <th className="text-left py-3 px-4 text-slate-400 text-sm">Stock Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectInventory.map((item) => {
                      const issued = materialIssues
                        .filter((mi) => mi.projectId === projectId && mi.itemId === item.id)
                        .reduce((sum, mi) => sum + Number(mi.quantity), 0);
                      const isLow = item.current_stock < item.min_stock_qty;
                      return (
                        <tr key={item.id} className="border-b border-slate-800 hover:bg-slate-800/40">
                          <td className="py-3 px-4 text-slate-100 font-medium">{item.item_name}</td>
                          <td className="py-3 px-4 text-slate-400">{item.category}</td>
                          <td className="py-3 px-4 text-slate-100">{issued} {item.uom}</td>
                          <td className="py-3 px-4 text-slate-100">{item.current_stock} {item.uom}</td>
                          <td className="py-3 px-4">
                            {isLow ? (
                              <div className="flex items-center gap-1">
                                <AlertTriangle size={14} className="text-rose-500" />
                                <Badge variant="danger">Low Stock</Badge>
                              </div>
                            ) : (
                              <Badge variant="success">OK</Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Procurement Tab */}
      {activeTab === 'procurement' && (
        <Card title="Purchase Orders">
          <div className="p-6">
            {projectPOs.length === 0 ? (
              <p className="text-slate-400 text-center py-6">No purchase orders for this project.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800">
                      <th className="text-left py-3 px-4 text-slate-400 text-sm">PO ID</th>
                      <th className="text-left py-3 px-4 text-slate-400 text-sm">Vendor</th>
                      <th className="text-left py-3 px-4 text-slate-400 text-sm">Item</th>
                      <th className="text-left py-3 px-4 text-slate-400 text-sm">Qty</th>
                      <th className="text-left py-3 px-4 text-slate-400 text-sm">Total</th>
                      <th className="text-left py-3 px-4 text-slate-400 text-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectPOs.map((po) => (
                      <tr key={po.id} className="border-b border-slate-800 hover:bg-slate-800/40">
                        <td className="py-3 px-4 text-slate-400 text-sm font-mono">{po.id}</td>
                        <td className="py-3 px-4 text-slate-100">{getVendorName(po.vendorId)}</td>
                        <td className="py-3 px-4 text-slate-100">{getItemName(po.itemId)}</td>
                        <td className="py-3 px-4 text-slate-400">{po.quantity}</td>
                        <td className="py-3 px-4 text-slate-100">{formatCurrency(po.quantity * po.unit_price)}</td>
                        <td className="py-3 px-4">
                          <Badge variant={po.delivery_status === 'delivered' ? 'success' : 'warning'}>
                            {po.delivery_status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Finance Tab */}
      {activeTab === 'finance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <p className="text-slate-400 text-sm">Total Budget</p>
              <p className="text-2xl font-bold text-slate-100 mt-1">{formatCurrency(project.budget)}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <p className="text-slate-400 text-sm">Total Spent</p>
              <p className="text-2xl font-bold text-amber-500 mt-1">{formatCurrency(totalSpent)}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <p className="text-slate-400 text-sm">Remaining</p>
              <p className={`text-2xl font-bold mt-1 ${project.budget - totalSpent < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                {formatCurrency(project.budget - totalSpent)}
              </p>
            </div>
          </div>
          <Card title="Finance Records">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left py-3 px-4 text-slate-400 text-sm">Date</th>
                    <th className="text-left py-3 px-4 text-slate-400 text-sm">Category</th>
                    <th className="text-left py-3 px-4 text-slate-400 text-sm">Description</th>
                    <th className="text-left py-3 px-4 text-slate-400 text-sm">Amount</th>
                    <th className="text-left py-3 px-4 text-slate-400 text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {projectFinance.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">No finance records.</td>
                    </tr>
                  ) : (
                    projectFinance.map((record) => (
                      <tr key={record.id} className="border-b border-slate-800 hover:bg-slate-800/40">
                        <td className="py-3 px-4 text-slate-400 text-sm">{record.date}</td>
                        <td className="py-3 px-4">
                          <Badge variant={record.cost_category === 'Labor' ? 'warning' : record.cost_category === 'Material' ? 'status' : 'success'}>
                            {record.cost_category}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-sm">{record.description}</td>
                        <td className="py-3 px-4 text-slate-100 font-medium">{formatCurrency(record.amount)}</td>
                        <td className="py-3 px-4">
                          <Badge variant={record.payment_status === 'Paid' ? 'success' : 'warning'}>
                            {record.payment_status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Project"
      >
        <p className="text-slate-400 mb-6">
          Are you sure you want to delete <span className="font-semibold text-slate-100">{project.project_name}</span>?
          This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
          <Button variant="danger" onClick={handleDeleteProject}>Delete Project</Button>
        </div>
      </Modal>

      {/* Assign Site Engineer Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Assign Site Engineer"
      >
        <form onSubmit={handleAssignEngineer} className="space-y-4">
          {availableSiteEngineers.length === 0 ? (
            <p className="text-slate-400 text-sm">All available site engineers are already assigned.</p>
          ) : (
            <Select
              label="Select Site Engineer"
              value={assignUserId}
              options={[
                { value: '', label: 'Select...' },
                ...availableSiteEngineers.map((u) => ({ value: u.id, label: `${u.name} (${u.email})` })),
              ]}
              onChange={(e) => setAssignUserId(e.target.value)}
            />
          )}
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" type="button" onClick={() => setShowAssignModal(false)}>Cancel</Button>
            <Button type="submit" disabled={!assignUserId}>Assign</Button>
          </div>
        </form>
      </Modal>

      {/* Add Task Modal */}
      <Modal
        isOpen={showAddTask}
        onClose={() => setShowAddTask(false)}
        title="Add Task"
      >
        <form onSubmit={handleAddTask} className="space-y-4">
          <Input
            label="Task Name"
            value={taskForm.task_name}
            onChange={(e) => setTaskForm({ ...taskForm, task_name: e.target.value })}
            required
          />
          <Select
            label="Priority"
            value={taskForm.priority}
            options={[
              { value: 'Low', label: 'Low' },
              { value: 'Medium', label: 'Medium' },
              { value: 'High', label: 'High' },
            ]}
            onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
          />
          <Input
            label="Due Date"
            type="date"
            value={taskForm.due_date}
            onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
            required
          />
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" type="button" onClick={() => setShowAddTask(false)}>Cancel</Button>
            <Button type="submit">Add Task</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function InfoTile({ label, value, accent }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <p className="text-slate-400 text-sm">{label}</p>
      <p className={`text-xl font-bold mt-1 ${accent ? 'text-amber-500' : 'text-slate-50'}`}>{value}</p>
    </div>
  );
}
