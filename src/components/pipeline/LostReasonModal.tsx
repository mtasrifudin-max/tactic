import React, { useState } from 'react';
import { LostReason } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { AlertCircle } from 'lucide-react';

interface LostReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunityName: string;
  onConfirm: (reason: LostReason, notes: string) => void;
}

export const LostReasonModal: React.FC<LostReasonModalProps> = ({
  isOpen,
  onClose,
  opportunityName,
  onConfirm,
}) => {
  const [reason, setReason] = useState<LostReason>('Price');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const lostReasonOptions: LostReason[] = [
    'Price',
    'Competitor',
    'Customer Cancelled',
    'Service Capability',
    'No Response',
    'Other'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      setError('Please provide explanation notes for marking this opportunity as Lost.');
      return;
    }
    onConfirm(reason, notes.trim());
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Opportunity Marked as Lost"
      description={`Record mandatory close-lost feedback for: "${opportunityName}"`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>
            Please specify the primary loss driver and notes for commercial department governance and post-mortem review.
          </span>
        </div>

        {error && (
          <div className="text-xs text-rose-600 font-medium">
            {error}
          </div>
        )}

        <Select
          label="Lost Reason *"
          required
          value={reason}
          onChange={(e) => setReason(e.target.value as LostReason)}
        >
          {lostReasonOptions.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </Select>

        <div>
          <label className="block text-xs font-semibold text-[#172B4D] mb-1">
            Lost Notes & Debrief *
          </label>
          <textarea
            rows={3}
            required
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              if (error) setError('');
            }}
            placeholder="e.g. Competitor undercut freight rates by 12% on Surabaya lane; customer chose 2-year lock."
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0070C0]/20 focus:border-[#0070C0] transition-all bg-white"
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" className="bg-rose-600 hover:bg-rose-700">
            Confirm Lost
          </Button>
        </div>
      </form>
    </Modal>
  );
};
