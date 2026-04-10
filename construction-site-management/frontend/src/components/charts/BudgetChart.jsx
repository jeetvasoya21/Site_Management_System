/**
 * BudgetChart Component
 * Bar chart comparing Budget vs Actual Expenses per project
 * Uses Recharts BarChart with design system colors
 */

import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const BudgetChart = ({ data = [] }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
        <XAxis
          dataKey="name"
          stroke="#e2e8f0"
          style={{ fontSize: '12px' }}
        />
        <YAxis stroke="#e2e8f0" style={{ fontSize: '12px' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '8px',
            color: '#f1f5f9',
          }}
          cursor={{ fill: 'rgba(245, 158, 11, 0.1)' }}
        />
        <Legend
          wrapperStyle={{ paddingTop: '20px', color: '#e2e8f0' }}
          iconType="square"
        />
        <Bar dataKey="budget" fill="#f59e0b" name="Budget" radius={[8, 8, 0, 0]} />
        <Bar dataKey="actual" fill="#475569" name="Actual" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default BudgetChart;
