/**
 * EmptyState Component
 * Displays a placeholder when no data is available
 */

import { Inbox } from 'lucide-react';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No data found',
  description = 'There are no items to display yet.',
  action,
  actionLabel = 'Add New',
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
    <div className="p-4 bg-slate-800/50 rounded-2xl mb-4">
      <Icon size={40} className="text-slate-500" />
    </div>
    <h3 className="text-lg font-semibold text-slate-300 mb-1">{title}</h3>
    <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
    {action && (
      <button onClick={action} className="btn-primary">
        {actionLabel}
      </button>
    )}
  </div>
);

export default EmptyState;
