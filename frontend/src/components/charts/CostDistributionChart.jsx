/**
 * CostDistributionChart Component
 * Pie chart showing Labor vs Material cost distribution
 * Uses Recharts PieChart with design system colors
 */

import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const COLORS = ['#f59e0b', '#475569'];

const renderCustomLabel = ({ name, value, percent }) => {
  return `${name}: ${(percent * 100).toFixed(0)}%`;
};

const CostDistributionChart = ({ data = [] }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '8px',
            color: '#f1f5f9',
          }}
          formatter={(value) => `$${value.toLocaleString()}`}
        />
        <Legend
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="square"
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CostDistributionChart;
