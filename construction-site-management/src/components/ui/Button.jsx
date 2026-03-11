/**
 * Button Component
 * Reusable button with multiple variants and sizes
 * Variants: primary, secondary, danger
 * Sizes: sm, md, lg
 */

const Button = ({
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  children,
  className = '',
  type = 'button',
  ...props
}) => {
  const baseStyles = 'font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-amber-500 hover:bg-amber-600 text-slate-950 focus:ring-amber-500',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-50 focus:ring-slate-600',
    danger: 'bg-rose-600 hover:bg-rose-700 text-slate-50 focus:ring-rose-500',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClassName}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
