import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ActivityType, EntityId } from '../../types';
import { ENTITIES } from '../../data/mockData';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Clock, Calendar, Paperclip, Briefcase, Building2, User } from 'lucide-react';

interface LogActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (activityId: string) => void;
}

export const LogActivityModal: React.FC<LogActivityModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const {
    customers,
    opportunities,
    users,
    currentUser,
    selectedEntity,
    addActivity,
    activityPreselectedCustomerId,
    setActivityPreselectedCustomerId,
    activityPreselectedOpportunityId,
    setActivityPreselectedOpportunityId,
    showToast,
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
  const [date, setDate] = useState('2026-10-05');
  const [time, setTime] = useState('09:30');
  const [customerId, setCustomerId] = useState('');
  const [opportunityId, setOpportunityId] = useState('');
  const [activityType, setActivityType] = useState<ActivityType>('Customer Visit');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [result, setResult] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [nextFollowUpTime, setNextFollowUpTime] = useState('10:00');
  const [attachment, setAttachment] = useState('');
  const [userId, setUserId] = useState(currentUser.id);

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

  // Sync preselected values on open
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setDate(today);
    setTime(timeStr);
    setUserId(currentUser.id);

    const initCustId = activityPreselectedCustomerId || customers[0]?.id || '';
    setCustomerId(initCustId);

    if (activityPreselectedOpportunityId) {
      setOpportunityId(activityPreselectedOpportunityId);
      const matchedOpp = opportunities.find(o => o.id === activityPreselectedOpportunityId);
      if (matchedOpp) {
        setCustomerId(matchedOpp.customerId);
        setEntity(matchedOpp.entity);
      }
    } else {
      const defaultEnt = (selectedEntity !== 'ALL' ? selectedEntity : (currentUser.assignedEntities?.[0] || 'PDT')) as EntityId;
      setEntity(defaultEnt);
      setOpportunityId('');
    }

    setActivityType('Customer Visit');
    setSubject('');
    setDescription('');
    setResult('');
    setNextAction('');
    setNextFollowUpDate('');
    setNextFollowUpTime('10:00');
    setAttachment('');
  }, [
    isOpen,
    activityPreselectedCustomerId,
    activityPreselectedOpportunityId,
    customers,
    opportunities,
    currentUser,
    selectedEntity
  ]);

  if (!isOpen) return null;

  // Filter opportunities belonging to the selected customer
  const eligibleOpps = opportunities.filter(o => o.customerId === customerId);

  const canChangeUser = currentUser.role === 'Super Admin' || currentUser.role === 'Head of Department';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId) {
      showToast('Customer is required.', 'warning');
      return;
    }

    if (!subject.trim()) {
      showToast('Subject is required.', 'warning');
      return;
    }

    const selectedCust = customers.find(c => c.id === customerId);
    if (!selectedCust) {
      showToast('Please select a valid customer.', 'warning');
      return;
    }

    const selectedOpp = opportunities.find(o => o.id === opportunityId);
    const assignedUser = users.find(u => u.id === userId) || currentUser;

    const createdAct = addActivity({
      entity,
      date,
      time,
      userId: assignedUser.id,
      userName: assignedUser.name,
      customerId: selectedCust.id,
      customerName: selectedCust.name,
      opportunityId: selectedOpp?.id,
      opportunityName: selectedOpp?.opportunityName,
      activityType,
      subject: subject.trim(),
      description: description.trim(),
      result: result.trim(),
      nextAction: nextAction.trim() || undefined,
      nextFollowUpDate: nextFollowUpDate || undefined,
      nextFollowUpTime: nextFollowUpDate ? nextFollowUpTime : undefined,
      attachment: attachment.trim() || undefined,
    });

    showToast(`Activity "${createdAct.subject}" logged successfully.`, 'success');

    if (nextAction.trim() && nextFollowUpDate) {
      showToast(`Follow-up scheduled for ${nextFollowUpDate}.`, 'info');
    }

    setActivityPreselectedCustomerId(null);
    setActivityPreselectedOpportunityId(null);
    onClose();
    if (onSuccess) onSuccess(createdAct.id);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setActivityPreselectedCustomerId(null);
        setActivityPreselectedOpportunityId(null);
        onClose();
      }}
      title="Log Daily Commercial Activity"
      description="Record customer interactions, client visits, discussions, and automated follow-up milestones."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {/* Date, Time, Activity Type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Activity Date *"
            type="date"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <Input
            label="Time *"
            type="time"
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />

          <Select
            label="Activity Type *"
            required
            value={activityType}
            onChange={(e) => setActivityType(e.target.value as ActivityType)}
          >
            {activityTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </Select>
        </div>

        {/* Operating Entity, Customer (Required) & Opportunity (Optional) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
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
              setOpportunityId(''); // reset opp on cust change
            }}
          >
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </Select>

          <Select
            label="Related Opportunity (Optional)"
            value={opportunityId}
            onChange={(e) => {
              const oppId = e.target.value;
              setOpportunityId(oppId);
              if (oppId) {
                const o = opportunities.find(x => x.id === oppId);
                if (o) setEntity(o.entity);
              }
            }}
          >
            <option value="">-- No specific opportunity --</option>
            {eligibleOpps.map(o => (
              <option key={o.id} value={o.id}>
                {o.code} - {o.opportunityName}
              </option>
            ))}
          </Select>
        </div>

        {/* Commercial Rep / User */}
        {canChangeUser ? (
          <Select
            label="Logged Representative *"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          >
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </Select>
        ) : (
          <div className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
            <span className="text-slate-500">Representative: <strong className="text-[#172B4D]">{currentUser.name}</strong></span>
            <span className="text-slate-400 font-mono text-[11px]">{currentUser.role}</span>
          </div>
        )}

        {/* Subject */}
        <Input
          label="Subject *"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Discuss trucking requirements & rates on corridor JKT-SBY"
        />

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-[#172B4D] mb-1">
            Activity Details & Discussion
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Key discussion topics, stakeholders present, client requests..."
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0070C0]/20 focus:border-[#0070C0] transition-all bg-white"
          />
        </div>

        {/* Result */}
        <div>
          <label className="block text-xs font-semibold text-[#172B4D] mb-1">
            Meeting Result / Outcome
          </label>
          <textarea
            rows={2}
            value={result}
            onChange={(e) => setResult(e.target.value)}
            placeholder="e.g. Client agreed on service scope, requested proposal revision with fuel escalation formula."
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0070C0]/20 focus:border-[#0070C0] transition-all bg-white"
          />
        </div>

        {/* Next Action & Follow-up Section (Auto creates Follow-up if both provided) */}
        <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-amber-900 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              Follow-up Milestone Automation
            </span>
            <span className="text-[10px] text-amber-700 font-normal">Auto-creates follow-up item</span>
          </div>

          <Input
            label="Next Action"
            value={nextAction}
            onChange={(e) => setNextAction(e.target.value)}
            placeholder="e.g. Submit commercial proposal & revised rate card"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Next Follow-up Date"
              type="date"
              value={nextFollowUpDate}
              onChange={(e) => setNextFollowUpDate(e.target.value)}
            />

            <Input
              label="Next Follow-up Time"
              type="time"
              value={nextFollowUpTime}
              onChange={(e) => setNextFollowUpTime(e.target.value)}
            />
          </div>
        </div>

        {/* Attachment */}
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-[#172B4D]">
            Attachment / Meeting Minutes
          </label>
          <div className="relative">
            <Paperclip className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={attachment}
              onChange={(e) => setAttachment(e.target.value)}
              placeholder="e.g. Minutes_of_Meeting_BYD_Oct2026.pdf"
              className="w-full pl-9 pr-4 py-1.5 text-xs text-[#172B4D] bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#0070C0]"
            />
          </div>
        </div>

        <div className="text-[11px] text-slate-400 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between">
          <span>Automatically stored: Activity ID, Created By ({currentUser.name}), Created Date</span>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setActivityPreselectedCustomerId(null);
              setActivityPreselectedOpportunityId(null);
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Save Activity
          </Button>
        </div>
      </form>
    </Modal>
  );
};
