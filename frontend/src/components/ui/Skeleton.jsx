/**
 * Skeleton Loading Components
 * Shimmer-animated placeholder UI for loading states
 */

export const SkeletonCard = ({ className = '' }) => (
  <div className={`bg-slate-900 border border-slate-800 rounded-xl p-6 ${className}`}>
    <div className="space-y-3">
      <div className="h-4 w-1/3 bg-slate-800 rounded animate-shimmer" />
      <div className="h-8 w-1/2 bg-slate-800 rounded animate-shimmer" />
    </div>
  </div>
);

export const SkeletonTableRow = ({ columns = 5 }) => (
  <tr className="border-b border-slate-800">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <div className="h-4 bg-slate-800 rounded animate-shimmer" style={{ width: `${60 + Math.random() * 30}%` }} />
      </td>
    ))}
  </tr>
);

export const SkeletonTable = ({ rows = 5, columns = 5 }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
    <table className="w-full">
      <thead>
        <tr className="border-b border-slate-800">
          {Array.from({ length: columns }).map((_, i) => (
            <th key={i} className="px-4 py-3 text-left">
              <div className="h-3 w-20 bg-slate-800 rounded animate-shimmer" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonTableRow key={i} columns={columns} />
        ))}
      </tbody>
    </table>
  </div>
);

export const SkeletonText = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className="h-3 bg-slate-800 rounded animate-shimmer" style={{ width: `${70 + Math.random() * 25}%` }} />
    ))}
  </div>
);

export const SkeletonDashboard = () => (
  <div className="space-y-6 animate-fade-in">
    <div className="space-y-2">
      <div className="h-8 w-48 bg-slate-800 rounded animate-shimmer" />
      <div className="h-4 w-72 bg-slate-800 rounded animate-shimmer" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-64 animate-shimmer" />
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-64 animate-shimmer" />
    </div>
  </div>
);
