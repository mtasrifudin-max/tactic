import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  message: string;
}

export interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const config = {
    success: {
      border: 'border-emerald-200 bg-white',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
      accent: 'border-l-4 border-l-emerald-500'
    },
    warning: {
      border: 'border-amber-200 bg-white',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
      accent: 'border-l-4 border-l-amber-500'
    },
    error: {
      border: 'border-rose-200 bg-white',
      icon: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />,
      accent: 'border-l-4 border-l-rose-500'
    },
    info: {
      border: 'border-blue-200 bg-white',
      icon: <Info className="w-4 h-4 text-[#0070C0] shrink-0" />,
      accent: 'border-l-4 border-l-[#0070C0]'
    }
  }[toast.type];

  return (
    <div
      className={`pointer-events-auto shadow-lg rounded-xl border p-3 flex items-start gap-2.5 animate-in slide-in-from-bottom-2 duration-150 ${config.border} ${config.accent}`}
    >
      <div className="mt-0.5">{config.icon}</div>
      <div className="flex-1 min-w-0 text-xs">
        {toast.title && <div className="font-bold text-[#172B4D] mb-0.5">{toast.title}</div>}
        <div className="text-slate-600 leading-relaxed">{toast.message}</div>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors cursor-pointer shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
