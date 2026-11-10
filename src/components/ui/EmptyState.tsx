import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className = ''
}) => {
  return (
    <div className={`p-8 sm:p-12 text-center bg-white border border-slate-200 rounded-xl ${className}`}>
      {icon && (
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          {icon}
        </div>
      )}
      <h4 className="text-sm font-bold text-[#172B4D]">{title}</h4>
      {description && (
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {actionText && onAction && (
        <div className="mt-4">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};
