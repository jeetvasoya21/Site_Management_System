/**
 * Dashboard Page
 * Overview with KPIs, charts, and recent activity
 * Uses Bento grid layout
 * Role-based customization for different user types
 */

import { useContext, useMemo, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { Card, Badge } from '../components/ui';
import { BudgetChart, CostDistributionChart } from '../components/charts';
import { TrendingUp, Users, AlertCircle, DollarSign, Clock, Truck, BellRing, Search } from 'lucide-react';

const Dashboard = () => {
  const {
    projects,
    tasks,
    workers,
    inventory,
    financeRecords,
    vendors,
    purchaseOrders,
    attendanceRecords,
    notifications,
  } =
    useContext(AppContext);
  const { user } = useAuth();
  const [globalSearch, setGlobalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Calculate KPIs based on role
  const kpis = useMemo(() => {
    let filteredProjects = projects;
    let filteredTasks = tasks;

    // Filter data based on user role
    if (user?.role === 'Project_Manager') {
      // Project Manager sees all projects but limited tasks
      filteredTasks = tasks.filter(t => {
        const project = projects.find(p => p.id === t.projectId);
        return project !== undefined;
      });
    } else if (user?.role === 'Site_Engineer') {
      // Site Engineer sees assigned tasks only
      filteredTasks = tasks.filter(t => t.assigned_to === user?.id);
    }

    const totalProjects = filteredProjects.length;
    const activeWorkers = workers.length;
    const lowStockItems = inventory.filter(
      (item) => item.current_stock < item.min_stock_qty
    ).length;
    const totalBudget = filteredProjects.reduce((sum, p) => sum + p.budget, 0);
    const activeTasks = filteredTasks.filter(t => t.status === 'In Progress').length;
    const openProcurement = purchaseOrders.filter((po) => po.delivery_status === 'ordered').length;
    const unreadNotifications = notifications.filter((note) => !note.read).length;

    return {
      totalProjects,
      activeWorkers,
      lowStockItems,
      totalBudget,
      activeTasks,
      openProcurement,
      unreadNotifications,
    };
  }, [inventory, notifications, projects, purchaseOrders, tasks, user, workers]);

  const globalSearchResults = useMemo(() => {
    if (!globalSearch.trim()) {
      return [];
    }

    const query = globalSearch.toLowerCase();
    const entities = [
      ...projects.map((item) => ({ type: 'Project', name: item.project_name, meta: item.status })),
      ...tasks.map((item) => ({ type: 'Task', name: item.task_name, meta: item.status })),
      ...workers.map((item) => ({ type: 'Worker', name: item.name, meta: item.skill_type })),
      ...vendors.map((item) => ({ type: 'Vendor', name: item.vendor_name, meta: `${item.rating} rating` })),
      ...inventory.map((item) => ({ type: 'Inventory', name: item.item_name, meta: `${item.current_stock} ${item.uom}` })),
    ];

    return entities
      .filter((entity) => entity.name.toLowerCase().includes(query) || entity.type.toLowerCase().includes(query))
      .slice(0, 10);
  }, [globalSearch, inventory, projects, tasks, vendors, workers]);

  // Prepare chart data
  const budgetChartData = useMemo(() => {
    return projects.map((project) => {
      const projectFinance = financeRecords.filter(
        (f) => f.projectId === project.id
      );
      const actualExpenses = projectFinance.reduce((sum, f) => sum + f.amount, 0);

      return {
        name: project.project_name.substring(0, 15),
        budget: project.budget,
        actual: actualExpenses,
      };
    });
  }, [projects, financeRecords]);

  const costDistributionData = useMemo(() => {
    const laborCosts = financeRecords
      .filter((f) => f.cost_category === 'Labor')
      .reduce((sum, f) => sum + f.amount, 0);

    const materialCosts = financeRecords
      .filter((f) => f.cost_category === 'Material')
      .reduce((sum, f) => sum + f.amount, 0);

    return [
      { name: 'Labor Costs', value: laborCosts },
      { name: 'Material Costs', value: materialCosts },
    ];
  }, [financeRecords]);

  const filteredRecentTasks = useMemo(() => {
    return tasks
      .filter((task) => statusFilter === 'all' || task.status === statusFilter)
      .slice(0, 5);
  }, [statusFilter, tasks]);

  const analytics = useMemo(() => {
    const totalVendorSpend = purchaseOrders.reduce(
      (sum, po) => sum + Number(po.quantity) * Number(po.unit_price),
      0
    );
    const attendanceLaborCost = attendanceRecords.reduce(
      (sum, entry) => sum + Number(entry.labor_cost || 0),
      0
    );

    return {
      totalVendorSpend,
      attendanceLaborCost,
    };
  }, [attendanceRecords, purchaseOrders]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-50">Dashboard</h1>
        <p className="text-slate-400 mt-1">
          Welcome back, {user?.name}! Here's your {user?.role?.replace('_', ' ')} overview.
        </p>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-2">Global Search</label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800">
              <Search size={16} className="text-slate-500" />
              <input
                className="bg-transparent outline-none text-slate-50 w-full"
                placeholder="Search projects, tasks, workers, inventory, vendors"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-2">Task Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-50 focus:border-amber-500 focus:outline-none"
            >
              <option value="all">All statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {globalSearchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            {globalSearchResults.map((result, index) => (
              <div key={`${result.type}-${result.name}-${index}`} className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <p className="text-slate-50 text-sm">{result.name}</p>
                <p className="text-xs text-slate-500">{result.type} • {result.meta}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Role-based KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Projects - Admin, Project Manager, Site Engineer */}
        {['Admin', 'Project_Manager', 'Site_Engineer'].includes(user?.role) && (
          <Card className="lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Projects</p>
                <p className="text-3xl font-bold text-slate-50 mt-2">
                  {kpis.totalProjects}
                </p>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <TrendingUp className="text-amber-500" size={24} />
              </div>
            </div>
          </Card>
        )}

        {/* Active Tasks - Project Manager, Site Engineer */}
        {['Project_Manager', 'Site_Engineer'].includes(user?.role) && (
          <Card className="lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active Tasks</p>
                <p className="text-3xl font-bold text-slate-50 mt-2">
                  {kpis.activeTasks}
                </p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Clock className="text-blue-500" size={24} />
              </div>
            </div>
          </Card>
        )}

        {/* Active Workers - Admin, Site Engineer */}
        {['Admin', 'Site_Engineer'].includes(user?.role) && (
          <Card className="lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Active Workers</p>
                <p className="text-3xl font-bold text-slate-50 mt-2">
                  {kpis.activeWorkers}
                </p>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-lg">
                <Users className="text-emerald-500" size={24} />
              </div>
            </div>
          </Card>
        )}

        {/* Low Stock Items - Admin, Project Manager, Site Engineer */}
        {['Admin', 'Project_Manager', 'Site_Engineer'].includes(user?.role) && (
          <Card className="lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Low Stock Items</p>
                <p className="text-3xl font-bold text-slate-50 mt-2">
                  {kpis.lowStockItems}
                </p>
              </div>
              <div className="p-3 bg-rose-500/10 rounded-lg">
                <AlertCircle className="text-rose-500" size={24} />
              </div>
            </div>
          </Card>
        )}

        {/* Total Budget - Admin, Project Manager */}
        {['Admin', 'Project_Manager'].includes(user?.role) && (
          <Card className="lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Budget</p>
                <p className="text-2xl font-bold text-slate-50 mt-2">
                  ₹{(kpis.totalBudget / 1000000).toFixed(1)}M
                </p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <DollarSign className="text-blue-500" size={24} />
              </div>
            </div>
          </Card>
        )}

        {['Admin', 'Project_Manager', 'Site_Engineer'].includes(user?.role) && (
          <Card className="lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Open Procurement</p>
                <p className="text-3xl font-bold text-slate-50 mt-2">{kpis.openProcurement}</p>
              </div>
              <div className="p-3 bg-cyan-500/10 rounded-lg">
                <Truck className="text-cyan-500" size={24} />
              </div>
            </div>
          </Card>
        )}

        <Card className="lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Unread Notifications</p>
              <p className="text-3xl font-bold text-slate-50 mt-2">{kpis.unreadNotifications}</p>
            </div>
            <div className="p-3 bg-indigo-500/10 rounded-lg">
              <BellRing className="text-indigo-400" size={24} />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <p className="text-slate-400 text-sm">Vendor Spending</p>
          <p className="text-2xl font-bold text-amber-500 mt-2">₹{analytics.totalVendorSpend.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-slate-400 text-sm">Attendance Labor Cost</p>
          <p className="text-2xl font-bold text-emerald-500 mt-2">₹{analytics.attendanceLaborCost.toLocaleString()}</p>
        </Card>
      </div>

      {/* Charts Section - Role-based visibility */}
      {['Admin', 'Project_Manager'].includes(user?.role) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Budget Chart */}
          <Card title="Budget vs Actual Expenses">
            <BudgetChart data={projects.map((project) => {
              const projectFinance = financeRecords.filter(
                (f) => f.projectId === project.id
              );
              const actualExpenses = projectFinance.reduce((sum, f) => sum + f.amount, 0);

              return {
                name: project.project_name.substring(0, 15),
                budget: project.budget,
                actual: actualExpenses,
              };
            })} />
          </Card>

          {/* Cost Distribution Chart */}
          <Card title="Cost Distribution">
            <CostDistributionChart data={[
              {
                name: 'Labor Costs',
                value: financeRecords
                  .filter((f) => f.cost_category === 'Labor')
                  .reduce((sum, f) => sum + f.amount, 0),
              },
              {
                name: 'Material Costs',
                value: financeRecords
                  .filter((f) => f.cost_category === 'Material')
                  .reduce((sum, f) => sum + f.amount, 0),
              },
            ]} />
          </Card>
        </div>
      )}

      {/* Recent Tasks - All roles except Worker */}
      {user?.role !== 'Worker' && (
        <Card title="Recent Tasks">
          <div className="space-y-3">
            {filteredRecentTasks.length === 0 ? (
              <p className="text-slate-400 text-center py-4">No tasks available</p>
            ) : (
              filteredRecentTasks.map((task) => {
                const project = projects.find((p) => p.id === task.projectId);
                const statusColor = {
                  Open: 'status',
                  'In Progress': 'warning',
                  Completed: 'success',
                };

                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <div>
                      <p className="text-slate-50 font-medium">{task.task_name}</p>
                      <p className="text-slate-400 text-sm">
                        {project?.project_name}
                      </p>
                    </div>
                    <Badge variant={statusColor[task.status] || 'status'}>
                      {task.status}
                    </Badge>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      )}

      {/* Site_Engineer: Inventory Overview */}
      {user?.role === 'Site_Engineer' && (
        <Card title="Inventory Overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <p className="text-slate-400 text-sm">Total Items</p>
              <p className="text-3xl font-bold text-slate-50 mt-2">{inventory.length}</p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <p className="text-slate-400 text-sm">Low Stock Items</p>
              <p className="text-3xl font-bold text-rose-500 mt-2">
                {inventory.filter(i => i.current_stock < i.min_stock_qty).length}
              </p>
            </div>
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <p className="text-slate-400 text-sm">Total Inventory Value</p>
              <p className="text-3xl font-bold text-emerald-500 mt-2">
                ₹{(inventory.reduce((sum, i) => sum + (i.current_stock * i.unit_cost), 0) / 1000).toFixed(0)}K
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
