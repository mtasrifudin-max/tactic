import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ActivityType, OpportunityStage, PicaPriority, PicaStatus } from '../../types';
import {
  CalendarCheck,
  GitBranch,
  AlertOctagon,
  Filter,
  Search,
  Building2,
  Clock,
  AlertTriangle,
  Users,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Briefcase,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { StatusBadge } from '../layout/StatusBadge';
import { Button } from '../ui/Button';

export const MonitoringView: React.FC = () => {
  const {
    monitoringSubTab,
    setMonitoringSubTab,
    users,
    scopedCustomers: customers,
    scopedActivities: activities,
    scopedOpportunities: opportunities,
    scopedFollowUps: followUps,
    scopedPicas: picas,
    managedDepartments,
    currentUser,
    setActiveMenu,
    openCustomer360,
    openOpportunityDetail,
    openPicaDetail
  } = useApp();

  const todayStr = '2026-10-05';

  // Access check: Only Head Department & Super Admin
  const canAccessMonitoring = currentUser.role === 'Head of Department' || currentUser.role === 'Super Admin';

  const departmentScopeLabel = currentUser.role === 'Super Admin'
    ? 'All Departments (Corporate System-Wide)'
    : (managedDepartments.length > 0 ? managedDepartments.join(' & ') : currentUser.department || 'Commercial Department');

  // Currency Formatter
  const formatIDR = (val: number) => {
    if (val >= 1_000_000_000) {
      return `IDR ${(val / 1_000_000_000).toFixed(1)} B`;
    }
    if (val >= 1_000_000) {
      return `IDR ${(val / 1_000_000).toFixed(0)} M`;
    }
    return `IDR ${val.toLocaleString('id-ID')}`;
  };

  // -------------------------------------------------------------
  // 1. ACTIVITY MONITORING STATE & FILTERS
  // -------------------------------------------------------------
  const [actStartDate, setActStartDate] = useState('');
  const [actEndDate, setActEndDate] = useState('');
  const [actUserFilter, setActUserFilter] = useState('All');
  const [actRoleFilter, setActRoleFilter] = useState('All');
  const [actCustomerFilter, setActCustomerFilter] = useState('All');
  const [actTypeFilter, setActTypeFilter] = useState('All');
  const [actSearch, setActSearch] = useState('');

  const activityTypes: ActivityType[] = [
    'Customer Visit',
    'Meeting',
    'Call',
    'Email',
    'WhatsApp',
    'Presentation',
    'Follow-up',
    'Negotiation',
    'Internal Discussion',
    'Other'
  ];

  const filteredActivities = useMemo(() => {
    return activities.filter(a => {
      if (actStartDate && a.date < actStartDate) return false;
      if (actEndDate && a.date > actEndDate) return false;
      if (actUserFilter !== 'All' && a.userId !== actUserFilter) return false;
      if (actCustomerFilter !== 'All' && a.customerId !== actCustomerFilter) return false;
      if (actTypeFilter !== 'All' && a.activityType !== actTypeFilter) return false;

      if (actRoleFilter !== 'All') {
        const userObj = users.find(u => u.id === a.userId);
        if (userObj && userObj.role !== actRoleFilter) return false;
      }

      if (actSearch) {
        const q = actSearch.toLowerCase().trim();
        const match =
          a.subject.toLowerCase().includes(q) ||
          a.customerName.toLowerCase().includes(q) ||
          a.userName.toLowerCase().includes(q) ||
          (a.result && a.result.toLowerCase().includes(q)) ||
          (a.nextAction && a.nextAction.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [activities, actStartDate, actEndDate, actUserFilter, actRoleFilter, actCustomerFilter, actTypeFilter, actSearch, users]);

  // Activity Top Summaries
  const actTotalCount = filteredActivities.length;
  const actVisitsCount = filteredActivities.filter(a => a.activityType === 'Customer Visit').length;
  const actMeetingsCount = filteredActivities.filter(a => a.activityType === 'Meeting' || a.activityType === 'Presentation').length;
  const actFollowUpsCount = filteredActivities.filter(a => !!a.nextAction).length;
  const overdueFollowUpsCount = followUps.filter(f => f.status === 'Overdue' || (f.dueDate < todayStr && f.status === 'Open')).length;

  // -------------------------------------------------------------
  // 2. PIPELINE MONITORING STATE & FILTERS
  // -------------------------------------------------------------
  const [pipeOwnerFilter, setPipeOwnerFilter] = useState('All');
  const [pipeCustomerFilter, setPipeCustomerFilter] = useState('All');
  const [pipeStageFilter, setPipeStageFilter] = useState('All');
  const [pipeServiceFilter, setPipeServiceFilter] = useState('All');
  const [pipeTargetClosingFilter, setPipeTargetClosingFilter] = useState('');
  const [pipeSearch, setPipeSearch] = useState('');

  const servicesList = useMemo(() => {
    const set = new Set<string>();
    opportunities.forEach(o => {
      if (o.service) set.add(o.service);
    });
    return Array.from(set);
  }, [opportunities]);

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(o => {
      if (pipeOwnerFilter !== 'All' && o.ownerId !== pipeOwnerFilter) return false;
      if (pipeCustomerFilter !== 'All' && o.customerId !== pipeCustomerFilter) return false;
      if (pipeStageFilter !== 'All' && o.stage !== pipeStageFilter) return false;
      if (pipeServiceFilter !== 'All' && o.service !== pipeServiceFilter) return false;
      if (pipeTargetClosingFilter && o.targetClosingDate > pipeTargetClosingFilter) return false;

      if (pipeSearch) {
        const q = pipeSearch.toLowerCase().trim();
        const match =
          o.opportunityName.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.ownerName.toLowerCase().includes(q) ||
          o.service.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [opportunities, pipeOwnerFilter, pipeCustomerFilter, pipeStageFilter, pipeServiceFilter, pipeTargetClosingFilter, pipeSearch]);

  // Pipeline Top KPIs
  const openOpportunities = filteredOpportunities.filter(o => o.stage !== 'Award' && o.stage !== 'Lost');
  const pipeTotalValue = openOpportunities.reduce((sum, o) => sum + o.potentialRevenue, 0);
  const pipeOpenCount = openOpportunities.length;

  const pipeQualValue = filteredOpportunities.filter(o => o.stage === 'Qualification').reduce((sum, o) => sum + o.potentialRevenue, 0);
  const pipePropValue = filteredOpportunities.filter(o => o.stage === 'Proposal').reduce((sum, o) => sum + o.potentialRevenue, 0);
  const pipeNegoValue = filteredOpportunities.filter(o => o.stage === 'Negotiation').reduce((sum, o) => sum + o.potentialRevenue, 0);
  const pipeAwardValue = filteredOpportunities.filter(o => o.stage === 'Award').reduce((sum, o) => sum + o.potentialRevenue, 0);

  // -------------------------------------------------------------
  // 3. PICA MONITORING STATE & FILTERS
  // -------------------------------------------------------------
  const [picaCustomerFilter, setPicaCustomerFilter] = useState('All');
  const [picaPicFilter, setPicaPicFilter] = useState('All');
  const [picaPriorityFilter, setPicaPriorityFilter] = useState('All');
  const [picaStatusFilter, setPicaStatusFilter] = useState('All');
  const [picaDueDateFilter, setPicaDueDateFilter] = useState('');
  const [picaSearch, setPicaSearch] = useState('');

  const filteredPicas = useMemo(() => {
    return picas.filter(p => {
      if (picaCustomerFilter !== 'All' && p.customerId !== picaCustomerFilter) return false;
      if (picaPicFilter !== 'All' && p.picId !== picaPicFilter) return false;
      if (picaPriorityFilter !== 'All' && p.priority !== picaPriorityFilter) return false;
      if (picaStatusFilter !== 'All' && p.status !== picaStatusFilter) return false;
      if (picaDueDateFilter && p.dueDate !== picaDueDateFilter) return false;

      if (picaSearch) {
        const q = picaSearch.toLowerCase().trim();
        const match =
          p.issueTitle.toLowerCase().includes(q) ||
          p.customerName.toLowerCase().includes(q) ||
          p.picaNumber.toLowerCase().includes(q) ||
          p.picName.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [picas, picaCustomerFilter, picaPicFilter, picaPriorityFilter, picaStatusFilter, picaDueDateFilter, picaSearch]);

  // PICA Top Summaries
  const picaOpenCount = filteredPicas.filter(p => p.status === 'Open').length;
  const picaInProgressCount = filteredPicas.filter(p => p.status === 'In Progress').length;
  const picaWaitingVerifCount = filteredPicas.filter(p => p.status === 'Waiting Verification').length;
  const picaOverdueCount = filteredPicas.filter(p => p.dueDate < todayStr && p.status !== 'Closed').length;
  const picaClosedCount = filteredPicas.filter(p => p.status === 'Closed').length;

  // -------------------------------------------------------------
  // ACCESS RESTRICTION SCREEN
  // -------------------------------------------------------------
  if (!canAccessMonitoring) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-xl mx-auto my-12 space-y-4 shadow-sm">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-[#172B4D]">Management Access Required</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The Monitoring Console is restricted to <strong>Head of Department</strong> and <strong>Super Admin</strong> roles for managerial oversight and team governance.
          </p>
        </div>
        <div className="pt-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => setActiveMenu('dashboard')}
          >
            Return to Commercial Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-[#172B4D] tracking-tight">
              Management Monitoring
            </h1>
            <span className="text-xs font-semibold text-[#0070C0] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
              Operational Visibility & Control
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Executive control tower across commercial team activities, sales pipeline velocity, and customer issue resolution.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <span className="text-xs bg-blue-50 text-[#0070C0] px-3 py-1.5 rounded-lg border border-blue-200 font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0070C0]"></span>
            <span>Scope: {departmentScopeLabel}</span>
          </span>
          <span className="text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 font-medium">
            Authorized: <strong>{currentUser.name}</strong> ({currentUser.role})
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl shadow-xs overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setMonitoringSubTab('activity')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
            monitoringSubTab === 'activity'
              ? 'bg-[#0070C0] text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>Activity Monitoring</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            monitoringSubTab === 'activity' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {activities.length}
          </span>
        </button>

        <button
          onClick={() => setMonitoringSubTab('pipeline')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
            monitoringSubTab === 'pipeline'
              ? 'bg-[#0070C0] text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>Pipeline Monitoring</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            monitoringSubTab === 'pipeline' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {opportunities.length}
          </span>
        </button>

        <button
          onClick={() => setMonitoringSubTab('pica')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
            monitoringSubTab === 'pica'
              ? 'bg-[#0070C0] text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>PICA Monitoring</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            monitoringSubTab === 'pica' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {picas.length}
          </span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* 1. ACTIVITY MONITORING SUBPAGE                           */}
      {/* ========================================================= */}
      {monitoringSubTab === 'activity' && (
        <div className="space-y-4">
          {/* Top Summaries (KPIs) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Activities</span>
              <div className="text-xl font-bold text-[#172B4D] tabular-nums mt-1">{actTotalCount}</div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Logged commercial touchpoints</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Customer Visits</span>
              <div className="text-xl font-bold text-[#0070C0] tabular-nums mt-1">{actVisitsCount}</div>
              <span className="text-[10px] text-blue-600 mt-0.5 block">On-site client visits</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Meetings</span>
              <div className="text-xl font-bold text-slate-800 tabular-nums mt-1">{actMeetingsCount}</div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Presentations & discussions</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Follow-ups</span>
              <div className="text-xl font-bold text-amber-700 tabular-nums mt-1">{actFollowUpsCount}</div>
              <span className="text-[10px] text-amber-700 mt-0.5 block">Generated action items</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Overdue Follow-ups</span>
              <div className={`text-xl font-bold tabular-nums mt-1 ${overdueFollowUpsCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                {overdueFollowUpsCount}
              </div>
              <span className="text-[10px] text-rose-600 mt-0.5 block font-medium">Requires management push</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 text-slate-400">
                <Filter className="w-3.5 h-3.5" />
                <span className="font-semibold text-[11px] uppercase tracking-wider">Filters:</span>
              </div>

              {/* Date Range */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md px-2 py-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="date"
                  value={actStartDate}
                  onChange={(e) => setActStartDate(e.target.value)}
                  className="text-xs text-slate-700 focus:outline-none bg-transparent cursor-pointer"
                  title="Start Date"
                />
                <span className="text-slate-400">to</span>
                <input
                  type="date"
                  value={actEndDate}
                  onChange={(e) => setActEndDate(e.target.value)}
                  className="text-xs text-slate-700 focus:outline-none bg-transparent cursor-pointer"
                  title="End Date"
                />
              </div>

              {/* User Filter */}
              <select
                value={actUserFilter}
                onChange={(e) => setActUserFilter(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:border-[#0070C0] cursor-pointer max-w-[140px]"
              >
                <option value="All">All Commercial Reps</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>

              {/* Role Filter */}
              <select
                value={actRoleFilter}
                onChange={(e) => setActRoleFilter(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:border-[#0070C0] cursor-pointer"
              >
                <option value="All">All Roles</option>
                <option value="Business Development">Business Development</option>
                <option value="Key Account Management">Key Account Management</option>
              </select>

              {/* Customer Filter */}
              <select
                value={actCustomerFilter}
                onChange={(e) => setActCustomerFilter(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:border-[#0070C0] cursor-pointer max-w-[140px]"
              >
                <option value="All">All Customers</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              {/* Type Filter */}
              <select
                value={actTypeFilter}
                onChange={(e) => setActTypeFilter(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:border-[#0070C0] cursor-pointer"
              >
                <option value="All">All Activity Types</option>
                {activityTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>

              {(actStartDate || actEndDate || actUserFilter !== 'All' || actRoleFilter !== 'All' || actCustomerFilter !== 'All' || actTypeFilter !== 'All' || actSearch) && (
                <button
                  onClick={() => {
                    setActStartDate('');
                    setActEndDate('');
                    setActUserFilter('All');
                    setActRoleFilter('All');
                    setActCustomerFilter('All');
                    setActTypeFilter('All');
                    setActSearch('');
                  }}
                  className="text-xs text-rose-600 hover:underline font-medium cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={actSearch}
                onChange={(e) => setActSearch(e.target.value)}
                placeholder="Search subject, result, next action..."
                className="w-full pl-9 pr-4 py-1.5 text-xs text-[#172B4D] bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#0070C0]"
              />
            </div>
          </div>

          {/* Activity Monitoring Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-3">User</th>
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Result</th>
                    <th className="py-3 px-3">Next Action</th>
                    <th className="py-3 px-3">Follow-up</th>
                    <th className="py-3 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredActivities.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        <CalendarCheck className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        No commercial activities matching the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredActivities.map(act => {
                      const hasFollowUp = !!(act.nextAction && act.nextFollowUpDate);
                      const isFollOverdue = hasFollowUp && act.nextFollowUpDate! < todayStr;

                      return (
                        <tr
                          key={act.id}
                          onClick={() => openCustomer360(act.customerId, 'activity')}
                          className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                        >
                          <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                            {act.date} <span className="text-[10px] text-slate-400 font-normal">{act.time}</span>
                          </td>
                          <td className="py-3.5 px-3 font-normal text-[#172B4D] whitespace-nowrap">
                            {act.userName}
                          </td>
                          <td className="py-3.5 px-3 font-normal text-[#0070C0] hover:underline whitespace-nowrap">
                            {act.customerName}
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <span className="inline-block px-2 py-0.5 bg-blue-50 text-[#0070C0] font-normal rounded text-[11px] border border-blue-100">
                              {act.activityType}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 max-w-xs font-normal text-slate-800">
                            <div className="truncate" title={act.subject}>{act.subject}</div>
                          </td>
                          <td className="py-3.5 px-4 max-w-xs text-slate-600 text-[11px]">
                            <div className="truncate" title={act.result || 'No result logged'}>
                              {act.result || '—'}
                            </div>
                          </td>
                          <td className="py-3.5 px-3 max-w-xs">
                            {act.nextAction ? (
                              <span className="text-amber-800 font-normal truncate block" title={act.nextAction}>
                                {act.nextAction}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-normal">—</span>
                            )}
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            {act.nextFollowUpDate ? (
                              <span className={`font-mono ${isFollOverdue ? 'text-rose-600 font-normal' : 'text-slate-600'}`}>
                                {act.nextFollowUpDate}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-normal">—</span>
                            )}
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            {hasFollowUp ? (
                              <StatusBadge status={isFollOverdue ? 'Overdue' : 'Open'} size="sm" />
                            ) : (
                              <span className="text-[11px] font-normal text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                Logged
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. PIPELINE MONITORING SUBPAGE                           */}
      {/* ========================================================= */}
      {monitoringSubTab === 'pipeline' && (
        <div className="space-y-4">
          {/* Top KPI Cards (Required: Total Pipeline Value, Open Opps, Qualification, Proposal, Negotiation, Award) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Pipeline</span>
              <div className="text-lg font-bold text-[#172B4D] tabular-nums mt-1 truncate">
                {formatIDR(pipeTotalValue)}
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Active open deals</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Open Deals</span>
              <div className="text-lg font-bold text-[#0070C0] tabular-nums mt-1">
                {pipeOpenCount}
              </div>
              <span className="text-[10px] text-blue-600 mt-0.5 block">In active stages</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Qualification</span>
              <div className="text-base font-bold text-slate-800 tabular-nums mt-1 truncate">
                {formatIDR(pipeQualValue)}
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Stage 1 (25% prob)</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Proposal</span>
              <div className="text-base font-bold text-slate-800 tabular-nums mt-1 truncate">
                {formatIDR(pipePropValue)}
              </div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Stage 2 (50% prob)</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Negotiation</span>
              <div className="text-base font-bold text-amber-700 tabular-nums mt-1 truncate">
                {formatIDR(pipeNegoValue)}
              </div>
              <span className="text-[10px] text-amber-700 mt-0.5 block">Stage 3 (75% prob)</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Award (Won)</span>
              <div className="text-base font-bold text-emerald-700 tabular-nums mt-1 truncate">
                {formatIDR(pipeAwardValue)}
              </div>
              <span className="text-[10px] text-emerald-700 mt-0.5 block">Closed won revenue</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 text-slate-400">
                <Filter className="w-3.5 h-3.5" />
                <span className="font-semibold text-[11px] uppercase tracking-wider">Filters:</span>
              </div>

              {/* Owner Filter */}
              <select
                value={pipeOwnerFilter}
                onChange={(e) => setPipeOwnerFilter(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:border-[#0070C0] cursor-pointer max-w-[140px]"
              >
                <option value="All">All Deal Owners</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>

              {/* Customer Filter */}
              <select
                value={pipeCustomerFilter}
                onChange={(e) => setPipeCustomerFilter(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:border-[#0070C0] cursor-pointer max-w-[150px]"
              >
                <option value="All">All Customers</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              {/* Stage Filter */}
              <select
                value={pipeStageFilter}
                onChange={(e) => setPipeStageFilter(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:border-[#0070C0] cursor-pointer"
              >
                <option value="All">All Stages</option>
                <option value="Qualification">Qualification</option>
                <option value="Proposal">Proposal</option>
                <option value="Negotiation">Negotiation</option>
                <option value="Award">Award</option>
                <option value="Lost">Lost</option>
              </select>

              {/* Service Filter */}
              <select
                value={pipeServiceFilter}
                onChange={(e) => setPipeServiceFilter(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:border-[#0070C0] cursor-pointer max-w-[140px]"
              >
                <option value="All">All Services</option>
                {servicesList.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              {/* Target Closing Date Filter */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md px-2 py-0.5">
                <span className="text-[11px] text-slate-400">Closing ≤</span>
                <input
                  type="date"
                  value={pipeTargetClosingFilter}
                  onChange={(e) => setPipeTargetClosingFilter(e.target.value)}
                  className="text-xs text-slate-700 focus:outline-none bg-transparent cursor-pointer"
                  title="Target Closing Date"
                />
                {pipeTargetClosingFilter && (
                  <button
                    onClick={() => setPipeTargetClosingFilter('')}
                    className="text-slate-400 hover:text-slate-600 ml-1 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {(pipeOwnerFilter !== 'All' || pipeCustomerFilter !== 'All' || pipeStageFilter !== 'All' || pipeServiceFilter !== 'All' || pipeTargetClosingFilter || pipeSearch) && (
                <button
                  onClick={() => {
                    setPipeOwnerFilter('All');
                    setPipeCustomerFilter('All');
                    setPipeStageFilter('All');
                    setPipeServiceFilter('All');
                    setPipeTargetClosingFilter('');
                    setPipeSearch('');
                  }}
                  className="text-xs text-rose-600 hover:underline font-medium cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={pipeSearch}
                onChange={(e) => setPipeSearch(e.target.value)}
                placeholder="Search deal, customer, owner..."
                className="w-full pl-9 pr-4 py-1.5 text-xs text-[#172B4D] bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#0070C0]"
              />
            </div>
          </div>

          {/* Pipeline Monitoring Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Opportunity</th>
                    <th className="py-3 px-3">Owner</th>
                    <th className="py-3 px-3">Stage</th>
                    <th className="py-3 px-3 text-right">Potential Revenue</th>
                    <th className="py-3 px-3 text-right">Probability</th>
                    <th className="py-3 px-3">Target Closing</th>
                    <th className="py-3 px-3">Last Activity</th>
                    <th className="py-3 px-3">Next Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOpportunities.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        <GitBranch className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        No opportunities found matching the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredOpportunities.map(opp => {
                      const isStagnant = opp.lastActivityDate < '2026-09-25' && opp.stage !== 'Award' && opp.stage !== 'Lost';

                      return (
                        <tr
                          key={opp.id}
                          onClick={() => openOpportunityDetail(opp.id)}
                          className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                        >
                          <td className="py-3.5 px-4 font-normal text-[#172B4D] whitespace-nowrap">
                            {opp.customerName}
                          </td>
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="font-normal text-[#172B4D] hover:text-[#0070C0] truncate" title={opp.opportunityName}>
                              {opp.opportunityName}
                            </div>
                            <span className="text-[11px] text-slate-400 font-normal">{opp.service}</span>
                          </td>
                          <td className="py-3.5 px-3 text-slate-700 whitespace-nowrap font-normal">
                            {opp.ownerName}
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <StatusBadge status={opp.stage} size="sm" />
                          </td>
                          <td className="py-3.5 px-3 text-right font-normal text-[#0070C0] tabular-nums whitespace-nowrap">
                            {formatIDR(opp.potentialRevenue)}
                          </td>
                          <td className="py-3.5 px-3 text-right tabular-nums font-normal text-slate-700 whitespace-nowrap">
                            {opp.probability}%
                          </td>
                          <td className="py-3.5 px-3 tabular-nums text-slate-600 whitespace-nowrap font-normal">
                            {opp.targetClosingDate}
                          </td>
                          <td className="py-3.5 px-3 tabular-nums whitespace-nowrap">
                            <span className={isStagnant ? 'text-rose-600 font-normal' : 'text-slate-500 font-normal'}>
                              {opp.lastActivityDate}
                            </span>
                            {isStagnant && (
                              <span className="block text-[9px] font-normal text-rose-600 uppercase">10+ days inactive</span>
                            )}
                          </td>
                          <td className="py-3.5 px-3 max-w-xs text-slate-700">
                            {opp.nextAction ? (
                              <span className="truncate block" title={opp.nextAction}>
                                {opp.nextAction}
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. PICA MONITORING SUBPAGE                                */}
      {/* ========================================================= */}
      {monitoringSubTab === 'pica' && (
        <div className="space-y-4">
          {/* Top Summary Cards (Required: Open, In Progress, Waiting Verification, Overdue, Closed) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Open PICA</span>
              <div className="text-xl font-bold text-blue-600 tabular-nums mt-1">{picaOpenCount}</div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Registered cases</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">In Progress</span>
              <div className="text-xl font-bold text-amber-600 tabular-nums mt-1">{picaInProgressCount}</div>
              <span className="text-[10px] text-slate-400 mt-0.5 block">Under containment</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Waiting Verification</span>
              <div className="text-xl font-bold text-purple-700 tabular-nums mt-1">{picaWaitingVerifCount}</div>
              <span className="text-[10px] text-purple-600 mt-0.5 block font-medium">Ready for review</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Overdue Cases</span>
              <div className={`text-xl font-bold tabular-nums mt-1 ${picaOverdueCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                {picaOverdueCount}
              </div>
              <span className="text-[10px] text-rose-600 mt-0.5 block font-medium">Target date breached</span>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Closed & Resolved</span>
              <div className="text-xl font-bold text-emerald-700 tabular-nums mt-1">{picaClosedCount}</div>
              <span className="text-[10px] text-emerald-700 mt-0.5 block">Verified & archived</span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 text-slate-400">
                <Filter className="w-3.5 h-3.5" />
                <span className="font-semibold text-[11px] uppercase tracking-wider">Filters:</span>
              </div>

              {/* Customer Filter */}
              <select
                value={picaCustomerFilter}
                onChange={(e) => setPicaCustomerFilter(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:border-[#0070C0] cursor-pointer max-w-[150px]"
              >
                <option value="All">All Customers</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              {/* PIC Filter */}
              <select
                value={picaPicFilter}
                onChange={(e) => setPicaPicFilter(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:border-[#0070C0] cursor-pointer max-w-[140px]"
              >
                <option value="All">All PICs</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>

              {/* Priority Filter */}
              <select
                value={picaPriorityFilter}
                onChange={(e) => setPicaPriorityFilter(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:border-[#0070C0] cursor-pointer"
              >
                <option value="All">All Priorities</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>

              {/* Status Filter */}
              <select
                value={picaStatusFilter}
                onChange={(e) => setPicaStatusFilter(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:border-[#0070C0] cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Waiting Verification">Waiting Verification</option>
                <option value="Verified">Verified</option>
                <option value="Closed">Closed</option>
              </select>

              {/* Due Date Filter */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md px-2 py-0.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="date"
                  value={picaDueDateFilter}
                  onChange={(e) => setPicaDueDateFilter(e.target.value)}
                  className="text-xs text-slate-700 focus:outline-none bg-transparent cursor-pointer"
                  title="Due Date"
                />
                {picaDueDateFilter && (
                  <button
                    onClick={() => setPicaDueDateFilter('')}
                    className="text-slate-400 hover:text-slate-600 ml-1 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {(picaCustomerFilter !== 'All' || picaPicFilter !== 'All' || picaPriorityFilter !== 'All' || picaStatusFilter !== 'All' || picaDueDateFilter || picaSearch) && (
                <button
                  onClick={() => {
                    setPicaCustomerFilter('All');
                    setPicaPicFilter('All');
                    setPicaPriorityFilter('All');
                    setPicaStatusFilter('All');
                    setPicaDueDateFilter('');
                    setPicaSearch('');
                  }}
                  className="text-xs text-rose-600 hover:underline font-medium cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64 shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={picaSearch}
                onChange={(e) => setPicaSearch(e.target.value)}
                placeholder="Search PICA #, customer, issue..."
                className="w-full pl-9 pr-4 py-1.5 text-xs text-[#172B4D] bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#0070C0]"
              />
            </div>
          </div>

          {/* PICA Monitoring Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">PICA</th>
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-4">Issue</th>
                    <th className="py-3 px-3">PIC</th>
                    <th className="py-3 px-3">Priority</th>
                    <th className="py-3 px-3">Due Date</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-center">Overdue Indicator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPicas.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <AlertOctagon className="w-8 h-8 mx-auto mb-2 opacity-30" />
                        No PICA cases found matching the criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredPicas.map(p => {
                      const isOverdue = p.dueDate < todayStr && p.status !== 'Closed';

                      return (
                        <tr
                          key={p.id}
                          onClick={() => openPicaDetail(p.id)}
                          className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                            isOverdue ? 'bg-rose-50/20' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4 font-mono font-normal text-slate-800 whitespace-nowrap">
                            {p.picaNumber}
                          </td>
                          <td className="py-3.5 px-3 font-normal text-[#172B4D] whitespace-nowrap">
                            {p.customerName}
                          </td>
                          <td className="py-3.5 px-4 max-w-sm">
                            <div className="font-normal text-[#172B4D] hover:text-[#0070C0] truncate">
                              {p.issueTitle}
                            </div>
                            <p className="text-slate-500 text-[11px] truncate mt-0.5 font-normal">{p.issueDescription}</p>
                          </td>
                          <td className="py-3.5 px-3 text-slate-700 whitespace-nowrap font-normal">
                            {p.picName}
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <StatusBadge status={p.priority} size="sm" />
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap tabular-nums font-mono text-slate-600 font-normal">
                            {p.dueDate}
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <StatusBadge status={p.status} size="sm" />
                          </td>
                          <td className="py-3.5 px-3 text-center whitespace-nowrap">
                            {isOverdue ? (
                              <span className="inline-block px-2 py-0.5 bg-rose-100 text-rose-700 font-normal text-[10px] rounded uppercase tracking-wider border border-rose-200">
                                OVERDUE
                              </span>
                            ) : (
                              <span className="text-slate-300 text-[11px] font-mono font-normal">On Track</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
