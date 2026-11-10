import React from 'react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  badge?: string;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  variant?: 'line' | 'segmented';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'segmented',
  className = ''
}) => {
  if (variant === 'line') {
    return (
      <div className={`flex items-center gap-4 border-b border-slate-200 ${className}`}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`pb-3 px-1 text-xs font-semibold transition-all relative flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'text-[#0070C0] border-b-2 border-[#0070C0]'
                  : 'text-slate-500 hover:text-[#172B4D]'
              }`}
            >
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold tabular-nums ${
                    isActive ? 'bg-blue-100 text-[#0070C0]' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium ${className}`}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              isActive
                ? 'bg-white text-[#172B4D] font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold tabular-nums ${
                  isActive ? 'bg-blue-50 text-[#0070C0]' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
