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
    'bg-rose-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-blue-500',
    'bg-emerald-500',
  ];

  const strengthLabels = [
    'Very Weak',
    'Weak',
    'Fair',
    'Good',
    'Strong',
  ];

  return (
    <div className="space-y-3">
      {/* Strength Meter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Password Strength</span>
          <span className={`text-sm font-medium ${
            strength === 0 ? 'text-rose-500' :
            strength === 1 ? 'text-orange-500' :
            strength === 2 ? 'text-yellow-500' :
            strength === 3 ? 'text-blue-500' :
            'text-emerald-500'
          }`}>
            {label}
          </span>
        </div>

        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full transition-colors ${
                i <= strength ? strengthColors[strength] : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Requirements Checklist */}
      {showRequirements && (
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <p className="text-xs text-slate-400 font-medium">Requirements:</p>
          <div className="space-y-1">
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
        <Check size={14} className="text-emerald-500 flex-shrink-0" />
      ) : (
        <X size={14} className="text-slate-600 flex-shrink-0" />
      )}
      <span className={`text-xs ${met ? 'text-emerald-500' : 'text-slate-500'}`}>
        {label}
      </span>
    </div>
  );
}
