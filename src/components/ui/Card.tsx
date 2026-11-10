import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  borderHover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  action,
  padding = 'md',
  borderHover = false,
  className = '',
  ...props
}) => {
  const paddingClass = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-5',
    lg: 'p-6 sm:p-7'
  }[padding];

  return (
    <div
      className={`bg-white border border-slate-200 rounded-xl shadow-xs transition-all ${
        borderHover ? 'hover:border-[#0070C0] hover:shadow-md cursor-pointer' : ''
      } ${className}`}
      {...props}
    >
      {(title || action) && (
        <div className="px-4 py-3.5 sm:px-5 border-b border-slate-100 flex items-center justify-between gap-3">
          <div>
            {title && <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">{title}</h3>}
            {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={paddingClass}>{children}</div>
    </div>
  );
};
