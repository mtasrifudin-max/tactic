import React from 'react';

export interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  iconBg?: string;
  valueColor?: string;
  onClick?: () => void;
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconBg = 'bg-blue-50 text-[#0070C0]',
  valueColor = 'text-[#172B4D]',
  onClick,
  className = ''
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200 rounded-xl p-4 shadow-xs transition-all ${
        onClick ? 'cursor-pointer hover:border-[#0070C0] hover:shadow-xs' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-500 truncate mr-2">{title}</span>
        {icon && (
          <div className={`p-2 rounded-lg shrink-0 ${iconBg}`}>
            {icon}
          </div>
        )}
      </div>

      <div className={`text-xl sm:text-2xl font-bold tabular-nums tracking-tight ${valueColor}`}>
        {value}
      </div>

      {subtitle && (
        <div className="text-[11px] text-slate-500 mt-1 truncate">
          {subtitle}
        </div>
      )}
    </div>
  );
};
