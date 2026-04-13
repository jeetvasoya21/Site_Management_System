/**
 * FormInput Component
 * Reusable form input with validation and error display
 */

import { useState } from 'react';
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';

export default function FormInput({
  label,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  placeholder,
  hint,
  disabled = false,
  showToggle = false,
  onBlur,
}) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;
  const hasError = !!error;
  const isValid = value && !error && type !== 'password';

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-slate-400 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-4 py-2.5 bg-slate-900 border rounded-lg text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all duration-200 ${
            hasError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              : isValid
              ? 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20'
              : 'border-slate-800 focus:border-amber-500 focus:ring-amber-500/20'
          } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-900' : ''}`}
        />

        {/* Show/Hide Password Toggle */}
        {isPassword && showToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-400 transition-colors"
            tabIndex="-1"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}

        {/* Success Icon */}
        {isValid && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-600">
            <CheckCircle size={18} />
          </div>
        )}

        {/* Error Icon */}
        {hasError && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-600">
            <AlertCircle size={18} />
          </div>
        )}
      </div>

      {/* Error Message */}
      {hasError && (
        <p className="text-sm text-red-600 flex items-center gap-1 font-medium">
          <AlertCircle size={14} />
          {error}
        </p>
      )}

      {/* Hint Text */}
      {hint && !hasError && (
        <p className="text-sm text-slate-400">{hint}</p>
      )}
    </div>
  );
}
