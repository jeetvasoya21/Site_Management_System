import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { Card, Badge } from '../../components/ui';
import { CostDistributionChart } from '../../components/charts';
import { formatCurrencyINR } from '../../utils/formatCurrency';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Lock } from 'lucide-react';

export default function Finance() {
  const { projects, financeRecords } = useContext(AppContext);
  const { user } = useAuth();

  // Check if user can view finance (Admin and Project Manager only)
  const canViewFinance = ['Admin', 'Project_Manager'].includes(user?.role);

  // Render access denied for other roles
  if (!canViewFinance) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-50">Finance Analytics</h1>
          <p className="text-slate-400 mt-2">Monitor project budgets and financial performance</p>
        </div>
        <Card className="bg-rose-500/10 border border-rose-500/50">
          <div className="flex items-center gap-3">
            <Lock size={20} className="text-rose-500" />
            <p className="text-rose-400">
              You don't have access to finance analytics. Only Admin and Project Managers can view this section.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Calculate cost distribution
  const laborCosts = financeRecords
    .filter(record => record.cost_category === 'Labor')
    .reduce((sum, record) => sum + record.amount, 0);

  const materialCosts = financeRecords
    .filter(record => record.cost_category === 'Material')
    .reduce((sum, record) => sum + record.amount, 0);

  const equipmentCosts = financeRecords
    .filter(record => record.cost_category === 'Equipment')
    .reduce((sum, record) => sum + record.amount, 0);

  const otherCosts = financeRecords
    .filter(record => record.cost_category === 'Other')
    .reduce((sum, record) => sum + record.amount, 0);

  const costDistributionData = [
    { name: 'Labor', value: laborCosts },
    { name: 'Material', value: materialCosts },
    { name: 'Equipment', value: equipmentCosts },
    { name: 'Other', value: otherCosts }
  ].filter(item => item.value > 0);

  const COLORS = ['#f59e0b', '#64748b', '#3b82f6', '#8b5cf6'];

  // Calculate project financials
  const projectFinancials = projects.map(project => {
    const projectRecords = financeRecords.filter(record => record.projectId === project.id);
    const totalCost = projectRecords.reduce((sum, record) => sum + record.amount, 0);
    const remainingBudget = project.budget - totalCost;

    return {
      ...project,
      totalCost,
      remainingBudget
    };
  });

  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = financeRecords.reduce((sum, r) => sum + r.amount, 0);
  const totalRemaining = totalBudget - totalSpent;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-50">Finance Analytics</h1>
        <p className="text-slate-400 mt-2">Monitor project budgets and financial performance</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="space-y-2">
            <p className="text-slate-400 text-sm">Total Budget</p>
            <p className="text-2xl font-bold text-amber-500">{formatCurrencyINR(totalBudget)}</p>
          </div>
        </Card>
        <Card>
          <div className="space-y-2">
            <p className="text-slate-400 text-sm">Total Spent</p>
            <p className="text-2xl font-bold text-slate-50">{formatCurrencyINR(totalSpent)}</p>
          </div>
        </Card>
        <Card>
          <div className="space-y-2">
            <p className="text-slate-400 text-sm">Remaining Budget</p>
            <p className={`text-2xl font-bold ${totalRemaining >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {formatCurrencyINR(totalRemaining)}
            </p>
          </div>
        </Card>
      </div>

      {/* Cost Distribution Chart */}
      {costDistributionData.length > 0 && (
        <Card title="Cost Distribution">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${formatCurrencyINR(value)}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {costDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrencyINR(value)}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Project Budget Table */}
      <Card title="Project Budget Summary">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Project</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Budget</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Total Cost</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Remaining</th>
                <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {projectFinancials.length > 0 ? (
                projectFinancials.map(project => (
                  <tr key={project.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 text-slate-50">{project.project_name}</td>
                    <td className="py-3 px-4 text-slate-50">{formatCurrencyINR(project.budget)}</td>
                    <td className="py-3 px-4 text-slate-50">{formatCurrencyINR(project.totalCost)}</td>
                    <td className={`py-3 px-4 font-medium ${project.remainingBudget >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {formatCurrencyINR(project.remainingBudget)}
                    </td>
                    <td className="py-3 px-4">
                      {project.remainingBudget >= 0 ? (
                        <Badge variant="success">On Track</Badge>
                      ) : (
                        <Badge variant="danger">Over Budget</Badge>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 px-4 text-center text-slate-400">
                    No projects found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Cost Category Breakdown */}
      <Card title="Cost Category Breakdown">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-800/50 rounded-lg">
            <p className="text-slate-400 text-sm mb-2">Labor Costs</p>
            <p className="text-2xl font-bold text-amber-500">{formatCurrencyINR(laborCosts)}</p>
            <p className="text-xs text-slate-500 mt-2">
              {((laborCosts / totalSpent) * 100).toFixed(1)}% of total
            </p>
          </div>
          <div className="p-4 bg-slate-800/50 rounded-lg">
            <p className="text-slate-400 text-sm mb-2">Material Costs</p>
            <p className="text-2xl font-bold text-slate-400">{formatCurrencyINR(materialCosts)}</p>
            <p className="text-xs text-slate-500 mt-2">
              {((materialCosts / totalSpent) * 100).toFixed(1)}% of total
            </p>
          </div>
          <div className="p-4 bg-slate-800/50 rounded-lg">
            <p className="text-slate-400 text-sm mb-2">Equipment Costs</p>
            <p className="text-2xl font-bold text-blue-500">{formatCurrencyINR(equipmentCosts)}</p>
            <p className="text-xs text-slate-500 mt-2">
              {((equipmentCosts / totalSpent) * 100).toFixed(1)}% of total
            </p>
          </div>
          <div className="p-4 bg-slate-800/50 rounded-lg">
            <p className="text-slate-400 text-sm mb-2">Other Costs</p>
            <p className="text-2xl font-bold text-purple-500">{formatCurrencyINR(otherCosts)}</p>
            <p className="text-xs text-slate-500 mt-2">
              {((otherCosts / totalSpent) * 100).toFixed(1)}% of total
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
