/**
 * Tasks Page
 * Kanban board with drag-and-drop functionality
 * Features: draggable task cards, status updates, add/delete tasks
 * Role-based task visibility and permissions
 */

import { useContext, useState, useMemo } from 'react';
import { AppContext } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { Card, Button, Input, Select, Modal, Badge } from '../components/ui';
import { Plus, Trash2, Lock } from 'lucide-react';

const Tasks = () => {
  const { tasks, projects, workers, addTask, updateTaskStatus, checkDependencies, updateTaskProgress } =
    useContext(AppContext);
  const { user } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);
  const [formData, setFormData] = useState({
    task_name: '',
    projectId: '',
    assigned_to: '',
    priority: 'Medium',
    deadline: '',
    workers_assigned: [],
  });

  // Check if user can create/delete tasks
  const canManageTasks = ['Admin', 'Project_Manager'].includes(user?.role);

  // Filter tasks based on role
  const visibleTasks = useMemo(() => {
    if (user?.role === 'Admin' || user?.role === 'Project_Manager') {
      return tasks;
    } else if (user?.role === 'Site_Engineer') {
      // Site Engineer sees only their assigned tasks
      return tasks.filter(t => t.assigned_to === user?.id);
    }
    return [];
  }, [tasks, user?.role, user?.id]);

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    return {
      Open: visibleTasks.filter((t) => t.status === 'Open'),
      'In Progress': visibleTasks.filter((t) => t.status === 'In Progress'),
      Completed: visibleTasks.filter((t) => t.status === 'Completed'),
    };
  }, [visibleTasks]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.task_name || !formData.projectId || !formData.assigned_to) {
      alert('Please fill in all required fields');
      return;
    }

    addTask({
      task_name: formData.task_name,
      projectId: formData.projectId,
      assigned_to: formData.assigned_to,
      priority: formData.priority,
      deadline: formData.deadline,
      due_date: formData.deadline,
      workers_assigned: formData.workers_assigned,
      materials_used: [],
    });

    resetForm();
    setIsModalOpen(false);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      task_name: '',
      projectId: '',
      assigned_to: '',
      priority: 'Medium',
      deadline: '',
      workers_assigned: [],
    });
  };

  // Handle drag start
  const handleDragStart = (task) => {
    if (canManageTasks || task.assigned_to === user?.id) {
      setDraggedTask(task);
    }
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Handle drop
  const handleDrop = (status) => {
    if (draggedTask && draggedTask.status !== status) {
      if (canManageTasks || draggedTask.assigned_to === user?.id) {
        updateTaskStatus(draggedTask.id, status);
        setDraggedTask(null);
      }
    }
  };

  // Handle delete
  const handleDelete = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      alert('Delete functionality requires backend integration');
    }
  };

  // Get project name
  const getProjectName = (projectId) => {
    return projects.find((p) => p.id === projectId)?.project_name || 'Unknown';
  };

  // Get worker name
  const getWorkerName = (workerId) => {
    return workers.find((w) => w.id === workerId)?.name || 'Unassigned';
  };

  // Priority color
  const getPriorityBgClass = (priority) => {
    const classes = {
      Low: 'bg-green-500/20 text-green-400 border border-green-500/50',
      Medium: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50',
      High: 'bg-orange-500/20 text-orange-400 border border-orange-500/50',
      Critical: 'bg-red-500/20 text-red-400 border border-red-500/50',
    };
    return classes[priority] || classes.Medium;
  };

  const getDependencyStatus = (task) => {
    if (!task.dependencies || task.dependencies.length === 0) {
      return { blocked: false, text: '' };
    }
    const allComplete = checkDependencies(task.id);
    return {
      blocked: !allComplete && task.status !== 'Completed',
      text: allComplete ? 'Ready' : 'Blocked',
    };
  };

  // Kanban column
  const KanbanColumn = ({ status, taskList }) => (
    <div
      onDragOver={handleDragOver}
      onDrop={() => handleDrop(status)}
      className="bg-slate-800/50 rounded-lg p-4 min-h-96 border-2 border-dashed border-slate-700 hover:border-amber-500/50 transition-colors"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-slate-50">{status}</h3>
        <span className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded">
          {taskList.length}
        </span>
      </div>

      <div className="space-y-3">
        {taskList.map((task) => {
            const canEditTask = canManageTasks || task.assigned_to === user?.id;
            const depStatus = getDependencyStatus(task);
            const progress = task.progress || 0;
          
            return (
            <div
              key={task.id}
              draggable={canEditTask}
              onDragStart={() => handleDragStart(task)}
              className={`bg-slate-900 border border-slate-700 rounded-lg p-3 ${
                canEditTask
                  ? 'cursor-move hover:border-amber-500 transition-colors hover:shadow-lg'
                  : 'cursor-not-allowed opacity-75'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="text-slate-50 font-medium text-sm flex-1">
                  {task.task_name}
                </h4>
                {canEditTask && (
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="text-rose-500 hover:bg-slate-800 p-1 rounded transition-colors flex-shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <p className="text-xs text-slate-400 mb-2">
                {getProjectName(task.projectId)}
              </p>


              <div className="flex items-center justify-between gap-2 mb-2">
                <span className={`text-xs px-2 py-1 rounded font-medium ${getPriorityBgClass(task.priority)}`}>
                  {task.priority}
                </span>
                {depStatus.text && (
                  <span className={`text-xs px-2 py-1 rounded ${depStatus.blocked ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                    {depStatus.text}
                  </span>
                )}
              </div>

              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400">Progress</span>
                  <span className="text-xs text-slate-300 font-medium">{progress}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-2 text-xs text-slate-400 space-y-1">
                <p>Deadline: {task.deadline || task.due_date || '-'}</p>
                <p>Workers: {(task.workers_assigned || []).length}</p>
                <p>Materials: {(task.materials_used || []).length}</p>
                {task.dependencies && task.dependencies.length > 0 && (
                  <p>Dependencies: {task.dependencies.length}</p>
                )}
              </div>
            </div>
          );
        })}

        {taskList.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <p className="text-sm">No tasks</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50">Tasks</h1>
          <p className="text-slate-400 mt-1">
            {user?.role === 'Site_Engineer'
              ? 'Your assigned tasks'
              : 'Manage project tasks with drag-and-drop'}
          </p>
        </div>
        {canManageTasks && (
          <Button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            New Task
          </Button>
        )}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KanbanColumn status="Open" taskList={tasksByStatus.Open} />
        <KanbanColumn status="In Progress" taskList={tasksByStatus['In Progress']} />
        <KanbanColumn status="Completed" taskList={tasksByStatus.Completed} />
      </div>

      {/* View-only notice for Site Engineer */}
      {user?.role === 'Site_Engineer' && (
        <Card className="bg-blue-500/10 border border-blue-500/50">
          <div className="flex items-center gap-3">
            <Lock size={20} className="text-blue-500" />
            <p className="text-blue-400">
              You can only see and update your assigned tasks. Contact your Project Manager to create new tasks.
            </p>
          </div>
        </Card>
      )}

      {/* Add Task Modal */}
      {canManageTasks && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title="Create New Task"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Task Name"
              required
              value={formData.task_name}
              onChange={(e) =>
                setFormData({ ...formData, task_name: e.target.value })
              }
              placeholder="e.g., Foundation Excavation"
            />

            <Select
              label="Project"
              required
              options={projects.map((p) => ({
                value: p.id,
                label: p.project_name,
              }))}
              value={formData.projectId}
              onChange={(e) =>
                setFormData({ ...formData, projectId: e.target.value })
              }
            />

            <Select
              label="Assign To"
              required
              options={workers.map((w) => ({
                value: w.id,
                label: w.name,
              }))}
              value={formData.assigned_to}
              onChange={(e) =>
                setFormData({ ...formData, assigned_to: e.target.value })
              }
            />

            <Select
              label="Priority"
              options={[
                { value: 'Low', label: 'Low' },
                { value: 'Medium', label: 'Medium' },
                { value: 'High', label: 'High' },
              ]}
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
            />

            <Input
              label="Deadline"
              type="date"
              required
              value={formData.deadline}
              onChange={(e) =>
                setFormData({ ...formData, deadline: e.target.value })
              }
            />

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Additional Workers Assigned
              </label>
              <select
                multiple
                value={formData.workers_assigned}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions).map((option) => option.value);
                  setFormData({ ...formData, workers_assigned: selected });
                }}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-50 focus:outline-none focus:border-amber-500 min-h-28"
              >
                {workers.map((worker) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" variant="primary" className="flex-1">
                Create Task
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Tasks;
