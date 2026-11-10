import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm', className = '' }) => {
  const norm = status.toLowerCase().trim();

  let bg = 'bg-slate-100 text-slate-700 border-slate-200';
  let dot = 'bg-slate-400';

  if (norm === 'active' || norm === 'won' || norm === 'award' || norm === 'verified' || norm === 'closed' || norm === 'completed') {
    bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    dot = 'bg-emerald-500';
  } else if (norm === 'planned' || norm === 'prospect' || norm === 'open' || norm === 'qualification' || norm === 'proposal' || norm === 'new') {
    bg = 'bg-blue-50 text-[#0070C0] border-blue-200';
    dot = 'bg-[#0070C0]';
  } else if (norm === 'in progress' || norm === 'negotiation' || norm === 'due soon' || norm === 'contacted' || norm === 'medium' || norm === 'expiring soon') {
    bg = 'bg-amber-50 text-amber-700 border-amber-200';
    dot = 'bg-amber-500';
  } else if (norm === 'overdue' || norm === 'critical' || norm === 'lost' || norm === 'high' || norm === 'expired') {
    bg = 'bg-rose-50 text-rose-700 border-rose-200';
    dot = 'bg-rose-500';
  } else if (norm === 'terminated') {
    bg = 'bg-rose-50/70 text-rose-600 border-rose-200 line-through decoration-rose-300';
    dot = 'bg-rose-400';
  } else if (norm === 'waiting verification') {
    bg = 'bg-purple-50 text-purple-700 border-purple-200';
    dot = 'bg-purple-500';
  } else if (norm === 'qualified') {
    bg = 'bg-teal-50 text-teal-700 border-teal-200';
    dot = 'bg-teal-500';
  } else if (norm === 'inactive' || norm === 'disqualified' || norm === 'cancelled' || norm === 'low' || norm === 'draft') {
    bg = 'bg-slate-100 text-slate-600 border-slate-200';
    dot = 'bg-slate-400';
  }

  const px = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border font-medium ${px} ${bg} ${className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} aria-hidden="true" />
      <span>{status}</span>
    </span>
  );
};
