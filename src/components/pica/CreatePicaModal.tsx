import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { PicaPriority, EntityId } from '../../types';
import { ENTITIES } from '../../data/mockData';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { AlertOctagon, Paperclip, Building2, User, Calendar, ShieldAlert } from 'lucide-react';

interface CreatePicaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (picaId: string) => void;
}

export const CreatePicaModal: React.FC<CreatePicaModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const {
    customers,
    opportunities,
    activities,
    users,
    currentUser,
    selectedEntity,
    addPica,
    picaPreselectedCustomerId,
    setPicaPreselectedCustomerId,
    showToast,
    openPicaDetail,
    entitiesMap
  } = useApp();

  // Permitted entities
  const permittedEntities = useMemo(() => {
    const codes = Object.keys(entitiesMap) as EntityId[];
    const assigned = currentUser.assignedEntities && currentUser.assignedEntities.length > 0
      ? currentUser.assignedEntities
      : codes;
    return assigned.map(id => entitiesMap[id]).filter(Boolean);
  }, [currentUser, entitiesMap]);

  const [entity, setEntity] = useState<EntityId>('PDT');
  const [customerId, setCustomerId] = useState('');
  const [relatedOppId, setRelatedOppId] = useState('');
  const [sourceActId, setSourceActId] = useState('');
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [correctiveAction, setCorrectiveAction] = useState('');
  const [picId, setPicId] = useState(currentUser.id);
  const [priority, setPriority] = useState<PicaPriority>('High');
  const [dueDate, setDueDate] = useState('');
  const [evidence, setEvidence] = useState('');
  const [notes, setNotes] = useState('');

  // Set initial dates and customer on open
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const defaultEnt = (selectedEntity !== 'ALL' ? selectedEntity : (currentUser.assignedEntities?.[0] || 'PDT')) as EntityId;
      setEntity(defaultEnt);

      const targetCustId = picaPreselectedCustomerId || (customers[0]?.id || '');
      setCustomerId(targetCustId);
      setRelatedOppId('');
      setSourceActId('');
      setIssueTitle('');
      setIssueDescription('');
      setCorrectiveAction('');
      setPicId(currentUser.id);
      setPriority('High');
      setDueDate(nextWeek.toISOString().split('T')[0]);
      setEvidence('');
      setNotes('');
    }
  }, [isOpen, picaPreselectedCustomerId, customers, currentUser, selectedEntity]);

  if (!isOpen) return null;

  const eligibleOpps = opportunities.filter(o => o.customerId === customerId);
  const eligibleActs = activities.filter(a => a.customerId === customerId);
  const activeUsers = users.filter(u => u.status === 'Active');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId) {
      showToast('Please select a customer for this PICA record.', 'warning');
      return;
    }
    if (!issueTitle.trim()) {
      showToast('Issue title is required.', 'warning');
      return;
    }
    if (!issueDescription.trim()) {
      showToast('Problem identification is required.', 'warning');
      return;
    }
    if (!correctiveAction.trim()) {
      showToast('Corrective action is required.', 'warning');
      return;
    }
    if (!dueDate) {
      showToast('Target resolution due date is required.', 'warning');
      return;
    }

    const selectedCust = customers.find(c => c.id === customerId);
    if (!selectedCust) {
      showToast('Selected customer is invalid.', 'warning');
      return;
    }

    const assignedPic = users.find(u => u.id === picId) || currentUser;
    const opp = opportunities.find(o => o.id === relatedOppId);
    const act = activities.find(a => a.id === sourceActId);

    const newPica = addPica({
      entity,
      customerId: selectedCust.id,
      customerName: selectedCust.name,
      relatedOpportunityId: opp?.id,
      relatedOpportunityName: opp?.opportunityName,
      sourceActivityId: act?.id,
      sourceActivitySubject: act?.subject,
      issueTitle: issueTitle.trim(),
      issueDescription: issueDescription.trim(),
      correctiveAction: correctiveAction.trim(),
      picId: assignedPic.id,
      picName: assignedPic.name,
      department: assignedPic.department || currentUser.department || 'Commercial & Business Development',
      priority,
      dueDate,
      evidence: evidence.trim() || undefined,
      notes: notes.trim() || undefined,
      createdBy: currentUser.name,
    });

    showToast(`PICA ${newPica.picaNumber} created successfully.`, 'success');
    setPicaPreselectedCustomerId(null);
    onClose();

    if (onSuccess) {
      onSuccess(newPica.id);
    } else {
      openPicaDetail(newPica.id);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setPicaPreselectedCustomerId(null);
        onClose();
      }}
      title="Create PICA (Problem Identification & Corrective Action)"
      description="Register customer operational issue, conduct root cause analysis, and assign containment and preventive actions."
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {/* Section 1: Association & PIC */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            1. Issue Context & Ownership
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Select
              label="Operating Entity *"
              required
              value={entity}
              onChange={(e) => setEntity(e.target.value as EntityId)}
            >
              {permittedEntities.map(ent => (
                <option key={ent.id} value={ent.id}>
                  {ent.name} — {ent.fullName}
                </option>
              ))}
            </Select>

            <Select
              label="Customer *"
              required
              value={customerId}
              onChange={(e) => {
                setCustomerId(e.target.value);
                setRelatedOppId('');
                setSourceActId('');
              }}
            >
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </Select>

            <Select
              label="Person in Charge (PIC) *"
              required
              value={picId}
              onChange={(e) => setPicId(e.target.value)}
            >
              {activeUsers.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Related Opportunity (Optional)"
              value={relatedOppId}
              onChange={(e) => {
                const oId = e.target.value;
                setRelatedOppId(oId);
                if (oId) {
                  const o = opportunities.find(x => x.id === oId);
                  if (o) setEntity(o.entity);
                }
              }}
            >
              <option value="">-- No Opportunity Linked --</option>
              {eligibleOpps.map(o => (
                <option key={o.id} value={o.id}>
                  {o.code} - {o.opportunityName}
                </option>
              ))}
            </Select>

            <Select
              label="Source Activity (Optional)"
              value={sourceActId}
              onChange={(e) => setSourceActId(e.target.value)}
            >
              <option value="">-- No Source Activity Linked --</option>
              {eligibleActs.map(a => (
                <option key={a.id} value={a.id}>
                  {a.date} - {a.subject}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Section 2: Priority & Due Date */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Input
              label="Issue Title *"
              required
              value={issueTitle}
              onChange={(e) => setIssueTitle(e.target.value)}
              placeholder="e.g. Lead Time Variance on Jakarta - Surabaya Corridor"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Select
              label="Priority *"
              required
              value={priority}
              onChange={(e) => setPriority(e.target.value as PicaPriority)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </Select>

            <Input
              label="Due Date *"
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        {/* Section 3: Problem Identification */}
        <div>
          <label className="block text-xs font-semibold text-[#172B4D] mb-1">
            Problem identification *
          </label>
          <textarea
            rows={3}
            required
            value={issueDescription}
            onChange={(e) => setIssueDescription(e.target.value)}
            placeholder="Detailed description of problem identification, operational issue, impact on customer SLA, affected volume, or shipment manifest..."
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0070C0]/20 focus:border-[#0070C0] bg-white transition-all"
          />
        </div>

        {/* Section 4: Corrective Action */}
        <div>
          <label className="block text-xs font-semibold text-[#172B4D] mb-1">
            Corrective Action (Immediate Containment) *
          </label>
          <textarea
            rows={3}
            required
            value={correctiveAction}
            onChange={(e) => setCorrectiveAction(e.target.value)}
            placeholder="Immediate containment action executed to resolve current customer impact (e.g. Back-up dedicated fleet dispatched, replacement shipment arranged)..."
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0070C0]/20 focus:border-[#0070C0] bg-white transition-all"
          />
        </div>

        {/* Section 7: Evidence & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Evidence / Reference Attachment (Optional)"
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
            placeholder="e.g. Incident_Report_BOGOR_WH_2026.pdf"
          />

          <Input
            label="Additional Notes (Optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Escalated during monthly commercial review"
          />
        </div>

        {/* Auto Generated Info */}
        <div className="text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <span>PICA Number: <strong>Auto-generated (PICA-2026-xxxx)</strong></span>
          <span>Created By: <strong>{currentUser.name}</strong></span>
          <span>Initial Status: <strong className="text-blue-600">Open</strong></span>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setPicaPreselectedCustomerId(null);
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" className="bg-rose-600 hover:bg-rose-700">
            Create PICA Record
          </Button>
        </div>
      </form>
    </Modal>
  );
};
