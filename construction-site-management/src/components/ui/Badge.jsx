/**
 * Badge Component
 * Status indicator with color variants
 * Variants: status, success, warning, danger
 */

const Badge = ({
  variant = 'status',
  children,
  className = '',
  ...props
}) => {
  const variantStyles = {
    status: 'bg-blue-500/10 text-blue-500',
    success: 'bg-emerald-500/10 text-emerald-500',
    warning: 'bg-yellow-500/10 text-yellow-500',
    danger: 'bg-rose-500/10 text-rose-500',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
