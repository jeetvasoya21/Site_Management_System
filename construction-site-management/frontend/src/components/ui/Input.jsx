import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label className="text-sm font-medium text-slate-300">{label}</label>}
      <input
        ref={ref}
        className={`w-full px-4 h-10 bg-slate-900 border rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-colors ${
          error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/50' : 'border-slate-700 hover:border-slate-600'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-rose-500">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
