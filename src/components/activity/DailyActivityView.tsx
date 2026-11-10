import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ActivityType, Activity } from '../../types';
import {
  CalendarCheck,
  Plus,
  Search,
  Filter,
  Clock,
  Building2,
  Calendar,
  User,
  ArrowRight,
  Briefcase,
  List,
  Clock3,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '../ui/Button';
import { EntityBadge } from '../common/EntityBadge';
import { LogActivityModal } from './LogActivityModal';

export const DailyActivityView: React.FC = () => {
  const {
    activities,
    scopedActivities,
    customers,
    opportunities,
    users,
    currentUser,
    isAddActivityOpen,
    setIsAddActivityOpen,
    openCustomer360,
    openOpportunityDetail,
  } = useApp();

  const [viewMode, setViewMode] = useState<'timeline' | 'table'>('timeline'); // Default: Timeline View
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [customerFilter, setCustomerFilter] = useState<string>('All');
  const [userFilter, setUserFilter] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Pagination for table view
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

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

  // Filter activities based on 3-tier scoping
  const filteredActivities = useMemo(() => {
    return scopedActivities.filter(a => {
      const q = search.toLowerCase().trim();
      const matchSearch = !q ||
        a.subject.toLowerCase().includes(q) ||
        a.customerName.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.result.toLowerCase().includes(q) ||
        a.code.toLowerCase().includes(q);

      if (!matchSearch) return false;
      if (typeFilter !== 'All' && a.activityType !== typeFilter) return false;
      if (customerFilter !== 'All' && a.customerId !== customerFilter) return false;
      if (userFilter !== 'All' && a.userId !== userFilter) return false;
      if (dateFilter && a.date !== dateFilter) return false;

      return true;
    });
  }, [scopedActivities, search, typeFilter, customerFilter, userFilter, dateFilter]);

  // Group activities by Date for Timeline View
  const groupedTimeline = useMemo(() => {
    const map = new Map<string, Activity[]>();
    for (const act of filteredActivities) {
      const dateKey = act.date;
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(act);
    }
    // Sort dates descending
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredActivities]);

  // Pagination for table view
  const totalPages = Math.ceil(filteredActivities.length / pageSize) || 1;
  const paginatedActivities = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredActivities.slice(start, start + pageSize);
  }, [filteredActivities, currentPage, pageSize]);

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-[#172B4D] tracking-tight">
              Daily Activity
            </h1>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 tabular-nums">
              {filteredActivities.length} Activities Logged
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Log and review customer interactions, client visits, discovery meetings, and automated next actions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* View Mode Toggle: Timeline (Default) / Table */}
          <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg text-xs font-medium shadow-xs">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'timeline'
                  ? 'bg-[#0070C0] text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock3 className="w-3.5 h-3.5" />
              <span>Timeline View</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#0070C0] text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table View</span>
            </button>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsAddActivityOpen(true)}
            className="shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Log Activity</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold text-[11px] uppercase tracking-wider">Filters:</span>
          </div>

          {/* Activity Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:border-[#0070C0] cursor-pointer"
          >
            <option value="All">All Types</option>
            {activityTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          {/* Customer Filter */}
          <select
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:border-[#0070C0] cursor-pointer max-w-[160px]"
          >
            <option value="All">All Customers</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Commercial Rep Filter */}
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:border-[#0070C0] cursor-pointer"
          >
            <option value="All">All Reps</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>

          {/* Date Filter */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md px-2 py-0.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="text-xs text-slate-700 focus:outline-none bg-transparent cursor-pointer"
              title="Filter by date"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-slate-400 hover:text-slate-600 ml-1 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {(typeFilter !== 'All' || customerFilter !== 'All' || userFilter !== 'All' || dateFilter || search) && (
            <button
              onClick={() => {
                setTypeFilter('All');
                setCustomerFilter('All');
                setUserFilter('All');
                setDateFilter('');
                setSearch('');
              }}
              className="text-xs text-rose-600 hover:underline font-medium cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subject, customer, notes..."
            className="w-full pl-9 pr-4 py-1.5 text-xs text-[#172B4D] bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#0070C0] transition-all"
          />
        </div>
      </div>

      {/* VIEW 1: TIMELINE VIEW (DEFAULT) */}
      {viewMode === 'timeline' && (
        <div className="space-y-6">
          {groupedTimeline.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
              <CalendarCheck className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-semibold text-slate-600">No activities found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or log a new activity.</p>
            </div>
          ) : (
            groupedTimeline.map(([dateKey, dayActivities]) => (
              <div key={dateKey} className="space-y-3">
                {/* Date Heading */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-[#172B4D] shadow-2xs">
                    <Calendar className="w-3.5 h-3.5 text-[#0070C0]" />
                    <span>{dateKey}</span>
                  </div>
                  <div className="h-px bg-slate-200 flex-1" />
                  <span className="text-[11px] font-semibold text-slate-400">
                    {dayActivities.length} {dayActivities.length === 1 ? 'touchpoint' : 'touchpoints'}
                  </span>
                </div>

                {/* Timeline Cards:
                    Display:
                    - Time
                    - Activity Type
                    - Customer
                    - Subject
                    - Result
                    - Next Action
                */}
                <div className="space-y-3">
                  {dayActivities.map(act => (
                    <div
                      key={act.id}
                      className="bg-white border border-slate-200 hover:border-[#0070C0] rounded-xl p-4 shadow-xs transition-all space-y-2.5"
                    >
                      {/* Top Bar: Time, Activity Type, Customer, Rep */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Time */}
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-mono font-bold text-xs text-slate-700">
                            {act.time}
                          </span>

                          {/* Operating Entity */}
                          <EntityBadge entity={act.entity} size="xs" />

                          {/* Activity Type */}
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-[#0070C0] border border-blue-100">
                            {act.activityType}
                          </span>

                          {/* Customer */}
                          <button
                            type="button"
                            onClick={() => openCustomer360(act.customerId, 'activity')}
                            className="font-bold text-xs text-[#172B4D] hover:text-[#0070C0] transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Building2 className="w-3.5 h-3.5 text-slate-400" />
                            <span>{act.customerName}</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          {act.opportunityName && (
                            <button
                              type="button"
                              onClick={() => act.opportunityId && openOpportunityDetail(act.opportunityId)}
                              className="text-[#0070C0] hover:underline flex items-center gap-1 font-medium cursor-pointer truncate max-w-[200px]"
                            >
                              <Briefcase className="w-3 h-3 shrink-0" />
                              <span className="truncate">{act.opportunityName}</span>
                            </button>
                          )}
                          <span>By: <strong className="text-slate-600">{act.userName}</strong></span>
                        </div>
                      </div>

                      {/* Subject */}
                      <div className="text-xs font-bold text-[#172B4D] leading-snug">
                        {act.subject}
                      </div>

                      {/* Description if present */}
                      {act.description && (
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {act.description}
                        </p>
                      )}

                      {/* Result */}
                      {act.result && (
                        <div className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <strong className="text-slate-500 font-semibold text-[10px] uppercase block">Result:</strong>
                          {act.result}
                        </div>
                      )}

                      {/* Next Action */}
                      {act.nextAction && (
                        <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-100 text-amber-800">
                          <div className="flex items-center gap-1.5 font-semibold">
                            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>Next Action: {act.nextAction}</span>
                          </div>
                          {act.nextFollowUpDate && (
                            <span className="text-[11px] text-slate-500 font-mono">
                              Due: {act.nextFollowUpDate} {act.nextFollowUpTime ? `(${act.nextFollowUpTime})` : ''}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* VIEW 2: TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-3">Entity</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-4">Subject & Result</th>
                  <th className="py-3 px-3">Next Action</th>
                  <th className="py-3 px-3">Logged By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedActivities.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <CalendarCheck className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      No activities recorded yet.
                    </td>
                  </tr>
                ) : (
                  paginatedActivities.map(act => (
                    <tr key={act.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                        <div className="font-normal text-[#172B4D]">{act.date}</div>
                        <div className="text-[11px] text-slate-400">{act.time}</div>
                      </td>

                      <td className="py-3 px-3 font-normal">
                        <EntityBadge entity={act.entity} size="xs" />
                      </td>

                      <td className="py-3 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-normal bg-blue-50 text-[#0070C0] border border-blue-100">
                          {act.activityType}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => openCustomer360(act.customerId, 'activity')}
                          className="font-normal text-[#172B4D] hover:text-[#0070C0] text-left cursor-pointer"
                        >
                          {act.customerName}
                        </button>
                        {act.opportunityName && (
                          <div className="text-[10px] text-slate-400 truncate max-w-xs font-normal">
                            {act.opportunityName}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 max-w-md">
                        <div className="font-normal text-[#172B4D]">{act.subject}</div>
                        {act.result && (
                          <div className="text-[11px] text-slate-500 italic mt-0.5 line-clamp-1 font-normal">
                            Result: {act.result}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3">
                        {act.nextAction ? (
                          <div className="text-xs">
                            <div className="font-normal text-amber-800 line-clamp-1">
                              {act.nextAction}
                            </div>
                            {act.nextFollowUpDate && (
                              <div className="text-[10px] text-slate-400 font-normal">
                                Due: {act.nextFollowUpDate}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-slate-700 font-normal whitespace-nowrap">
                        {act.userName}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing <span className="font-semibold text-slate-700">{filteredActivities.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to{' '}
              <span className="font-semibold text-slate-700">{Math.min(currentPage * pageSize, filteredActivities.length)}</span> of{' '}
              <span className="font-semibold text-slate-700">{filteredActivities.length}</span> activities
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-2.5 py-1 rounded-md bg-slate-100 font-semibold text-slate-700">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Activity Modal */}
      <LogActivityModal
        isOpen={isAddActivityOpen}
        onClose={() => setIsAddActivityOpen(false)}
      />
    </div>
  );
};
