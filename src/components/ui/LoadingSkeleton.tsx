import React from 'react';

export interface LoadingSkeletonProps {
  lines?: number;
  className?: string;
  type?: 'card' | 'table-row' | 'lines';
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  lines = 3,
  className = '',
  type = 'lines'
}) => {
  if (type === 'card') {
    return (
      <div className={`p-5 bg-white border border-slate-200 rounded-xl space-y-3 animate-pulse ${className}`}>
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="h-7 bg-slate-200 rounded w-2/3" />
        <div className="h-3 bg-slate-100 rounded w-1/2" />
      </div>
    );
  }

  if (type === 'table-row') {
    return (
      <div className={`space-y-2 animate-pulse ${className}`}>
        {Array.from({ length: lines }).map((_, idx) => (
          <div key={idx} className="h-12 bg-slate-100 rounded-lg flex items-center px-4 gap-4">
            <div className="h-4 bg-slate-200 rounded w-1/4" />
            <div className="h-4 bg-slate-200 rounded w-1/6" />
            <div className="h-4 bg-slate-200 rounded w-1/6" />
            <div className="h-4 bg-slate-200 rounded w-1/5 ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-2 animate-pulse ${className}`}>
      {Array.from({ length: lines }).map((_, idx) => (
        <div
          key={idx}
          className="h-3.5 bg-slate-200 rounded"
          style={{ width: `${Math.max(40, 100 - idx * 15)}%` }}
        />
      ))}
    </div>
  );
};
