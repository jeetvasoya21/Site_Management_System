/**
 * Toast Component
 * Notification component for success, error, warning, info messages
 */

import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

export default function Toast({ type = 'info', message, duration = 5000, onClose }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeConfig = {
    success: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      icon: CheckCircle,
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: AlertCircle,
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      icon: AlertTriangle,
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: Info,
    },
  };

  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div
      className={`${config.bg} border ${config.border} rounded-lg p-4 flex items-start gap-3 animate-slide-in shadow-md`}
    >
      <Icon className={`${config.text} flex-shrink-0 mt-0.5`} size={20} />
      <p className={`${config.text} text-sm flex-1 font-medium`}>{message}</p>
      <button
        onClick={onClose}
        className={`${config.text} hover:opacity-70 transition-opacity flex-shrink-0`}
      >
        <X size={18} />
      </button>
    </div>
  );
}
