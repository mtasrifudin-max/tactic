import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Briefcase, 
  Clock, 
  AlertTriangle, 
  AlertCircle, 
  ChevronRight, 
  ArrowUpRight, 
  CheckCircle2, 
  Calendar,
  Building2
} from 'lucide-react';
import { StatusBadge } from '../layout/StatusBadge';

export const BdKamDashboard: React.FC = () => {
  const {
    currentUser,
    opportunities,
    followUps,
    picas,
    activities,
    contracts,
    customers,
    setActiveMenu,
    openCustomer360,
    openOpportunityDetail,
    openPicaDetail,
    completeFollowUp,
    openContractDetail
  } = useApp();

  const todayStr = '2026-10-05';

  // Ownership filtering: BD and KAM focus on their owned records
  const myOpps = opportunities.filter(o => o.ownerId === currentUser.id);
  const myActiveOpps = myOpps.filter(o => o.stage !== 'Award' && o.stage !== 'Lost');
  const myPipelineValue = myActiveOpps.reduce((sum, o) => sum + o.potentialRevenue, 0);

  const myFollowUps = followUps.filter(f => f.ownerId === currentUser.id);
  const myFollowUpToday = myFollowUps.filter(f => f.dueDate === todayStr && f.status !== 'Completed');
  const myFollowUpOverdue = myFollowUps.filter(f => (f.status === 'Overdue' || (f.dueDate < todayStr && f.status === 'Open')));
  const myFollowUpUpcoming = myFollowUps.filter(f => f.dueDate > todayStr && f.status === 'Open');

  const myPicas = picas.filter(p => p.picId === currentUser.id);
  const myOpenPicas = myPicas.filter(p => p.status === 'Open' || p.status === 'In Progress');
  const myOverduePicas = myPicas.filter(p => p.dueDate < todayStr && p.status !== 'Closed');
  const myDueTodayPicas = myPicas.filter(p => p.dueDate === todayStr && p.status !== 'Closed');

  const totalOverdue = myFollowUpOverdue.length + myOverduePicas.length;

  // Compact indicator for KAM / BD: Contracts Expiring Soon
  const myCustomerIds = customers.filter(c => c.ownerId === currentUser.id).map(c => c.id);
  const myContractsExpiringSoon = contracts.filter(c => 
    (myCustomerIds.includes(c.customerId) || c.createdBy === currentUser.name || c.contractPic.toLowerCase().includes(currentUser.name.toLowerCase())) &&
    c.contractStatus === 'Expiring Soon'
  );

  // Format currency in Billions / Millions IDR
  const formatIDR = (val: number) => {
    if (val >= 1_000_000_000) {
      return `IDR ${(val / 1_000_000_000).toFixed(1)} B`;
    }
    if (val >= 1_000_000) {
      return `IDR ${(val / 1_000_000).toFixed(0)} M`;
    }
    return `IDR ${val.toLocaleString('id-ID')}`;
  };

  // Pipeline by stage
  const stages: Array<'Qualification' | 'Proposal' | 'Negotiation' | 'Award'> = ['Qualification', 'Proposal', 'Negotiation', 'Award'];
  const stageStats = stages.map(stage => {
    const oppsInStage = myOpps.filter(o => o.stage === stage);
    const value = oppsInStage.reduce((sum, o) => sum + o.potentialRevenue, 0);
    return {
      stage,
      count: oppsInStage.length,
      value
    };
  });

  return (
    <div className="space-y-6">
      {/* Header Greeting */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#172B4D] tracking-tight">
            Good Morning, {currentUser.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Here's what needs your attention today. Record daily activities, resolve follow-ups, and keep PICA on track.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs bg-blue-50 text-[#0070C0] font-semibold px-3 py-1.5 rounded-lg border border-blue-100 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#0070C0] animate-pulse" />
            {currentUser.role} Focus: {currentUser.role === 'Business Development' ? 'Grow New Business' : 'Grow Existing Accounts'}
          </span>
        </div>
      </div>

      {/* Compact Indicator: Contracts Expiring Soon (for KAM/BD) */}
      {myContractsExpiringSoon.length > 0 && (
        <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-950">
                  Contracts Expiring Soon ({myContractsExpiringSoon.length})
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900">
                  Renewal Attention
                </span>
              </div>
              <p className="text-[11px] text-amber-800 line-clamp-1">
                {myContractsExpiringSoon.map(c => `${c.contractTitle} (${c.expiryDate})`).join(' · ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => openContractDetail(myContractsExpiringSoon[0].id)}
            className="text-xs font-bold text-amber-900 hover:text-amber-950 hover:underline flex items-center gap-1 shrink-0 self-end sm:self-auto cursor-pointer"
          >
            <span>Review Contract</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: My Pipeline Value */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">My Pipeline Value</span>
            <div className="p-2 bg-blue-50 text-[#0070C0] rounded-lg">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-[#172B4D] tabular-nums">
            {formatIDR(myPipelineValue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {myActiveOpps.length} active opportunities
          </div>
        </div>

        {/* KPI 2: Follow-up Today */}
        <div 
          onClick={() => setActiveMenu('followup')}
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs cursor-pointer hover:border-amber-300 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Follow-up Today</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-[#172B4D] tabular-nums">
            {myFollowUpToday.length}
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">
            Scheduled for completion today
          </div>
        </div>

        {/* KPI 3: Open PICA */}
        <div 
          onClick={() => setActiveMenu('pica')}
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs cursor-pointer hover:border-blue-300 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Open PICA</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-bold text-[#172B4D] tabular-nums">
            {myOpenPicas.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Active corrective action tasks
          </div>
        </div>

        {/* KPI 4: Overdue */}
        <div 
          onClick={() => setActiveMenu('followup')}
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs cursor-pointer hover:border-rose-300 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Overdue Actions</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-xl font-bold tabular-nums ${totalOverdue > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
            {totalOverdue}
          </div>
          <div className="text-[11px] text-rose-600 font-medium mt-1">
            {myFollowUpOverdue.length} follow-ups · {myOverduePicas.length} PICA
          </div>
        </div>
      </div>

      {/* Main Grid: My Action & My Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: My Action Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#172B4D] uppercase tracking-wider">
              My Action Queue
            </h2>
            <button
              onClick={() => setActiveMenu('followup')}
              className="text-xs font-semibold text-[#0070C0] hover:underline flex items-center gap-1"
            >
              <span>View all follow-ups</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {/* OVERDUE Follow-ups */}
            {myFollowUpOverdue.map(f => (
              <div
                key={f.id}
                className="bg-white border-l-4 border-l-rose-500 border border-slate-200 rounded-lg p-3.5 shadow-xs hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div 
                  className="cursor-pointer flex-1"
                  onClick={() => openCustomer360(f.customerId, 'activity')}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      Overdue
                    </span>
                    <span className="font-semibold text-xs text-[#172B4D]">{f.customerName}</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">{f.actionText}</p>
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" />
                    <span>Due: {f.dueDate} {f.dueTime ? `at ${f.dueTime}` : ''}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => completeFollowUp(f.id)}
                    className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Complete</span>
                  </button>
                </div>
              </div>
            ))}

            {/* Overdue PICA */}
            {myOverduePicas.map(p => (
              <div
                key={p.id}
                onClick={() => openPicaDetail(p.id)}
                className="bg-white border-l-4 border-l-rose-500 border border-slate-200 rounded-lg p-3.5 shadow-xs hover:shadow-md transition-shadow cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      PICA Overdue
                    </span>
                    <span className="font-semibold text-xs text-[#172B4D]">{p.customerName}</span>
                    <span className="text-[11px] font-mono text-slate-400">{p.picaNumber}</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">{p.issueTitle}</p>
                  <p className="text-[11px] text-rose-600 mt-1">Due: {p.dueDate} · Priority: {p.priority}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
              </div>
            ))}

            {/* TODAY Follow-ups */}
            {myFollowUpToday.map(f => (
              <div
                key={f.id}
                className="bg-white border-l-4 border-l-amber-500 border border-slate-200 rounded-lg p-3.5 shadow-xs hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div 
                  className="cursor-pointer flex-1"
                  onClick={() => openCustomer360(f.customerId, 'activity')}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Today
                    </span>
                    <span className="font-semibold text-xs text-[#172B4D]">{f.customerName}</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">{f.actionText}</p>
                  <p className="text-[11px] text-amber-700 mt-1 flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" />
                    <span>{f.dueTime ? `Today at ${f.dueTime}` : 'Today'}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => completeFollowUp(f.id)}
                    className="px-3 py-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Complete</span>
                  </button>
                </div>
              </div>
            ))}

            {/* TODAY Due PICA */}
            {myDueTodayPicas.map(p => (
              <div
                key={p.id}
                onClick={() => openPicaDetail(p.id)}
                className="bg-white border-l-4 border-l-amber-500 border border-slate-200 rounded-lg p-3.5 shadow-xs hover:shadow-md transition-shadow cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      PICA Due Today
                    </span>
                    <span className="font-semibold text-xs text-[#172B4D]">{p.customerName}</span>
                    <span className="text-[11px] font-mono text-slate-400">{p.picaNumber}</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">{p.issueTitle}</p>
                  <p className="text-[11px] text-amber-700 mt-1">Due today · Priority: {p.priority}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
              </div>
            ))}

            {/* UPCOMING Activity / Follow-up */}
            {myFollowUpUpcoming.slice(0, 3).map(f => (
              <div
                key={f.id}
                onClick={() => openCustomer360(f.customerId, 'activity')}
                className="bg-white border-l-4 border-l-blue-500 border border-slate-200 rounded-lg p-3.5 shadow-xs hover:shadow-md transition-shadow cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#0070C0] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Upcoming
                    </span>
                    <span className="font-semibold text-xs text-[#172B4D]">{f.customerName}</span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">{f.actionText}</p>
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Scheduled: {f.dueDate}</span>
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
              </div>
            ))}

            {myFollowUpOverdue.length === 0 && myFollowUpToday.length === 0 && myFollowUpUpcoming.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                All actions completed! No overdue or pending follow-ups for your account.
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: My Pipeline Compact Summary */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#172B4D] uppercase tracking-wider">
              My Pipeline Summary
            </h2>
            <button
              onClick={() => setActiveMenu('pipeline')}
              className="text-xs font-semibold text-[#0070C0] hover:underline flex items-center gap-1"
            >
              <span>Full Pipeline</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            {stageStats.map(s => (
              <div 
                key={s.stage}
                onClick={() => setActiveMenu('pipeline')}
                className="p-3 rounded-lg border border-slate-100 hover:bg-slate-50/80 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-[#172B4D]">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={s.stage} size="sm" />
                    <span className="text-slate-500 font-normal">({s.count} deals)</span>
                  </div>
                  <span className="tabular-nums font-bold text-[#172B4D]">
                    {formatIDR(s.value)}
                  </span>
                </div>
              </div>
            ))}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500">Total Active Pipeline</span>
              <span className="font-bold text-[#0070C0] tabular-nums text-sm">
                {formatIDR(myPipelineValue)}
              </span>
            </div>

            <button
              onClick={() => setActiveMenu('pipeline')}
              className="w-full mt-2 py-2 text-xs font-semibold text-[#0070C0] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
            >
              Open Pipeline Kanban Board →
            </button>
          </div>

          {/* Quick Customers Owned */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
                My Accounts ({myOpps.length})
              </h3>
              <button
                onClick={() => setActiveMenu('customer-list')}
                className="text-[11px] font-semibold text-[#0070C0] hover:underline"
              >
                View all
              </button>
            </div>
            <div className="space-y-2">
              {myActiveOpps.slice(0, 3).map(o => (
                <div
                  key={o.id}
                  onClick={() => openCustomer360(o.customerId)}
                  className="p-2 rounded border border-slate-100 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs"
                >
                  <div className="truncate mr-2">
                    <div className="font-medium text-[#172B4D] truncate">{o.customerName}</div>
                    <div className="text-[11px] text-slate-400 truncate">{o.opportunityName}</div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
