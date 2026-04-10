import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({ label, options = [], error, className = '', ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-medium text-slate-300">{label}</label>}
      <div className="relative">
        <select
          ref={ref}
          className={`w-full px-4 h-10 appearance-none bg-slate-900 border rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-colors ${
            error ? 'border-rose-500' : 'border-slate-700 hover:border-slate-600'
          } ${className}`}
          {...props}
        >
          {!props.value && <option value="" className="bg-slate-900 text-slate-500">Select...</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100">
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown 
          size={16} 
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" 
        />
      </div>
      {error && <span className="text-xs text-rose-500">{error}</span>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
