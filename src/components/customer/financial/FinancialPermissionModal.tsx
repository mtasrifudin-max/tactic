import React, { useState } from 'react';
import { UserRole } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { ShieldCheck, Lock, CheckCircle2, AlertTriangle, Users } from 'lucide-react';

interface FinancialPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FinancialPermissionModal: React.FC<FinancialPermissionModalProps> = ({
  isOpen,
  onClose
}) => {
  const { financialEditRoles, setFinancialEditRoles, showToast, currentUser } = useApp();

  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(financialEditRoles);

  const toggleRole = (role: UserRole) => {
    // Super Admin must always have full access
    if (role === 'Super Admin') return;

    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter(r => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleSave = () => {
    // Ensure Super Admin is always present
    const updated = Array.from(new Set(['Super Admin' as UserRole, ...selectedRoles]));
    setFinancialEditRoles(updated);
    showToast('Financial edit permissions updated successfully.', 'success', 'Permissions Configured');
    onClose();
  };

  const allRoles: { role: UserRole; title: string; desc: string; locked?: boolean }[] = [
    {
      role: 'Super Admin',
      title: 'Super Administrator',
      desc: 'Full global authority to view, add, edit, and configure financial performance across all customer accounts.',
      locked: true
    },
    {
      role: 'Head of Department',
      title: 'Head of Department',
      desc: 'Allows department leadership to input and update monthly revenue, margins, and cost entries for monitoring.',
      locked: false
    },
    {
      role: 'Business Development',
      title: 'Business Development (BD)',
      desc: 'Allows BD account owners to enter monthly realization for their assigned prospective and converted customers.',
      locked: false
    },
    {
      role: 'Key Account Management',
      title: 'Key Account Management (KAM)',
      desc: 'Allows KAM managers to update monthly financial KPIs and unbilled figures for their assigned portfolio.',
      locked: false
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configure Financial Edit Permissions"
      maxWidth="md"
    >
      <div className="space-y-5">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-slate-600">
          <ShieldCheck className="w-5 h-5 text-[#0070C0] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            Configure which user roles are authorized to create or edit monthly financial data. Users without edit privileges will have <strong>read-only visibility</strong> according to their customer portfolio scope.
          </div>
        </div>

        <div className="space-y-2.5">
          {allRoles.map(item => {
            const isChecked = selectedRoles.includes(item.role);
            return (
              <label
                key={item.role}
                className={`flex items-start gap-3 p-3.5 rounded-xl border transition-colors cursor-pointer ${
                  isChecked
                    ? 'bg-blue-50/50 border-[#0070C0]/40'
                    : 'bg-white border-slate-200 hover:bg-slate-50/80'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={item.locked}
                  onChange={() => toggleRole(item.role)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-[#0070C0] focus:ring-[#0070C0] disabled:opacity-50"
                />
                <div className="flex-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{item.title}</span>
                    {item.locked && (
                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/80 px-1.5 py-0.2 rounded">
                        Mandatory
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-[11px] mt-0.5 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </label>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-[#0070C0] text-white hover:bg-[#005a9c]">
            Save Permissions
          </Button>
        </div>
      </div>
    </Modal>
  );
};
