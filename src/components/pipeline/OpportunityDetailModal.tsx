import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { OpportunityStage, LostReason } from '../../types';
import {
  Briefcase,
  X,
  CheckCircle2,
  Clock,
  Calendar,
  Building2,
  DollarSign,
  TrendingUp,
  User,
  ShieldAlert,
  ChevronRight,
  Plus,
  AlertCircle,
  Edit,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { StatusBadge } from '../layout/StatusBadge';
import { EntityBadge } from '../common/EntityBadge';
import { LostReasonModal } from './LostReasonModal';
import { AddOpportunityModal } from './AddOpportunityModal';

export const OpportunityDetailModal: React.FC = () => {
  const {
    opportunities,
    selectedOpportunityId,
    setSelectedOpportunityId,
    updateOpportunityStage,
    updateOpportunity,
    completeOpportunityNextAction,
    activities,
    setIsAddActivityOpen,
    setActivityPreselectedCustomerId,
    setActivityPreselectedOpportunityId,
    openCustomer360,
    showToast
  } = useApp();

  const [completionNotes, setCompletionNotes] = useState('');
  const [showCompletionInput, setShowCompletionInput] = useState(false);
  const [isLostModalOpen, setIsLostModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const opp = opportunities.find(o => o.id === selectedOpportunityId);
  if (!opp) return null;

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

  const stages: OpportunityStage[] = ['Qualification', 'Proposal', 'Negotiation', 'Award'];
  const currentStageIndex = stages.indexOf(opp.stage);

  // Related activities
  const oppActivities = activities.filter(a => a.opportunityId === opp.id || a.customerId === opp.customerId);

  const handleStageClick = (stg: OpportunityStage) => {
    if (stg === 'Lost') {
      setIsLostModalOpen(true);
      return;
    }
    updateOpportunityStage(opp.id, stg);
    showToast(`Opportunity stage updated to "${stg}".`, 'info');
  };

  const handleConfirmLost = (reason: LostReason, notes: string) => {
    updateOpportunityStage(opp.id, 'Lost', { reason, notes });
    showToast(`Opportunity marked as Lost (${reason}).`, 'warning');
  };

  const handleCompleteAction = () => {
    completeOpportunityNextAction(opp.id, completionNotes.trim() || undefined);
    setShowCompletionInput(false);
    setCompletionNotes('');
    showToast('Next action marked as completed.', 'success');
  };

  // Determine Next Action Status
  const isActionCompleted = opp.nextAction?.toLowerCase().includes('completed');
  const todayStr = '2026-10-05';
  const isActionOverdue = !isActionCompleted && opp.nextFollowUpDate && opp.nextFollowUpDate < todayStr;
  const actionStatusLabel = isActionCompleted ? 'Completed' : isActionOverdue ? 'Overdue' : 'Active';

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
          {/* Header: Customer — Opportunity Name */}
          <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between gap-4 shrink-0">
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOpportunityId(null);
                    openCustomer360(opp.customerId);
                  }}
                  className="font-bold text-[#0070C0] hover:underline flex items-center gap-1 cursor-pointer truncate"
                  title="Open Customer 360"
                >
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{opp.customerName}</span>
                </button>
                <span>—</span>
                <span className="font-mono text-slate-400 shrink-0">{opp.code}</span>
                <EntityBadge entity={opp.entity} size="xs" showFullName />
              </div>
              <h2 className="text-xl font-bold text-[#172B4D] tracking-tight truncate">
                {opp.opportunityName}
              </h2>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5 text-amber-600" />
                <span>Edit</span>
              </button>

              <button
                onClick={() => setSelectedOpportunityId(null)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Visual Stage Progress Stepper: Qualification → Proposal → Negotiation → Award (or Lost clearly) */}
          <div className="px-6 py-3.5 bg-white border-b border-slate-200 shrink-0">
            {opp.stage === 'Lost' ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    ✕
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-rose-900">Stage: CLOSED LOST</span>
                      <span className="text-[11px] font-semibold bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
                        Reason: {opp.lostReason || 'Not specified'}
                      </span>
                    </div>
                    {opp.lostNotes && (
                      <p className="text-xs text-rose-700 mt-0.5 italic">
                        "{opp.lostNotes}"
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleStageClick('Qualification')}
                  className="px-3 py-1.5 bg-white border border-rose-200 hover:bg-rose-100/50 text-rose-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer shrink-0 self-start sm:self-auto"
                >
                  Re-open to Qualification
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex-1 flex items-center">
                  {stages.map((stg, index) => {
                    const isPassed = currentStageIndex > index;
                    const isCurrent = opp.stage === stg;

                    return (
                      <React.Fragment key={stg}>
                        <button
                          onClick={() => handleStageClick(stg)}
                          className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-[#0070C0] text-white shadow-xs font-bold'
                              : isPassed
                              ? 'bg-blue-50 text-[#0070C0] hover:bg-blue-100'
                              : 'text-slate-400 hover:text-slate-700'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                            isCurrent ? 'bg-white text-[#0070C0]' : isPassed ? 'bg-[#0070C0] text-white' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {index + 1}
                          </span>
                          <span>{stg}</span>
                        </button>

                        {index < stages.length - 1 && (
                          <div className={`flex-1 h-0.5 mx-1.5 min-w-[12px] ${isPassed ? 'bg-[#0070C0]' : 'bg-slate-200'}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                <div className="sm:ml-3 sm:pl-3 sm:border-l border-slate-200 shrink-0">
                  <button
                    onClick={() => setIsLostModalOpen(true)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                  >
                    Mark as Lost
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Content Body: Two Columns */}
          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto flex-1">
            {/* Main 2 Columns: Metrics, Scope, Details & Activity */}
            <div className="lg:col-span-2 space-y-5">
              {/* Show Required Top Metrics: Potential Revenue, Probability, Stage, Owner, Target Closing */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Potential Revenue</span>
                  <span className="text-base font-bold text-[#0070C0] tabular-nums mt-0.5 block">{formatIDR(opp.potentialRevenue)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Win Probability</span>
                  <span className="text-base font-bold text-[#172B4D] tabular-nums mt-0.5 block">{opp.probability}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Current Stage</span>
                  <div className="mt-1">
                    <StatusBadge status={opp.stage} size="sm" />
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Target Closing</span>
                  <span className="text-xs font-bold text-slate-700 mt-1 block">{opp.targetClosingDate}</span>
                </div>
              </div>

              {/* Scope / Description */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
                  Opportunity Scope & Contract Parameters
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-white p-3.5 rounded-xl border border-slate-200">
                  {opp.description || 'No detailed logistics scope provided.'}
                </p>
              </div>

              {/* Contract Key Attributes Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-white p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold block">Service Scope</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">{opp.service}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold block">Incumbent Competitor</span>
                  <span className="font-medium text-slate-700 mt-0.5 block">{opp.competitor || 'None identified'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold block">Commercial Account Owner</span>
                  <span className="font-semibold text-[#172B4D] mt-0.5 block">{opp.ownerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-semibold block">Last Activity Touchpoint</span>
                  <span className="font-mono text-slate-600 mt-0.5 block">{opp.lastActivityDate}</span>
                </div>
              </div>

              {/* Notes */}
              {opp.notes && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Internal Notes</span>
                  <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 italic">
                    "{opp.notes}"
                  </div>
                </div>
              )}

              {/* Activity History Connected to Customer & Opportunity */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
                    Activity History ({oppActivities.length})
                  </h4>
                  <button
                    onClick={() => {
                      setActivityPreselectedCustomerId(opp.customerId);
                      setActivityPreselectedOpportunityId(opp.id);
                      setIsAddActivityOpen(true);
                    }}
                    className="text-xs text-[#0070C0] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Activity</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {oppActivities.length === 0 ? (
                    <p className="text-xs text-slate-400 py-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      No activities logged for this opportunity yet.
                    </p>
                  ) : (
                    oppActivities.slice(0, 3).map(act => (
                      <div key={act.id} className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#172B4D]">{act.subject}</span>
                          <span className="text-[11px] text-slate-400">{act.date} · {act.activityType}</span>
                        </div>
                        <p className="text-slate-600">{act.description}</p>
                        {act.result && (
                          <div className="text-[11px] text-slate-500 italic mt-0.5 bg-white p-2 rounded border border-slate-100">
                            Result: {act.result}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Side Panel: NEXT ACTION (Action, Due Date, Status, Complete Action button) */}
            <div className="space-y-4">
              <div className={`rounded-xl p-4 space-y-3.5 border ${
                isActionCompleted
                  ? 'bg-emerald-50/60 border-emerald-200'
                  : isActionOverdue
                  ? 'bg-rose-50/60 border-rose-200'
                  : 'bg-amber-50/60 border-amber-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-slate-800">
                    <Clock className={`w-3.5 h-3.5 ${
                      isActionCompleted ? 'text-emerald-600' : isActionOverdue ? 'text-rose-600' : 'text-amber-600'
                    }`} />
                    Next Action
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    isActionCompleted
                      ? 'bg-emerald-100 text-emerald-800'
                      : isActionOverdue
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {actionStatusLabel}
                  </span>
                </div>

                {/* Action Details */}
                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Action Task</span>
                    <div className="text-xs font-bold text-[#172B4D] mt-0.5 leading-snug">
                      {opp.nextAction || 'No pending next action scheduled.'}
                    </div>
                  </div>

                  {opp.nextFollowUpDate && (
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Due Date</span>
                      <div className="text-xs text-slate-700 font-medium flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span className={isActionOverdue ? 'text-rose-600 font-bold' : ''}>
                          {opp.nextFollowUpDate}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Complete Action Button */}
                {!isActionCompleted && opp.nextAction && (
                  <div className="pt-2 border-t border-slate-200/60">
                    {!showCompletionInput ? (
                      <button
                        onClick={() => setShowCompletionInput(true)}
                        className="w-full py-2 px-3 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Complete Action</span>
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <textarea
                          rows={2}
                          value={completionNotes}
                          onChange={(e) => setCompletionNotes(e.target.value)}
                          placeholder="Action resolution notes..."
                          className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0070C0]"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleCompleteAction}
                            className="flex-1 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
                          >
                            Confirm Done
                          </button>
                          <button
                            onClick={() => setShowCompletionInput(false)}
                            className="px-2.5 py-1.5 text-xs text-slate-500 hover:bg-slate-200 rounded-lg cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Probability Slider */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
                    Win Probability
                  </label>
                  <span className="text-xs font-bold text-[#0070C0] tabular-nums">
                    {opp.probability}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={opp.probability}
                  onChange={(e) => updateOpportunity(opp.id, { probability: Number(e.target.value) })}
                  className="w-full accent-[#0070C0] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lost Reason Modal */}
      <LostReasonModal
        isOpen={isLostModalOpen}
        onClose={() => setIsLostModalOpen(false)}
        opportunityName={opp.opportunityName}
        onConfirm={handleConfirmLost}
      />

      {/* Edit Opportunity Modal */}
      <AddOpportunityModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        opportunityToEdit={opp}
      />
    </>
  );
};
