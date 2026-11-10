import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PicaStatus, PicaPriority } from '../../types';
import {
  AlertOctagon,
  X,
  CheckCircle2,
  Clock,
  Calendar,
  Building2,
  User,
  ShieldCheck,
  Send,
  AlertTriangle,
  RotateCcw,
  Check,
  FileText,
  Paperclip,
  Edit3,
  Save,
  Briefcase,
  History,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { StatusBadge } from '../layout/StatusBadge';
import { Button } from '../ui/Button';

export const PicaDetailModal: React.FC = () => {
  const {
    picas,
    selectedPicaId,
    setSelectedPicaId,
    currentUser,
    updatePica,
    startPicaProgress,
    addPicaProgress,
    submitPicaForVerification,
    verifyPica,
    closePica,
    openCustomer360,
    openOpportunityDetail,
    showToast
  } = useApp();

  const [progressPercent, setProgressPercent] = useState<number>(50);
  const [progressNotes, setProgressNotes] = useState('');
  const [progressAttachment, setProgressAttachment] = useState('');
  const [showProgressForm, setShowProgressForm] = useState(false);

  // Edit Root Cause / Corrective / Preventive Actions
  const [isEditingActions, setIsEditingActions] = useState(false);
  const [editRootCause, setEditRootCause] = useState('');
  const [editCorrectiveAction, setEditCorrectiveAction] = useState('');
  const [editPreventiveAction, setEditPreventiveAction] = useState('');
  const [editEvidence, setEditEvidence] = useState('');
  const [editNotes, setEditNotes] = useState('');

  // Verification Form State
  const [verificationDecision, setVerificationDecision] = useState<'Approve' | 'Return'>('Approve');
  const [verificationNotes, setVerificationNotes] = useState('');

  const pica = picas.find(p => p.id === selectedPicaId);
  if (!pica) return null;

  const todayStr = '2026-10-05';
  const isOverdue = pica.dueDate < todayStr && pica.status !== 'Closed';

  const isAssignedPic = pica.picId === currentUser.id;
  const canVerify = currentUser.role === 'Head of Department' || currentUser.role === 'Super Admin';
  const canManage = isAssignedPic || canVerify;

  // Step Progress: Open → In Progress → Verification → Closed
  const steps = [
    { label: 'Open', key: 'Open' },
    { label: 'In Progress', key: 'In Progress' },
    { label: 'Verification', key: 'Waiting Verification' },
    { label: 'Closed', key: 'Closed' }
  ];

  const getStepIndex = (st: PicaStatus) => {
    if (st === 'Open') return 0;
    if (st === 'In Progress') return 1;
    if (st === 'Waiting Verification') return 2;
    if (st === 'Verified' || st === 'Closed') return 3;
    return 0;
  };

  const currentStep = getStepIndex(pica.status);

  // Start Editing Actions
  const handleStartEdit = () => {
    setEditRootCause(pica.rootCause || '');
    setEditCorrectiveAction(pica.correctiveAction);
    setEditPreventiveAction(pica.preventiveAction || '');
    setEditEvidence(pica.evidence || '');
    setEditNotes(pica.notes || '');
    setIsEditingActions(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePica(pica.id, {
      rootCause: editRootCause.trim(),
      correctiveAction: editCorrectiveAction.trim(),
      preventiveAction: editPreventiveAction.trim(),
      evidence: editEvidence.trim() || undefined,
      notes: editNotes.trim() || undefined,
    });
    setIsEditingActions(false);
    showToast('PICA containment and preventive actions updated.', 'success');
  };

  const handleStartProgress = () => {
    startPicaProgress(pica.id);
    showToast(`PICA ${pica.picaNumber} started into 'In Progress'.`, 'info');
  };

  const handleAddProgress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!progressNotes.trim()) {
      showToast('Please provide progress notes.', 'warning');
      return;
    }

    addPicaProgress(
      pica.id,
      Number(progressPercent),
      progressNotes.trim(),
      progressAttachment.trim() || undefined
    );
    setProgressNotes('');
    setProgressAttachment('');
    setShowProgressForm(false);
    showToast('Progress update logged successfully.', 'success');
  };

  const handleSubmitVerification = () => {
    submitPicaForVerification(pica.id);
    showToast(`PICA ${pica.picaNumber} submitted for management verification.`, 'success');
  };

  const handleApprove = () => {
    verifyPica(pica.id, true, verificationNotes.trim() || 'Approved by Commercial Management.');
    showToast(`PICA ${pica.picaNumber} verified and approved.`, 'success');
    setVerificationNotes('');
  };

  const handleReturnRevision = () => {
    if (!verificationNotes.trim()) {
      showToast('Please provide revision requirements in verification notes.', 'warning');
      return;
    }
    verifyPica(pica.id, false, verificationNotes.trim());
    showToast(`PICA ${pica.picaNumber} returned to PIC for revision.`, 'info');
    setVerificationNotes('');
  };

  const handleCloseCase = () => {
    closePica(pica.id);
    showToast(`PICA ${pica.picaNumber} successfully closed and resolved.`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-mono font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-2xs">
                {pica.picaNumber}
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedPicaId(null);
                  openCustomer360(pica.customerId, 'pica');
                }}
                className="font-bold text-[#0070C0] hover:underline cursor-pointer flex items-center gap-1"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{pica.customerName}</span>
              </button>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                <Briefcase className="w-3 h-3 text-slate-400" />
                <span>{pica.department || 'Commercial & Business Development'}</span>
              </span>
              <StatusBadge status={pica.status} size="sm" />
              {isOverdue && (
                <span className="text-[10px] font-bold text-rose-700 bg-rose-100 border border-rose-200 px-2 py-0.5 rounded uppercase tracking-wider">
                  OVERDUE
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#172B4D]">
              {pica.issueTitle}
            </h2>
          </div>
          <button
            onClick={() => setSelectedPicaId(null)}
            className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step-based Visual Stepper: Open → In Progress → Verification → Closed */}
        <div className="px-6 py-3.5 bg-white border-b border-slate-200 shrink-0">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((st, i) => {
              const isPast = currentStep > i;
              const isCurr = currentStep === i;

              return (
                <div key={st.label} className="flex-1 flex items-center">
                  <div className="flex items-center gap-2 text-xs font-semibold">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs transition-all ${
                      isCurr
                        ? 'bg-[#0070C0] text-white ring-4 ring-blue-100 font-bold'
                        : isPast
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                    }`}>
                      {isPast ? <Check className="w-3.5 h-3.5" /> : i + 1}
                    </span>
                    <span className={`hidden sm:inline ${
                      isCurr ? 'text-[#172B4D] font-bold' : isPast ? 'text-slate-700' : 'text-slate-400'
                    }`}>
                      {st.label}
                    </span>
                  </div>

                  {i < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2.5 ${isPast ? 'bg-emerald-600' : 'bg-slate-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Body Grid: 2 Columns */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto flex-1">
          {/* Main 2 Cols: Attributes, Sections (Problem, Root Cause, Corrective, Preventive, Evidence, Progress) */}
          <div className="lg:col-span-2 space-y-5">
            {/* Top Metrics / Parameters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Priority</span>
                <div className="mt-1">
                  <StatusBadge status={pica.priority} size="sm" />
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Person in Charge (PIC)</span>
                <span className="font-bold text-[#172B4D] mt-1 block truncate">{pica.picName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Due Date</span>
                <div className="mt-1 flex items-center gap-1 font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-700'}>
                    {pica.dueDate}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Created Date</span>
                <span className="text-slate-600 mt-1 block font-mono">{pica.createdDate}</span>
              </div>
            </div>

            {/* Linked Context (Opportunity / Source Activity if present) */}
            {(pica.relatedOpportunityName || pica.sourceActivitySubject) && (
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 flex flex-wrap items-center gap-4 text-xs">
                {pica.relatedOpportunityName && (
                  <div className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-[#0070C0]" />
                    <span className="text-slate-500">Related Deal:</span>
                    <button
                      type="button"
                      onClick={() => pica.relatedOpportunityId && openOpportunityDetail(pica.relatedOpportunityId)}
                      className="font-bold text-[#0070C0] hover:underline cursor-pointer"
                    >
                      {pica.relatedOpportunityName}
                    </button>
                  </div>
                )}
                {pica.sourceActivitySubject && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-500">Source Activity:</span>
                    <span className="font-medium text-slate-700">{pica.sourceActivitySubject}</span>
                  </div>
                )}
              </div>
            )}

            {/* SECTION 1: PROBLEM IDENTIFICATION */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider flex items-center justify-between">
                <span>1. Problem Identification</span>
              </h4>
              <p className="text-xs text-slate-700 bg-white p-3.5 rounded-xl border border-slate-200 leading-relaxed shadow-2xs">
                {pica.issueDescription}
              </p>
            </div>

            {/* SECTION 2-4: ROOT CAUSE, CORRECTIVE ACTION, PREVENTIVE ACTION (with Edit Capability for PIC) */}
            {isEditingActions ? (
              <form onSubmit={handleSaveEdit} className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-[#172B4D] uppercase tracking-wider">
                    Edit Containment & Actions
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingActions(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    Cancel
                  </button>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Corrective Action (Immediate Containment) *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={editCorrectiveAction}
                    onChange={(e) => setEditCorrectiveAction(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#0070C0]"
                  />
                </div>

                {editRootCause && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Root Cause Analysis
                    </label>
                    <textarea
                      rows={2}
                      value={editRootCause}
                      onChange={(e) => setEditRootCause(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#0070C0]"
                    />
                  </div>
                )}

                {editPreventiveAction && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Preventive Action
                    </label>
                    <textarea
                      rows={2}
                      value={editPreventiveAction}
                      onChange={(e) => setEditPreventiveAction(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#0070C0]"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Evidence Reference</label>
                    <input
                      type="text"
                      value={editEvidence}
                      onChange={(e) => setEditEvidence(e.target.value)}
                      placeholder="Reference document or filename..."
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#0070C0]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Internal Notes</label>
                    <input
                      type="text"
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Commercial notes..."
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#0070C0]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingActions(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    <Save className="w-3.5 h-3.5 mr-1" />
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {/* Corrective Action */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
                      2. Corrective Action (Immediate Containment)
                    </h4>
                    {canManage && pica.status !== 'Closed' && (
                      <button
                        onClick={handleStartEdit}
                        className="text-[11px] text-[#0070C0] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit Actions</span>
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 bg-white p-3.5 rounded-xl border border-slate-200 leading-relaxed shadow-2xs">
                    {pica.correctiveAction}
                  </p>
                </div>

                {/* Optional Root Cause if exists from legacy */}
                {pica.rootCause && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
                      Root Cause Analysis
                    </h4>
                    <p className="text-xs text-slate-700 bg-white p-3.5 rounded-xl border border-slate-200 leading-relaxed shadow-2xs">
                      {pica.rootCause}
                    </p>
                  </div>
                )}

                {/* Optional Preventive Action if exists from legacy */}
                {pica.preventiveAction && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
                      Preventive Action
                    </h4>
                    <p className="text-xs text-slate-700 bg-white p-3.5 rounded-xl border border-slate-200 leading-relaxed shadow-2xs">
                      {pica.preventiveAction}
                    </p>
                  </div>
                )}

                {/* 5. Evidence & Attachments */}
                {pica.evidence && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
                      5. Evidence & Supporting Documents
                    </h4>
                    <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#0070C0] shrink-0" />
                      <span className="font-mono text-[11px]">{pica.evidence}</span>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {pica.notes && (
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Internal Commercial Notes
                    </h4>
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 italic">
                      "{pica.notes}"
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* SECTION 6: PROGRESS TIMELINE */}
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#0070C0]" />
                  <span>Progress History Timeline ({pica.progressHistory.length})</span>
                </h4>

                {canManage && pica.status !== 'Closed' && (
                  <button
                    onClick={() => setShowProgressForm(!showProgressForm)}
                    className="text-xs text-[#0070C0] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{showProgressForm ? 'Cancel' : '+ Update Progress'}</span>
                  </button>
                )}
              </div>

              {/* Progress Update Form */}
              {showProgressForm && (
                <form onSubmit={handleAddProgress} className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#172B4D]">Record Progress Milestone</span>
                    <span className="font-bold text-[#0070C0] text-sm tabular-nums">{progressPercent}%</span>
                  </div>

                  <div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={progressPercent}
                      onChange={(e) => setProgressPercent(Number(e.target.value))}
                      className="w-full accent-[#0070C0] cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Execution Notes *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={progressNotes}
                      onChange={(e) => setProgressNotes(e.target.value)}
                      placeholder="Detail physical actions completed, driver briefings, replacement shipment arrival..."
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#0070C0]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Attachment / Evidence Link (Optional)
                    </label>
                    <input
                      type="text"
                      value={progressAttachment}
                      onChange={(e) => setProgressAttachment(e.target.value)}
                      placeholder="e.g. Proof_of_Delivery_Resolution.pdf"
                      className="w-full p-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#0070C0]"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowProgressForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" size="sm">
                      Save Progress
                    </Button>
                  </div>
                </form>
              )}

              {/* Progress Entries Timeline */}
              <div className="space-y-2.5">
                {pica.progressHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    No progress entries recorded yet.
                  </p>
                ) : (
                  pica.progressHistory.map((prg) => (
                    <div key={prg.id} className="p-3 bg-slate-50 hover:bg-slate-50/80 rounded-xl border border-slate-200 text-xs space-y-1.5 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#172B4D]">{prg.userName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-[#0070C0] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            {prg.progressPercent}% Completed
                          </span>
                          <span className="text-slate-400 font-mono text-[11px]">{prg.date}</span>
                        </div>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{prg.notes}</p>
                      {prg.attachment && (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1">
                          <Paperclip className="w-3 h-3 text-slate-400" />
                          <span className="font-mono">{prg.attachment}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* SECTION 7: VERIFICATION HISTORY */}
            {pica.verificationHistory && pica.verificationHistory.length > 0 && (
              <div className="space-y-2.5 pt-3 border-t border-slate-200">
                <h4 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                  <span>Verification Audit History</span>
                </h4>
                <div className="space-y-2">
                  {pica.verificationHistory.map(v => (
                    <div key={v.id} className="p-3 bg-purple-50/40 border border-purple-200 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-purple-950">{v.verifierName}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            v.decision === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {v.decision}
                          </span>
                          <span className="text-slate-400 font-mono text-[11px]">{v.date}</span>
                        </div>
                      </div>
                      <p className="text-purple-900 leading-relaxed italic">"{v.notes}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right 1 Column: Lifecycle Workflow Actions & Decision Box */}
          <div className="space-y-4">
            {/* Box 1: Start Progress (if Open) */}
            {pica.status === 'Open' && canManage && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <span className="text-xs font-bold text-[#172B4D] uppercase tracking-wider block">
                  1. Initiate Case Execution
                </span>
                <p className="text-xs text-slate-500">
                  Acknowledge this PICA case and transition the workflow to active containment.
                </p>
                <button
                  onClick={handleStartProgress}
                  className="w-full py-2 bg-[#0070C0] hover:bg-[#005a9c] text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Start Progress</span>
                </button>
              </div>
            )}

            {/* Box 2: Submit for Verification (if In Progress) */}
            {pica.status === 'In Progress' && canManage && (
              <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 space-y-3">
                <span className="text-xs font-bold text-[#0070C0] uppercase tracking-wider block">
                  2. Submit for Verification
                </span>
                <p className="text-xs text-slate-600">
                  Once containment and preventive actions are executed, submit to Head of Department for quality sign-off.
                </p>
                <button
                  onClick={handleSubmitVerification}
                  className="w-full py-2 bg-[#0070C0] hover:bg-[#005a9c] text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit for Verification</span>
                </button>
              </div>
            )}

            {/* Box 3: Verification Review Box (if Waiting Verification) */}
            {pica.status === 'Waiting Verification' && (
              <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-4 space-y-3.5">
                <div className="flex items-center gap-2 text-purple-950 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-purple-700" />
                  <span>Head Dept Verification</span>
                </div>
                <p className="text-xs text-purple-900">
                  Review the executed corrective & preventive measures. Decide whether to approve or return for revision.
                </p>

                {canVerify ? (
                  <div className="space-y-3">
                    {/* Decision Selector */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setVerificationDecision('Approve')}
                        className={`p-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          verificationDecision === 'Approve'
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white border-purple-200 text-purple-900 hover:bg-purple-100/50'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setVerificationDecision('Return')}
                        className={`p-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          verificationDecision === 'Return'
                            ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                            : 'bg-white border-purple-200 text-purple-900 hover:bg-purple-100/50'
                        }`}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Return</span>
                      </button>
                    </div>

                    <textarea
                      rows={2}
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                      placeholder={
                        verificationDecision === 'Approve'
                          ? 'Verification review notes (optional)...'
                          : 'Required: specify why this case requires revision...'
                      }
                      className="w-full text-xs p-2.5 bg-white border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
                    />

                    <button
                      onClick={verificationDecision === 'Approve' ? handleApprove : handleReturnRevision}
                      className={`w-full py-2 font-semibold text-xs rounded-lg text-white transition-colors shadow-xs cursor-pointer ${
                        verificationDecision === 'Approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'
                      }`}
                    >
                      {verificationDecision === 'Approve' ? 'Approve & Mark Verified' : 'Return to In Progress'}
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-purple-800 bg-white p-2.5 rounded-lg border border-purple-200">
                    Awaiting verification review by Head of Department or Super Admin.
                  </div>
                )}
              </div>
            )}

            {/* Box 4: Verified Box (Provide Close PICA Button) */}
            {pica.status === 'Verified' && (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-1.5 text-emerald-950 font-bold text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Case Verified</span>
                </div>
                <p className="text-xs text-emerald-900">
                  Verified by <strong>{pica.verifiedBy || 'Head of Department'}</strong> on {pica.verifiedDate || todayStr}.
                </p>
                {pica.verificationNotes && (
                  <p className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-emerald-100 italic">
                    "{pica.verificationNotes}"
                  </p>
                )}
                {canManage && (
                  <button
                    onClick={handleCloseCase}
                    className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Close PICA Case</span>
                  </button>
                )}
              </div>
            )}

            {/* Box 5: Closed Box */}
            {pica.status === 'Closed' && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Case Closed & Resolved
                </span>
                <p className="text-slate-600">
                  Closed on: <strong>{pica.closedDate || todayStr}</strong>
                </p>
                {pica.verifiedBy && (
                  <p className="text-slate-500 text-[11px]">
                    Verified by: {pica.verifiedBy}
                  </p>
                )}
                {pica.verificationNotes && (
                  <div className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-100 italic">
                    "{pica.verificationNotes}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
