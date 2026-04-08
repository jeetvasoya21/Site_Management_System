/**
 * Select Component
 * Reusable select dropdown with label and options
 */

const Select = ({
  label,
  options = [],
  value,
  onChange,
  required = false,
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
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-50 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        {...props}
      >
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
