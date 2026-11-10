import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { OpportunityStage, LostReason, Opportunity, EntityId } from '../../types';
import { ENTITIES } from '../../data/mockData';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { AlertCircle } from 'lucide-react';

interface AddOpportunityModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunityToEdit?: Opportunity | null;
  onSuccess?: (opportunityId: string) => void;
}

export const AddOpportunityModal: React.FC<AddOpportunityModalProps> = ({
  isOpen,
  onClose,
  opportunityToEdit,
  onSuccess,
}) => {
  const {
    customers,
    users,
    currentUser,
    selectedEntity,
    addOpportunity,
    updateOpportunity,
    opportunityPreselectedCustomerId,
    setOpportunityPreselectedCustomerId,
    showToast,
    entitiesMap,
    masterData
  } = useApp();

  const isEditMode = Boolean(opportunityToEdit);

  // Directly derive all operating entities from Master Data Entity dictionary
  const masterEntities = useMemo(() => {
    const items = masterData.filter(m => m.category === 'Entity' && m.isActive);
    if (items.length > 0) {
      return items.map(m => ({
        id: m.code as EntityId,
        code: m.code,
        name: m.code,
        fullName: m.name,
        description: m.description || ''
      }));
    }
    return Object.values(entitiesMap);
  }, [masterData, entitiesMap]);

  // Form fields
  const [entity, setEntity] = useState<EntityId>('PDT');
  const [customerId, setCustomerId] = useState('');
  const [opportunityName, setOpportunityName] = useState('');
  const [service, setService] = useState('Dedicated FTL Trucking');
  const [description, setDescription] = useState('');
  const [potentialRevenue, setPotentialRevenue] = useState<number>(2500000000);
  const [probability, setProbability] = useState<number>(25);
  const [stage, setStage] = useState<OpportunityStage>('Qualification');
  const [competitor, setCompetitor] = useState('');
  const [targetClosingDate, setTargetClosingDate] = useState('');
  const [ownerId, setOwnerId] = useState(currentUser.id);
  const [nextAction, setNextAction] = useState('Schedule preliminary discovery meeting');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [notes, setNotes] = useState('');

  // Lost fields if stage is Lost
  const [lostReason, setLostReason] = useState<LostReason>('Price');
  const [lostNotes, setLostNotes] = useState('');

  // Initialize or reset form
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const defaultClosing = new Date();
    defaultClosing.setDate(defaultClosing.getDate() + 60);
    const defaultClosingStr = defaultClosing.toISOString().split('T')[0];

    const defaultFollowUp = new Date();
    defaultFollowUp.setDate(defaultFollowUp.getDate() + 7);
    const defaultFollowUpStr = defaultFollowUp.toISOString().split('T')[0];

    if (opportunityToEdit) {
      setEntity(opportunityToEdit.entity || 'PDT');
      setCustomerId(opportunityToEdit.customerId);
      setOpportunityName(opportunityToEdit.opportunityName);
      setService(opportunityToEdit.service);
      setDescription(opportunityToEdit.description || '');
      setPotentialRevenue(opportunityToEdit.potentialRevenue);
      setProbability(opportunityToEdit.probability);
      setStage(opportunityToEdit.stage);
      setCompetitor(opportunityToEdit.competitor || '');
      setTargetClosingDate(opportunityToEdit.targetClosingDate);
      setOwnerId(opportunityToEdit.ownerId);
      setNextAction(opportunityToEdit.nextAction || '');
      setNextFollowUpDate(opportunityToEdit.nextFollowUpDate || defaultFollowUpStr);
      setNotes(opportunityToEdit.notes || '');
      setLostReason(opportunityToEdit.lostReason || 'Price');
      setLostNotes(opportunityToEdit.lostNotes || '');
    } else {
      const defaultEnt = (selectedEntity !== 'ALL' ? selectedEntity : (masterEntities[0]?.id || 'PDT')) as EntityId;
      setEntity(defaultEnt);
      const initCustId = opportunityPreselectedCustomerId || customers[0]?.id || '';
      setCustomerId(initCustId);
      setOpportunityName('');
      setService('Dedicated FTL Trucking');
      setDescription('');
      setPotentialRevenue(2500000000);
      setProbability(25);
      setStage('Qualification');
      setCompetitor('');
      setTargetClosingDate(defaultClosingStr);
      setOwnerId(currentUser.id);
      setNextAction('Schedule preliminary discovery meeting');
      setNextFollowUpDate(defaultFollowUpStr);
      setNotes('');
      setLostReason('Price');
      setLostNotes('');
    }
  }, [opportunityToEdit, isOpen, opportunityPreselectedCustomerId, customers, currentUser, selectedEntity]);

  if (!isOpen) return null;

  const eligibleOwners = users.filter(
    u => u.status === 'Active' && (u.role === 'Business Development' || u.role === 'Key Account Management' || u.role === 'Super Admin')
  );

  const stageOptions: OpportunityStage[] = [
    'Qualification',
    'Proposal',
    'Negotiation',
    'Award',
    'Lost'
  ];

  const serviceOptions = [
    'Dedicated FTL Trucking',
    'LTL Consolidation',
    'Warehousing & Fulfillment',
    'Project Logistics & Heavy Haul',
    'Cold Chain Logistics',
    'Multimodal Transport (Road & Rail)',
    'Cross-Docking & Distribution',
    'Ocean Freight / Domestic Feeder'
  ];

  const lostReasonOptions: LostReason[] = [
    'Price',
    'Competitor',
    'Customer Cancelled',
    'Service Capability',
    'No Response',
    'Other'
  ];

  // Auto-sync probability default when stage changes if user hasn't overridden
  const handleStageSelect = (newStage: OpportunityStage) => {
    setStage(newStage);
    if (!isEditMode) {
      if (newStage === 'Qualification') setProbability(25);
      else if (newStage === 'Proposal') setProbability(50);
      else if (newStage === 'Negotiation') setProbability(75);
      else if (newStage === 'Award') setProbability(100);
      else if (newStage === 'Lost') setProbability(0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!opportunityName.trim()) {
      showToast('Please enter Opportunity Name', 'warning');
      return;
    }

    const selectedCust = customers.find(c => c.id === customerId) || customers[0];
    if (!selectedCust) {
      showToast('Please select a Customer', 'warning');
      return;
    }

    if (stage === 'Lost' && !lostNotes.trim()) {
      showToast('Please provide explanation notes for marking this opportunity as Lost.', 'warning');
      return;
    }

    const assignedOwner = users.find(u => u.id === ownerId) || currentUser;

    if (isEditMode && opportunityToEdit) {
      updateOpportunity(opportunityToEdit.id, {
        entity,
        customerId: selectedCust.id,
        customerName: selectedCust.name,
        opportunityName: opportunityName.trim(),
        service,
        description: description.trim(),
        potentialRevenue: Number(potentialRevenue) || 0,
        probability: Number(probability) || 0,
        stage,
        competitor: competitor.trim(),
        targetClosingDate,
        ownerId: assignedOwner.id,
        ownerName: assignedOwner.name,
        nextAction: nextAction.trim(),
        nextFollowUpDate,
        notes: notes.trim(),
        lostReason: stage === 'Lost' ? lostReason : undefined,
        lostNotes: stage === 'Lost' ? lostNotes.trim() : undefined,
      });

      showToast(`Opportunity "${opportunityName}" updated successfully.`, 'success');
      onClose();
      if (onSuccess) onSuccess(opportunityToEdit.id);
    } else {
      const createdOpp = addOpportunity({
        entity,
        customerId: selectedCust.id,
        customerName: selectedCust.name,
        opportunityName: opportunityName.trim(),
        service,
        description: description.trim(),
        potentialRevenue: Number(potentialRevenue) || 0,
        probability: Number(probability) || 0,
        stage,
        competitor: competitor.trim(),
        targetClosingDate,
        ownerId: assignedOwner.id,
        ownerName: assignedOwner.name,
        nextAction: nextAction.trim(),
        nextFollowUpDate,
        notes: notes.trim(),
        lostReason: stage === 'Lost' ? lostReason : undefined,
        lostNotes: stage === 'Lost' ? lostNotes.trim() : undefined,
      });

      showToast(`Opportunity "${createdOpp.code}" created successfully.`, 'success');
      setOpportunityPreselectedCustomerId(null);
      onClose();
      if (onSuccess) onSuccess(createdOpp.id);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setOpportunityPreselectedCustomerId(null);
        onClose();
      }}
      title={isEditMode ? `Edit Opportunity: ${opportunityToEdit?.code}` : 'Add New Pipeline Opportunity'}
      description="Record commercial deal parameters, revenue scope, probability, and scheduled next action."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {/* Operating Entity & Customer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Select
            label="Operating Entity *"
            required
            value={entity}
            onChange={(e) => setEntity(e.target.value as EntityId)}
          >
            {masterEntities.map(ent => (
              <option key={ent.id} value={ent.id}>
                {ent.code} — {ent.fullName}
              </option>
            ))}
          </Select>

          <Select
            label="Customer *"
            required
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          >
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </Select>
        </div>

        {/* Opportunity Name */}
        <div>
          <Input
            label="Opportunity Name *"
            required
            value={opportunityName}
            onChange={(e) => setOpportunityName(e.target.value)}
            placeholder="e.g. FMCG East Java Regional Haulage"
          />
        </div>

        {/* Service & Stage */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Select
            label="Service Scope *"
            required
            value={service}
            onChange={(e) => setService(e.target.value)}
          >
            {serviceOptions.map(srv => (
              <option key={srv} value={srv}>{srv}</option>
            ))}
          </Select>

          <Select
            label="Pipeline Stage *"
            required
            value={stage}
            onChange={(e) => handleStageSelect(e.target.value as OpportunityStage)}
          >
            {stageOptions.map(stg => (
              <option key={stg} value={stg}>{stg}</option>
            ))}
          </Select>
        </div>

        {/* Potential Revenue & Probability */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Potential Revenue (IDR) *"
            type="number"
            required
            min={0}
            step={50000000}
            value={potentialRevenue}
            onChange={(e) => setPotentialRevenue(Number(e.target.value))}
            placeholder="e.g. 2500000000"
          />

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#172B4D]">
                Win Probability (%) * (Manual)
              </label>
              <span className="text-xs font-bold text-[#0070C0] tabular-nums">
                {probability}%
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={probability}
                onChange={(e) => setProbability(Number(e.target.value))}
                className="flex-1 accent-[#0070C0] cursor-pointer"
              />
              <input
                type="number"
                min={0}
                max={100}
                value={probability}
                onChange={(e) => setProbability(Math.min(100, Math.max(0, Number(e.target.value))))}
                className="w-16 px-2 py-1 text-xs border border-slate-200 rounded-lg text-center font-bold focus:outline-none focus:border-[#0070C0]"
              />
            </div>
          </div>
        </div>

        {/* Competitor & Target Closing Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <Input
            label="Incumbent / Competitor"
            value={competitor}
            onChange={(e) => setCompetitor(e.target.value)}
            placeholder="e.g. Competitor Logistics PT"
          />

          <Input
            label="Target Closing Date *"
            type="date"
            required
            value={targetClosingDate}
            onChange={(e) => setTargetClosingDate(e.target.value)}
          />
        </div>

        {/* Commercial Owner */}
        <Select
          label="Commercial Owner *"
          required
          value={ownerId}
          onChange={(e) => setOwnerId(e.target.value)}
        >
          {eligibleOwners.map(u => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.role.includes('Key') ? 'KAM' : u.role.includes('Development') ? 'BD' : 'Admin'})
            </option>
          ))}
        </Select>

        {/* Description / Logistics Scope */}
        <div>
          <label className="block text-xs font-semibold text-[#172B4D] mb-1">
            Description & Logistics Scope
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Volume estimates, fleet requirement (e.g., 20 wingbox units daily), route details..."
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0070C0]/20 focus:border-[#0070C0] transition-all bg-white"
          />
        </div>

        {/* Next Action & Follow-up Date */}
        <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-amber-900 uppercase tracking-wider">
            <span>Next Action Side Panel Integration</span>
            <span className="text-[10px] text-amber-700 font-normal">Schedules follow-up milestone</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Next Action Task *"
              required
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              placeholder="e.g. Present commercial proposal to Procurement"
            />

            <Input
              label="Next Follow-up Due Date *"
              type="date"
              required
              value={nextFollowUpDate}
              onChange={(e) => setNextFollowUpDate(e.target.value)}
            />
          </div>
        </div>

        {/* Conditional Lost Section if stage is Lost */}
        {stage === 'Lost' && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-rose-900 uppercase tracking-wider">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Mandatory Close-Lost Feedback</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select
                label="Lost Reason *"
                required
                value={lostReason}
                onChange={(e) => setLostReason(e.target.value as LostReason)}
              >
                {lostReasonOptions.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </Select>

              <div>
                <label className="block text-xs font-semibold text-rose-900 mb-1">
                  Lost Notes & Feedback *
                </label>
                <textarea
                  rows={2}
                  required
                  value={lostNotes}
                  onChange={(e) => setLostNotes(e.target.value)}
                  placeholder="Detail why deal was lost (e.g., price differential, competitor SLA guarantees)..."
                  className="w-full px-3 py-1.5 text-xs border border-rose-300 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-[#172B4D] mb-1">
            General Notes
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Stakeholder sentiment, tender bid submission notes..."
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0070C0]/20 focus:border-[#0070C0] transition-all bg-white"
          />
        </div>

        <div className="text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between">
          <span>Automatically stored: Opportunity ID, Created By ({currentUser.name}), Created Date, Updated Date, Last Activity Date</span>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setOpportunityPreselectedCustomerId(null);
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            {isEditMode ? 'Save Changes' : 'Create Opportunity'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
