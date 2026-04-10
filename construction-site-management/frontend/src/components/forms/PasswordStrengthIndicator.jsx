/**
 * PasswordStrengthIndicator Component
 * Displays password strength meter and requirements
 */

import { getPasswordStrength, getPasswordStrengthLabel, getPasswordRequirements } from '../../utils/validation';
import { Check, X } from 'lucide-react';

export default function PasswordStrengthIndicator({ password, showRequirements = true }) {
  const strength = getPasswordStrength(password);
  const label = getPasswordStrengthLabel(strength);
  const requirements = getPasswordRequirements(password);

  const strengthColors = [
    'bg-red-500',
    'bg-primary-100 text-primary-600',
    'bg-yellow-500',
    'bg-blue-500',
    'bg-emerald-500',
  ];

  return (
    <div className="space-y-3">
      {/* Strength Meter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-100">Password Strength</span>
          <span className={`text-sm font-bold ${
            strength === 0 ? 'text-red-600' :
            strength === 1 ? 'text-amber-600' :
            strength === 2 ? 'text-yellow-600' :
            strength === 3 ? 'text-blue-600' :
            'text-emerald-600'
          }`}>
            {label}
          </span>
        </div>

        <div className="flex gap-1.5">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full transition-colors ${
                i <= strength ? strengthColors[strength] : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Requirements Checklist */}
      {showRequirements && (
        <div className="space-y-2 pt-3 border-t border-slate-800">
          <p className="text-xs font-semibold text-slate-100 uppercase tracking-wider">Requirements:</p>
          <div className="space-y-1.5">
            <RequirementItem
              met={requirements.minLength}
              label="At least 8 characters"
            />
            <RequirementItem
              met={requirements.uppercase}
              label="Uppercase letter (A-Z)"
            />
            <RequirementItem
              met={requirements.lowercase}
              label="Lowercase letter (a-z)"
            />
            <RequirementItem
              met={requirements.number}
              label="Number (0-9)"
            />
            <RequirementItem
              met={requirements.special}
              label="Special character (!@#$%^&*)"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function RequirementItem({ met, label }) {
  return (
    <div className="flex items-center gap-2">
      {met ? (
        <Check size={14} className="text-emerald-600 flex-shrink-0" />
      ) : (
        <X size={14} className="text-slate-400 flex-shrink-0" />
      )}
      <span className={`text-xs ${met ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
        {label}
      </span>
    </div>
  );
}
