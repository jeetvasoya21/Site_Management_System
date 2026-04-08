/**
 * Toast Notification System
 * Global toast context with auto-dismiss
 */

import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext();

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: 'border-emerald-500/30 bg-emerald-500/10',
  error: 'border-rose-500/30 bg-rose-500/10',
  warning: 'border-amber-500/30 bg-amber-500/10',
  info: 'border-blue-500/30 bg-blue-500/10',
};

const iconColors = {
  success: 'text-emerald-400',
  error: 'text-rose-400',
  warning: 'text-amber-400',
  info: 'text-blue-400',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, duration: 4000, type: 'info', ...toast }]);

    // Auto-dismiss
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, toast.duration || 4000);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[60] space-y-2 max-w-sm">
        {toasts.map((toast) => {
          const Icon = icons[toast.type] || icons.info;
          return (
            <div
              key={toast.id}
              className={`flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg animate-toast-in ${colors[toast.type] || colors.info}`}
            >
              <Icon size={18} className={`mt-0.5 flex-shrink-0 ${iconColors[toast.type] || iconColors.info}`} />
              <div className="flex-1 min-w-0">
                {toast.title && <p className="text-sm font-semibold text-slate-50">{toast.title}</p>}
                {toast.message && <p className="text-xs text-slate-400 mt-0.5">{toast.message}</p>}
              </div>
              <button onClick={() => removeToast(toast.id)} className="text-slate-500 hover:text-slate-300 flex-shrink-0">
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Return a no-op if used outside provider (backward compat)
    return { addToast: () => {}, removeToast: () => {} };
  }
  return context;
}

export default ToastProvider;
