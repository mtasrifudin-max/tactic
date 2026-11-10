import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FollowUp, FollowUpStatus } from '../../types';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Building2,
  Search,
  Filter,
  Briefcase,
  User,
  List,
  LayoutGrid,
  Check
} from 'lucide-react';
import { StatusBadge } from '../layout/StatusBadge';
import { EntityBadge } from '../common/EntityBadge';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export const FollowUpView: React.FC = () => {
  const {
    followUps,
    scopedFollowUps,
    currentUser,
    users,
    completeFollowUp,
    openCustomer360,
    openOpportunityDetail,
    showToast,
  } = useApp();

  const todayStr = '2026-10-05';
  const [activeTab, setActiveTab] = useState<'Today' | 'Overdue' | 'Upcoming' | 'Completed' | 'All'>('Today');
  const [displayMode, setDisplayMode] = useState<'cards' | 'table'>('cards');
  const [search, setSearch] = useState('');
  const [userScope, setUserScope] = useState<'mine' | 'all'>('mine');

  // Complete Follow-up Modal
  const [completingItem, setCompletingItem] = useState<FollowUp | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');

  // Counts for tabs based on scopedFollowUps
  const overdueCount = scopedFollowUps.filter(f =>
    (userScope === 'all' || f.ownerId === currentUser.id || f.assignedToId === currentUser.id) &&
    (f.status === 'Overdue' || (f.dueDate < todayStr && f.status === 'Open'))
  ).length;

  const todayCount = scopedFollowUps.filter(f =>
    (userScope === 'all' || f.ownerId === currentUser.id || f.assignedToId === currentUser.id) &&
    f.dueDate === todayStr && f.status !== 'Completed'
  ).length;

  const upcomingCount = scopedFollowUps.filter(f =>
    (userScope === 'all' || f.ownerId === currentUser.id || f.assignedToId === currentUser.id) &&
    f.dueDate > todayStr && f.status !== 'Completed'
  ).length;

  const completedCount = scopedFollowUps.filter(f =>
    (userScope === 'all' || f.ownerId === currentUser.id || f.assignedToId === currentUser.id) &&
    f.status === 'Completed'
  ).length;

  // Filtered Follow-ups based on 3-tier scoping
  const filteredFollowUps = scopedFollowUps.filter(f => {
    // Ownership scope (if user chose 'mine')
    if (userScope === 'mine' && f.ownerId !== currentUser.id && f.assignedToId !== currentUser.id) return false;

    // Search
    const q = search.toLowerCase().trim();
    const matchSearch = !q ||
      f.actionText.toLowerCase().includes(q) ||
      f.customerName.toLowerCase().includes(q) ||
      (f.opportunityName && f.opportunityName.toLowerCase().includes(q));

    if (!matchSearch) return false;

    // Tabs: Today, Overdue, Upcoming, Completed
    if (activeTab === 'Today') {
      return f.dueDate === todayStr && f.status !== 'Completed';
    }
    if (activeTab === 'Overdue') {
      return f.status === 'Overdue' || (f.dueDate < todayStr && f.status === 'Open');
    }
    if (activeTab === 'Upcoming') {
      return f.dueDate > todayStr && f.status !== 'Completed';
    }
    if (activeTab === 'Completed') {
      return f.status === 'Completed';
    }

    return true;
  });

  const handleConfirmComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingItem) return;

    completeFollowUp(completingItem.id, completionNotes.trim() || undefined);
    showToast(`Follow-up marked as Completed.`, 'success');
    setCompletingItem(null);
    setCompletionNotes('');
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-[#172B4D] tracking-tight">
              Follow-up
            </h1>
            {overdueCount > 0 && (
              <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full tabular-nums">
                {overdueCount} Overdue
              </span>
            )}
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
              {filteredFollowUps.length} Actions
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Action commitments derived from daily commercial activities. Keep customer deliverables on track.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Scope Selector: My Follow-up vs All Follow-up */}
          <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg text-xs font-medium shadow-xs">
            <button
              onClick={() => setUserScope('mine')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                userScope === 'mine'
                  ? 'bg-[#0070C0] text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Follow-up
            </button>
            <button
              onClick={() => setUserScope('all')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                userScope === 'all'
                  ? 'bg-[#0070C0] text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Reps
            </button>
          </div>

          {/* Cards vs Table view toggle */}
          <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg text-xs font-medium shadow-xs">
            <button
              onClick={() => setDisplayMode('cards')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                displayMode === 'cards' ? 'bg-[#0070C0] text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setDisplayMode('table')}
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                displayMode === 'table' ? 'bg-[#0070C0] text-white' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Tabs required: Today, Overdue, Upcoming, Completed */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium shrink-0 overflow-x-auto w-full md:w-auto">
          {(['Today', 'Overdue', 'Upcoming', 'Completed', 'All'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab
                  ? 'bg-white text-[#172B4D] font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{tab}</span>
              {tab === 'Today' && todayCount > 0 && (
                <span className="w-4 h-4 bg-amber-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                  {todayCount}
                </span>
              )}
              {tab === 'Overdue' && overdueCount > 0 && (
                <span className="w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                  {overdueCount}
                </span>
              )}
              {tab === 'Upcoming' && upcomingCount > 0 && (
                <span className="w-4 h-4 bg-blue-100 text-[#0070C0] rounded-full text-[10px] flex items-center justify-center font-bold">
                  {upcomingCount}
                </span>
              )}
              {tab === 'Completed' && completedCount > 0 && (
                <span className="w-4 h-4 bg-emerald-100 text-emerald-800 rounded-full text-[10px] flex items-center justify-center font-bold">
                  {completedCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, customer..."
            className="w-full pl-9 pr-4 py-1.5 text-xs text-[#172B4D] bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#0070C0] transition-all"
          />
        </div>
      </div>

      {/* DISPLAY MODE 1: CARDS */}
      {displayMode === 'cards' && (
        <div className="space-y-3">
          {filteredFollowUps.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 text-xs">
              <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-2 text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="font-semibold text-slate-700 text-xs">
                {activeTab === 'Today' ? 'No follow-ups today.' : activeTab === 'Overdue' ? 'No overdue follow-ups.' : 'No follow-up items found.'}
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-0.5">All customer commitments in the {activeTab} queue are up to date.</p>
            </div>
          ) : (
            filteredFollowUps.map(f => {
              const isOverdue = f.status === 'Overdue' || (f.dueDate < todayStr && f.status === 'Open');
              const isToday = f.dueDate === todayStr && f.status !== 'Completed';
              const isCompleted = f.status === 'Completed';

              let borderTheme = 'border-slate-200 border-l-4 border-l-[#0070C0]';
              if (isOverdue) borderTheme = 'border-rose-200 border-l-4 border-l-rose-500 bg-rose-50/20';
              else if (isToday) borderTheme = 'border-amber-200 border-l-4 border-l-amber-500 bg-amber-50/20';
              else if (isCompleted) borderTheme = 'border-slate-200 border-l-4 border-l-emerald-500 bg-slate-50/40 opacity-80';

              return (
                <div
                  key={f.id}
                  className={`bg-white rounded-xl p-4 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${borderTheme}`}
                >
                  {/* Left: Customer, Action, Due Date, Related Opportunity, Owner, Status */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Customer */}
                      <button
                        type="button"
                        onClick={() => openCustomer360(f.customerId, 'activity')}
                        className="font-bold text-xs text-[#172B4D] hover:text-[#0070C0] cursor-pointer flex items-center gap-1"
                      >
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>{f.customerName}</span>
                      </button>

                      {/* Operating Entity */}
                      <EntityBadge entity={f.entity} size="xs" />

                      {/* Status */}
                      <StatusBadge status={isOverdue ? 'Overdue' : f.status} size="sm" />

                      {/* Related Opportunity if exists */}
                      {f.opportunityName && (
                        <button
                          type="button"
                          onClick={() => f.opportunityId && openOpportunityDetail(f.opportunityId)}
                          className="text-[11px] font-medium text-[#0070C0] hover:underline flex items-center gap-1 cursor-pointer truncate max-w-[200px]"
                        >
                          <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{f.opportunityName}</span>
                        </button>
                      )}
                    </div>

                    {/* Action Text */}
                    <p className="text-xs font-bold text-[#172B4D] leading-snug">
                      {f.actionText}
                    </p>

                    {/* Due Date & Owner */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 font-medium text-slate-600">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Due Date: <strong className={isOverdue ? 'text-rose-600 font-bold' : isToday ? 'text-amber-700 font-bold' : ''}>
                          {f.dueDate} {f.dueTime ? `at ${f.dueTime}` : ''}
                        </strong>
                      </span>
                      <span>·</span>
                      <span>Owner: <strong className="text-slate-700">{f.ownerName}</strong></span>
                      {f.completedDate && (
                        <>
                          <span>·</span>
                          <span className="text-emerald-700 font-semibold">
                            Completed on {f.completedDate} {f.completedBy ? `by ${f.completedBy}` : ''}
                          </span>
                        </>
                      )}
                    </div>

                    {f.completionNotes && (
                      <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-1 italic">
                        Outcome: "{f.completionNotes}"
                      </div>
                    )}
                  </div>

                  {/* Right Button: Complete */}
                  {!isCompleted && (
                    <div className="shrink-0 flex items-center gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setCompletingItem(f)}
                        className="bg-emerald-600 hover:bg-emerald-700 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Complete</span>
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* DISPLAY MODE 2: TABLE */}
      {displayMode === 'table' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-3">Entity</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-3">Due Date</th>
                  <th className="py-3 px-3">Related Opportunity</th>
                  <th className="py-3 px-3">Owner</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFollowUps.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-40" />
                      No follow-up items found.
                    </td>
                  </tr>
                ) : (
                  filteredFollowUps.map(f => {
                    const isOverdue = f.status === 'Overdue' || (f.dueDate < todayStr && f.status === 'Open');
                    const isCompleted = f.status === 'Completed';

                    return (
                      <tr key={f.id} className="hover:bg-blue-50/40 transition-colors">
                        {/* Customer */}
                        <td className="py-3.5 px-4 font-normal text-[#172B4D]">
                          <button
                            type="button"
                            onClick={() => openCustomer360(f.customerId, 'activity')}
                            className="hover:text-[#0070C0] text-left cursor-pointer font-normal"
                          >
                            {f.customerName}
                          </button>
                        </td>

                        {/* Entity */}
                        <td className="py-3.5 px-3 font-normal">
                          <EntityBadge entity={f.entity} size="xs" />
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 max-w-sm">
                          <div className="font-normal text-[#172B4D]">{f.actionText}</div>
                          {f.completionNotes && (
                            <div className="text-[11px] text-slate-400 italic line-clamp-1 font-normal">
                              Done: {f.completionNotes}
                            </div>
                          )}
                        </td>

                        {/* Due Date */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className={`font-mono ${isOverdue ? 'text-rose-600 font-normal' : 'text-slate-600'}`}>
                            {f.dueDate} {f.dueTime ? `(${f.dueTime})` : ''}
                          </span>
                        </td>

                        {/* Related Opportunity */}
                        <td className="py-3.5 px-3 text-slate-600 max-w-xs font-normal">
                          {f.opportunityName ? (
                            <button
                              type="button"
                              onClick={() => f.opportunityId && openOpportunityDetail(f.opportunityId)}
                              className="text-[#0070C0] hover:underline cursor-pointer truncate block text-left font-normal"
                            >
                              {f.opportunityName}
                            </button>
                          ) : (
                            <span className="text-slate-400 font-normal">—</span>
                          )}
                        </td>

                        {/* Owner */}
                        <td className="py-3.5 px-3 text-slate-700 font-normal">
                          {f.ownerName}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-3">
                          <StatusBadge status={isOverdue ? 'Overdue' : f.status} size="sm" />
                        </td>

                        {/* Button: Complete */}
                        <td className="py-3.5 px-3 text-center">
                          {!isCompleted ? (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => setCompletingItem(f)}
                              className="bg-emerald-600 hover:bg-emerald-700 py-1 px-2.5 text-[11px] font-normal"
                            >
                              <Check className="w-3 h-3" />
                              <span>Complete</span>
                            </Button>
                          ) : (
                            <span className="text-[11px] text-emerald-700 font-normal flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Done</span>
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
      )}

      {/* Complete Follow-up Modal */}
      {completingItem && (
        <Modal
          isOpen={Boolean(completingItem)}
          onClose={() => setCompletingItem(null)}
          title="Complete Follow-up Action"
          description={`Confirm completion of task for ${completingItem.customerName}`}
          maxWidth="md"
        >
          <form onSubmit={handleConfirmComplete} className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
              <span className="text-[10px] text-slate-400 font-semibold uppercase block">Action Item</span>
              <p className="font-bold text-[#172B4D]">{completingItem.actionText}</p>
              <div className="text-slate-500 pt-1">
                Due: <strong>{completingItem.dueDate}</strong> · Owner: {completingItem.ownerName}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                Outcome / Resolution Notes
              </label>
              <textarea
                rows={3}
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="e.g. Sent formal quotation via email to Pak Anton; scheduled follow-up call for next Tuesday."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0070C0]/20 focus:border-[#0070C0] transition-all bg-white"
              />
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between">
              <span>Will record Completed Date ({todayStr}) and Completed By ({currentUser.name})</span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" size="sm" onClick={() => setCompletingItem(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                Confirm Completed
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
