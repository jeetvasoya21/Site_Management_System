/**
 * Button Component
 * Premium Dark Theme
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
  const baseStyles = 'font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center';

  const variantStyles = {
    primary: 'bg-primary-600 hover:bg-primary-500 text-white focus:ring-primary-500 shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)] border border-primary-500',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 focus:ring-slate-600 border border-slate-700',
    danger: 'bg-rose-600 hover:bg-rose-500 text-white focus:ring-rose-500 shadow-[0_0_15px_rgba(225,29,72,0.3)] border border-rose-500',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
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
