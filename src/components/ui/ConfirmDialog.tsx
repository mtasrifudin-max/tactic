import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, Info, AlertCircle } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false
}) => {
  const icon = {
    danger: <AlertTriangle className="w-5 h-5 text-rose-600" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-600" />,
    primary: <Info className="w-5 h-5 text-[#0070C0]" />
  }[variant];

  const iconBg = {
    danger: 'bg-rose-50 border-rose-100',
    warning: 'bg-amber-50 border-amber-100',
    primary: 'bg-blue-50 border-blue-100'
  }[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className={`p-2.5 rounded-xl border shrink-0 ${iconBg}`}>
            {icon}
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#172B4D]">{title}</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
