/**
 * Input Component
 * Reusable input field with label and error state support
 * Supports: text, number, date, email types
 */

const Input = ({
  label,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  placeholder,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-50 placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className} ${
          error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' : ''
        }`}
        {...props}
      />
      {error && <p className="text-rose-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default Input;
