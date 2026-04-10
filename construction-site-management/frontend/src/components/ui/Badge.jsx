/**
 * Badge Component
 * Professional Dark Theme Badges
 */

const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-slate-800 text-slate-300 border-slate-700',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]',
    danger:  'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(225,29,72,0.1)]',
    status:  'bg-primary-500/10 text-primary-400 border-primary-500/20 shadow-[0_0_10px_rgba(79,70,229,0.1)]',
    info:    'bg-sky-500/10 text-sky-400 border-sky-500/20 shadow-[0_0_10px_rgba(14,165,233,0.1)]',
  };

  const style = variants[variant] || variants.default;

  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-md border ${style} ${className}`}>
                 {children}
    </span>
  );
};

export default Badge;
