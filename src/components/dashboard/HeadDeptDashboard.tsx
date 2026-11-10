import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  Briefcase,
  CalendarCheck,
  AlertOctagon,
  Clock,
  AlertTriangle,
  Users,
  ChevronRight,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Layers,
  FileCheck2,
  ShieldCheck
} from 'lucide-react';
import { StatusBadge } from '../layout/StatusBadge';

export const HeadDeptDashboard: React.FC = () => {
  const {
    users,
    currentUser,
    scopedCustomers,
    scopedOpportunities,
    scopedActivities,
    scopedFollowUps,
    scopedPicas,
    contracts,
    managedDepartments,
    setActiveMenu,
    openCustomer360,
    openOpportunityDetail,
    openPicaDetail,
    setPicaSubTab,
    setMonitoringSubTab,
    openContractDetail
  } = useApp();

  const todayStr = '2026-10-05';

  // Format currency
  const formatIDR = (val: number) => {
    if (val >= 1_000_000_000) {
      return `IDR ${(val / 1_000_000_000).toFixed(1)} B`;
    }
    if (val >= 1_000_000) {
      return `IDR ${(val / 1_000_000).toFixed(0)} M`;
    }
    return `IDR ${val.toLocaleString('id-ID')}`;
  };

  // Top KPIs calculated from scoped department data
  const openOpps = scopedOpportunities.filter(o => o.stage !== 'Award' && o.stage !== 'Lost');
  const totalPipelineValue = openOpps.reduce((sum, o) => sum + o.potentialRevenue, 0);
  const totalOpenOppsCount = openOpps.length;
  
  // Activities This Month (October 2026)
  const activitiesThisMonth = scopedActivities.filter(a => a.date >= '2026-10-01' && a.date <= '2026-10-31').length;
  
  const openPicaCount = scopedPicas.filter(p => p.status === 'Open' || p.status === 'In Progress' || p.status === 'Waiting Verification').length;
  const overdueFollowUpCount = scopedFollowUps.filter(f => f.status === 'Overdue' || (f.dueDate < todayStr && f.status === 'Open')).length;
  const overduePicaCount = scopedPicas.filter(p => p.dueDate < todayStr && p.status !== 'Closed').length;
  const picasWaitingVerification = scopedPicas.filter(p => p.status === 'Waiting Verification');
  const contractsExpiringSoon = contracts.filter(c => c.contractStatus === 'Expiring Soon');

  // Pipeline by Stage
  const stages: Array<'Qualification' | 'Proposal' | 'Negotiation' | 'Award' | 'Lost'> = [
    'Qualification',
    'Proposal',
    'Negotiation',
    'Award',
    'Lost'
  ];

  const stageBreakdown = stages.map(stage => {
    const list = scopedOpportunities.filter(o => o.stage === stage);
    const value = list.reduce((sum, o) => sum + o.potentialRevenue, 0);
    return {
      stage,
      count: list.length,
      value
    };
  });

  // Department Team Members (excluding self if Head of Dept)
  const departmentTeam = users.filter(u => {
    if (currentUser.role === 'Super Admin') {
      return u.role === 'Business Development' || u.role === 'Key Account Management';
    }
    // Check matching department or role under commercial
    const uDept = (u.department || '').toLowerCase().trim();
    const inDept = managedDepartments.some(d => {
      const dLower = d.toLowerCase().trim();
      return dLower === uDept || uDept.includes(dLower) || dLower.includes(uDept);
    });
    const isCommercialTeam = (u.role === 'Business Development' || u.role === 'Key Account Management');
    return (inDept || isCommercialTeam) && u.id !== currentUser.id;
  });

  // Need Attention Items from scoped records:
  const overdueFollowUps = scopedFollowUps.filter(f => f.status === 'Overdue' || (f.dueDate < todayStr && f.status === 'Open'));
  const overduePicas = scopedPicas.filter(p => p.dueDate < todayStr && p.status !== 'Closed');
  
  // Stagnant Opportunities (no activity touchpoint in 10+ days)
  const stagnantOpps = openOpps.filter(o => {
    return o.lastActivityDate < '2026-09-25';
  });

  const departmentScopeLabel = currentUser.role === 'Super Admin'
    ? 'All Departments (Corporate System-Wide)'
    : (managedDepartments.length > 0 ? managedDepartments.join(' & ') : currentUser.department || 'Commercial Department');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#172B4D] tracking-tight">
              Commercial Control Tower
            </h1>
            <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Live Operations
            </span>
            <span className="text-[11px] font-semibold bg-blue-50 text-[#0070C0] px-2.5 py-0.5 rounded-full border border-blue-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0070C0]"></span>
              <span>Scope: {departmentScopeLabel}</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Executive monitoring across sales pipeline, daily activities, SLA adherence, and team performance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setActiveMenu('monitoring');
              setMonitoringSubTab('pipeline');
            }}
            className="px-3.5 py-2 bg-[#0070C0] text-white text-xs font-semibold rounded-lg hover:bg-[#005a9c] transition-colors shadow-xs cursor-pointer"
          >
            Open Monitoring Console →
          </button>
        </div>
      </div>

      {/* Compact Indicator: Contracts Expiring Soon for Head of Department */}
      {contractsExpiringSoon.length > 0 && (
        <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-950">
                  Contracts Expiring Soon ({contractsExpiringSoon.length})
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900">
                  Department Attention
                </span>
              </div>
              <p className="text-[11px] text-amber-800 line-clamp-1">
                {contractsExpiringSoon.map(c => `${c.contractTitle} (${c.expiryDate})`).join(' · ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => openContractDetail(contractsExpiringSoon[0].id)}
            className="text-xs font-bold text-amber-900 hover:text-amber-950 hover:underline flex items-center gap-1 shrink-0 self-end sm:self-auto cursor-pointer"
          >
            <span>Review Contract</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top 6 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* KPI 1: Total Pipeline */}
        <div 
          onClick={() => {
            setActiveMenu('monitoring');
            setMonitoringSubTab('pipeline');
          }}
          className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs cursor-pointer hover:border-blue-300 transition-colors"
        >
          <div className="text-[11px] font-semibold text-slate-500 mb-1">Total Pipeline</div>
          <div className="text-lg font-bold text-[#172B4D] tabular-nums truncate">
            {formatIDR(totalPipelineValue)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Active deal volume</div>
        </div>

        {/* KPI 2: Open Opportunities */}
        <div 
          onClick={() => setActiveMenu('pipeline')}
          className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs cursor-pointer hover:border-blue-300 transition-colors"
        >
          <div className="text-[11px] font-semibold text-slate-500 mb-1">Open Opportunities</div>
          <div className="text-lg font-bold text-[#0070C0] tabular-nums">
            {totalOpenOppsCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Active deals</div>
        </div>

        {/* KPI 3: Activities This Month */}
        <div 
          onClick={() => {
            setActiveMenu('monitoring');
            setMonitoringSubTab('activity');
          }}
          className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs cursor-pointer hover:border-slate-300 transition-colors"
        >
          <div className="text-[11px] font-semibold text-slate-500 mb-1">Activities This Month</div>
          <div className="text-lg font-bold text-slate-800 tabular-nums">
            {activitiesThisMonth}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">October touchpoints</div>
        </div>

        {/* KPI 4: Open PICA */}
        <div 
          onClick={() => setActiveMenu('pica')}
          className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs cursor-pointer hover:border-purple-300 transition-colors"
        >
          <div className="text-[11px] font-semibold text-slate-500 mb-1">Open PICA</div>
          <div className="text-lg font-bold text-purple-700 tabular-nums">
            {openPicaCount}
          </div>
          <div className="text-[10px] text-purple-600 mt-1">{picasWaitingVerification.length} wait verification</div>
        </div>

        {/* KPI 5: Overdue Follow-up */}
        <div 
          onClick={() => setActiveMenu('followup')}
          className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs cursor-pointer hover:border-rose-300 transition-colors"
        >
          <div className="text-[11px] font-semibold text-slate-500 mb-1">Overdue Follow-up</div>
          <div className={`text-lg font-bold tabular-nums ${overdueFollowUpCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
            {overdueFollowUpCount}
          </div>
          <div className="text-[10px] text-rose-600 mt-1">Requires intervention</div>
        </div>

        {/* KPI 6: Overdue PICA */}
        <div 
          onClick={() => {
            setActiveMenu('pica');
            setPicaSubTab('progress');
          }}
          className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs cursor-pointer hover:border-rose-300 transition-colors"
        >
          <div className="text-[11px] font-semibold text-slate-500 mb-1">Overdue PICA</div>
          <div className={`text-lg font-bold tabular-nums ${overduePicaCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
            {overduePicaCount}
          </div>
          <div className="text-[10px] text-rose-600 mt-1">Target date breached</div>
        </div>
      </div>

      {/* Grid: Pipeline Overview & Activity Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Overview */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#172B4D] uppercase tracking-wider">
                Pipeline Overview
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Stage distribution & commercial value breakdown</p>
            </div>
            <button
              onClick={() => {
                setActiveMenu('monitoring');
                setMonitoringSubTab('pipeline');
              }}
              className="text-xs font-semibold text-[#0070C0] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Detailed Pipeline</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {stageBreakdown.map(s => {
              const percent = totalPipelineValue > 0 ? Math.round((s.value / (totalPipelineValue || 1)) * 100) : 0;

              return (
                <div key={s.stage} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={s.stage} size="sm" />
                      <span className="text-slate-500 font-medium">({s.count} deals)</span>
                    </div>
                    <span className="font-bold text-[#172B4D] tabular-nums">
                      {formatIDR(s.value)}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        s.stage === 'Award' ? 'bg-emerald-500' :
                        s.stage === 'Negotiation' ? 'bg-amber-500' :
                        s.stage === 'Proposal' ? 'bg-[#0070C0]' :
                        s.stage === 'Qualification' ? 'bg-blue-400' : 'bg-slate-300'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(5, percent))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity Overview by User */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#172B4D] uppercase tracking-wider">
                Activity Overview by User
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Logged customer touchpoints per commercial team member</p>
            </div>
            <button
              onClick={() => {
                setActiveMenu('monitoring');
                setMonitoringSubTab('activity');
              }}
              className="text-xs font-semibold text-[#0070C0] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Activity Logs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {departmentTeam.map(u => {
              const userActivities = scopedActivities.filter(a => a.userId === u.id);
              const userVisits = userActivities.filter(a => a.activityType === 'Customer Visit' || a.activityType === 'Meeting');
              const userCalls = userActivities.filter(a => a.activityType === 'Call' || a.activityType === 'WhatsApp' || a.activityType === 'Email');

              return (
                <div key={u.id} className="p-3 border border-slate-100 rounded-lg hover:bg-slate-50/80 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#172B4D] text-white flex items-center justify-center text-[10px] font-bold">
                        {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#172B4D]">{u.name}</div>
                        <div className="text-[10px] text-slate-400">{u.role}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-[#0070C0] tabular-nums">
                        {userActivities.length} Activities
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Visits & Meetings:</span>
                      <span className="font-semibold text-slate-700">{userVisits.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Calls & Messages:</span>
                      <span className="font-semibold text-slate-700">{userCalls.length}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Need Attention Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <h2 className="text-sm font-bold text-[#172B4D] uppercase tracking-wider">
                Need Attention (Exceptions & Risk Matrix)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Items requiring immediate managerial review, escalation, or quality verification.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Overdue Follow-ups */}
          <div className="border border-rose-200 bg-rose-50/30 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-600" />
                Overdue Follow-up ({overdueFollowUps.length})
              </span>
            </div>
            {overdueFollowUps.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">No overdue follow-ups.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {overdueFollowUps.map(f => (
                  <div
                    key={f.id}
                    onClick={() => openCustomer360(f.customerId, 'activity')}
                    className="p-2.5 bg-white border border-rose-100 rounded-lg cursor-pointer hover:border-rose-300 text-xs transition-colors"
                  >
                    <div className="flex items-center justify-between font-semibold text-[#172B4D]">
                      <span>{f.customerName}</span>
                      <span className="text-[10px] text-rose-600 font-mono">Due: {f.dueDate}</span>
                    </div>
                    <p className="text-slate-600 mt-0.5 truncate">{f.actionText}</p>
                    <div className="text-[10px] text-slate-400 mt-1">Owner: {f.ownerName}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. PICA Awaiting Verification & Overdue */}
          <div className="border border-purple-200 bg-purple-50/30 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5 text-purple-600" />
                PICA Verification & Overdue ({picasWaitingVerification.length + overduePicas.length})
              </span>
              <button
                onClick={() => {
                  setActiveMenu('pica');
                  setPicaSubTab('verification');
                }}
                className="text-[11px] font-semibold text-purple-700 hover:underline cursor-pointer"
              >
                Verify →
              </button>
            </div>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {picasWaitingVerification.map(p => (
                <div
                  key={p.id}
                  onClick={() => openPicaDetail(p.id)}
                  className="p-2.5 bg-white border border-purple-100 rounded-lg cursor-pointer hover:border-purple-300 text-xs transition-colors"
                >
                  <div className="flex items-center justify-between font-semibold text-[#172B4D]">
                    <span>{p.customerName}</span>
                    <span className="text-[10px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-semibold">
                      Waiting Verification
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5 truncate">{p.issueTitle}</p>
                  <div className="text-[10px] text-slate-400 mt-1">PIC: {p.picName} · {p.picaNumber}</div>
                </div>
              ))}

              {overduePicas.map(p => (
                <div
                  key={p.id}
                  onClick={() => openPicaDetail(p.id)}
                  className="p-2.5 bg-white border border-rose-200 rounded-lg cursor-pointer hover:border-rose-400 text-xs transition-colors"
                >
                  <div className="flex items-center justify-between font-semibold text-[#172B4D]">
                    <span>{p.customerName}</span>
                    <span className="text-[10px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded font-semibold">
                      Overdue ({p.priority})
                    </span>
                  </div>
                  <p className="text-slate-600 mt-0.5 truncate">{p.issueTitle}</p>
                  <div className="text-[10px] text-slate-400 mt-1">PIC: {p.picName} · Due: {p.dueDate}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Opportunities Without Recent Activity (Stagnant 10+ days) */}
          <div className="border border-amber-200 bg-amber-50/30 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                Stagnant Deals ({stagnantOpps.length})
              </span>
              <button
                onClick={() => setActiveMenu('pipeline')}
                className="text-[11px] font-semibold text-amber-700 hover:underline cursor-pointer"
              >
                Pipeline →
              </button>
            </div>
            {stagnantOpps.length === 0 ? (
              <p className="text-xs text-slate-400 py-3 text-center">All open deals have recent touchpoints.</p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {stagnantOpps.map(o => (
                  <div
                    key={o.id}
                    onClick={() => openOpportunityDetail(o.id)}
                    className="p-2.5 bg-white border border-amber-100 rounded-lg cursor-pointer hover:border-amber-300 text-xs transition-colors"
                  >
                    <div className="flex items-center justify-between font-semibold text-[#172B4D]">
                      <span className="truncate mr-1">{o.opportunityName}</span>
                      <span className="text-[10px] text-amber-700 font-mono shrink-0">Last: {o.lastActivityDate}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-0.5">
                      <span>{o.customerName}</span>
                      <span className="font-bold text-[#0070C0]">{formatIDR(o.potentialRevenue)}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">Owner: {o.ownerName} · {o.stage}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Team Performance Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-[#172B4D] uppercase tracking-wider">
              Commercial Team Performance
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparative metrics across accounts, active deals, pipeline volume, and activity output.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-200">
              <tr>
                <th className="py-3 px-3">User</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3 text-right">Customers</th>
                <th className="py-3 px-3 text-right">Open Opportunities</th>
                <th className="py-3 px-3 text-right">Pipeline Value</th>
                <th className="py-3 px-3 text-right">Activities</th>
                <th className="py-3 px-3 text-right">Follow-ups</th>
                <th className="py-3 px-3 text-right">Open PICA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departmentTeam.map(u => {
                const userCustomers = scopedCustomers.filter(c => c.ownerId === u.id);
                const userOpps = scopedOpportunities.filter(o => o.ownerId === u.id && o.stage !== 'Award' && o.stage !== 'Lost');
                const userPipelineVal = userOpps.reduce((sum, o) => sum + o.potentialRevenue, 0);
                const userActs = scopedActivities.filter(a => a.userId === u.id);
                const userFolls = scopedFollowUps.filter(f => f.ownerId === u.id);
                const userPendingFoll = userFolls.filter(f => f.status === 'Open' || f.status === 'Overdue');
                const userOverdueFoll = userFolls.filter(f => f.status === 'Overdue');
                const userPicas = scopedPicas.filter(p => p.picId === u.id && p.status !== 'Closed');

                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-semibold text-[#172B4D] flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#172B4D] text-white flex items-center justify-center text-[10px] font-bold">
                        {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 font-medium">
                      {u.role}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-slate-700 tabular-nums">
                      {userCustomers.length}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-[#0070C0] tabular-nums">
                      {userOpps.length}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-[#172B4D] tabular-nums">
                      {formatIDR(userPipelineVal)}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-slate-700 tabular-nums">
                      {userActs.length}
                    </td>
                    <td className="py-3 px-3 text-right tabular-nums">
                      <span className="font-semibold text-slate-800">{userPendingFoll.length}</span>
                      {userOverdueFoll.length > 0 && (
                        <span className="text-rose-600 font-bold ml-1">({userOverdueFoll.length} overdue)</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-purple-700 tabular-nums">
                      {userPicas.length}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
