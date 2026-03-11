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
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500',
      text: 'text-emerald-500',
      icon: CheckCircle,
    },
    error: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500',
      text: 'text-rose-500',
      icon: AlertCircle,
    },
    warning: {
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500',
      text: 'text-yellow-500',
      icon: AlertTriangle,
    },
    info: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500',
      text: 'text-blue-500',
      icon: Info,
    },
  };

  const config = typeConfig[type] || typeConfig.info;
  const Icon = config.icon;

  return (
    <div
      className={`${config.bg} border ${config.border} rounded-lg p-4 flex items-start gap-3 animate-in slide-in-from-top-2 fade-in`}
    >
      <Icon className={`${config.text} flex-shrink-0 mt-0.5`} size={20} />
      <p className={`${config.text} text-sm flex-1`}>{message}</p>
      <button
        onClick={onClose}
        className={`${config.text} hover:opacity-70 transition-opacity flex-shrink-0`}
      >
        <X size={18} />
      </button>
    </div>
  );
}
