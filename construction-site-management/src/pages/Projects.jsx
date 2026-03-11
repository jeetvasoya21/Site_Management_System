/**
 * Projects Page
 * Full CRUD operations for projects
 * Features: table, search, filter, add/edit/delete modals
 * Role-based visibility and permissions
 */

import { useContext, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { Card, Button, Input, Select, Modal, Table, Badge } from '../components/ui';
import { Plus, Trash2, Edit2, Lock, ExternalLink } from 'lucide-react';

const Projects = () => {
  const { projects, addProject, updateProject, deleteProject, projectMembers } =
    useContext(AppContext);
  const { user } = useAuth();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    project_name: '',
    site_location: '',
    project_type: 'Commercial',
    start_date: '',
    end_date: '',
    budget: '',
  });

  // Check if user can edit/delete projects (Admin and Project Manager only)
  const canManageProjects = ['Admin', 'Project_Manager'].includes(user?.role);

  // Filter projects based on role
  const visibleProjects = useMemo(() => {
    if (user?.role === 'Admin' || user?.role === 'Project_Manager') {
      return projects;
    }
    if (user?.role === 'Site_Engineer') {
      // Site Engineer only sees projects they are assigned to
      const assignedProjectIds = new Set(
        projectMembers
          .filter((pm) => pm.userId === user.id && pm.project_role === 'Site_Engineer')
          .map((pm) => pm.projectId)
      );
      return projects.filter((p) => assignedProjectIds.has(p.id));
    }
    return [];
  }, [projects, user, projectMembers]);

  // Filter and search projects
  const filteredProjects = useMemo(() => {
    return visibleProjects.filter((project) => {
      const matchesSearch =
        project.project_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.site_location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter = !filterType || project.project_type === filterType;

      return matchesSearch && matchesFilter;
    });
  }, [visibleProjects, searchTerm, filterType]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.project_name ||
      !formData.site_location ||
      !formData.start_date ||
      !formData.end_date ||
      !formData.budget
    ) {
      alert('Please fill in all fields');
      return;
    }

    if (editingProject) {
      updateProject(editingProject.id, {
        ...formData,
        budget: parseFloat(formData.budget),
      });
    } else {
      addProject({
        ...formData,
        budget: parseFloat(formData.budget),
      });
    }

    resetForm();
    setIsModalOpen(false);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      project_name: '',
      site_location: '',
      project_type: 'Commercial',
      start_date: '',
      end_date: '',
      budget: '',
    });
    setEditingProject(null);
  };

  // Open modal for editing
  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      project_name: project.project_name,
      site_location: project.site_location,
      project_type: project.project_type,
      start_date: project.start_date,
      end_date: project.end_date,
      budget: project.budget.toString(),
    });
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      deleteProject(id);
    }
  };

  // Table columns
  const columns = [
    {
      key: 'project_name',
      label: 'Project Name',
      render: (value, row) => (
        <button
          onClick={() => navigate(`/projects/${row.id}`)}
          className="flex items-center gap-2 text-amber-400 hover:text-amber-300 font-medium transition-colors text-left"
        >
          {value}
          <ExternalLink size={12} />
        </button>
      ),
    },
    { key: 'site_location', label: 'Location' },
    { key: 'project_type', label: 'Type' },
    {
      key: 'start_date',
      label: 'Start Date',
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: 'budget',
      label: 'Budget',
      render: (value) => `$${value.toLocaleString()}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => {
        const statusColor = {
          Planning: 'status',
          Active: 'success',
          Completed: 'warning',
          'On Hold': 'danger',
        };
        return <Badge variant={statusColor[value] || 'status'}>{value}</Badge>;
      },
    },
  ];

  // Add actions column only if user can manage
  if (canManageProjects) {
    columns.push({
      key: 'id',
      label: 'Actions',
      render: (value, row) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-1 text-blue-500 hover:bg-slate-800 rounded transition-colors"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => handleDelete(value)}
            className="p-1 text-rose-500 hover:bg-slate-800 rounded transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50">Projects</h1>
          <p className="text-slate-400 mt-1">
            {canManageProjects ? 'Manage construction projects' : 'View construction projects'}
          </p>
        </div>
        {canManageProjects && (
          <Button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus size={18} />
            New Project
          </Button>
        )}
      </div>

      {/* Search and Filter */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Search"
            placeholder="Search by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Select
            label="Filter by Type"
            options={[
              { value: '', label: 'All Types' },
              { value: 'Residential', label: 'Residential' },
              { value: 'Commercial', label: 'Commercial' },
              { value: 'Infrastructure', label: 'Infrastructure' },
            ]}
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          />
        </div>
      </Card>

      {/* Projects Table */}
      <Card title={`Projects (${filteredProjects.length})`}>
        {filteredProjects.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <p>No projects available</p>
          </div>
        ) : (
          <Table columns={columns} data={filteredProjects} />
        )}
      </Card>

      {/* View-only notice for Site Engineer */}
      {user?.role === 'Site_Engineer' && (
        <Card className="bg-blue-500/10 border border-blue-500/50">
          <div className="flex items-center gap-3">
            <Lock size={20} className="text-blue-500" />
            <p className="text-blue-400">
              You have view-only access to projects. Contact your Project Manager to make changes.
            </p>
          </div>
        </Card>
      )}

      {/* Add/Edit Project Modal */}
      {canManageProjects && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            resetForm();
          }}
          title={editingProject ? 'Edit Project' : 'Create New Project'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Project Name"
              required
              value={formData.project_name}
              onChange={(e) =>
                setFormData({ ...formData, project_name: e.target.value })
              }
              placeholder="e.g., Downtown Office Complex"
            />

            <Input
              label="Site Location"
              required
              value={formData.site_location}
              onChange={(e) =>
                setFormData({ ...formData, site_location: e.target.value })
              }
              placeholder="e.g., New York, NY"
            />

            <Select
              label="Project Type"
              required
              options={[
                { value: 'Residential', label: 'Residential' },
                { value: 'Commercial', label: 'Commercial' },
                { value: 'Infrastructure', label: 'Infrastructure' },
              ]}
              value={formData.project_type}
              onChange={(e) =>
                setFormData({ ...formData, project_type: e.target.value })
              }
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                required
                value={formData.start_date}
                onChange={(e) =>
                  setFormData({ ...formData, start_date: e.target.value })
                }
              />

              <Input
                label="End Date"
                type="date"
                required
                value={formData.end_date}
                onChange={(e) =>
                  setFormData({ ...formData, end_date: e.target.value })
                }
              />
            </div>

            <Input
              label="Budget"
              type="number"
              required
              value={formData.budget}
              onChange={(e) =>
                setFormData({ ...formData, budget: e.target.value })
              }
              placeholder="e.g., 5000000"
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
              >
                {editingProject ? 'Update Project' : 'Create Project'}
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

export default Projects;
