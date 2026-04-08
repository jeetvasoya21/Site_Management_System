/**
 * ConfirmDialog Component
 * Modal confirmation for destructive actions
 */

import { AlertTriangle, X } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  variant = 'danger',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-w-md w-full animate-scale-in">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-lg ${variant === 'danger' ? 'bg-rose-500/10' : 'bg-amber-500/10'}`}>
              <AlertTriangle size={24} className={variant === 'danger' ? 'text-rose-500' : 'text-amber-500'} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-50">{title}</h3>
              <p className="text-sm text-slate-400 mt-1">{message}</p>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={onClose} className="btn-secondary">
              {cancelLabel}
            </button>
            <button
              onClick={() => { onConfirm(); onClose(); }}
              className={variant === 'danger' ? 'btn-danger' : 'btn-primary'}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
