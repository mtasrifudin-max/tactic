import React, { useState, useEffect } from 'react';
import { Customer, Contract, ContractType, EntityId } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { EntityBadge } from '../../common/EntityBadge';
import {
  FileText,
  Calendar,
  CreditCard,
  User,
  Paperclip,
  Building2,
  Sparkles,
  Layers,
  Phone,
  Mail,
  AlertCircle
} from 'lucide-react';

interface AddContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  contractToEdit?: Contract | null;
  parentContract?: Contract | null;
  initialType?: ContractType;
  existingCustomerContracts: Contract[];
  onSuccess?: (contract: Contract) => void;
}

export const AddContractModal: React.FC<AddContractModalProps> = ({
  isOpen,
  onClose,
  customer,
  contractToEdit,
  parentContract,
  initialType = 'Main Contract',
  existingCustomerContracts,
  onSuccess,
}) => {
  const { addContract, updateContract, showToast, currentUser } = useApp();

  // Form State
  const [contractTitle, setContractTitle] = useState('');
  const [contractType, setContractType] = useState<ContractType>(initialType);
  const [entity, setEntity] = useState<EntityId>('PDT');
  const [projectLocation, setProjectLocation] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [parentContractId, setParentContractId] = useState<string>('');

  const [effectiveDate, setEffectiveDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [top, setTop] = useState('TOP 30 Days');
  const [customTop, setCustomTop] = useState('');

  const [contractPic, setContractPic] = useState('');
  const [picPhone, setPicPhone] = useState('');
  const [picEmail, setPicEmail] = useState('');

  const [attachment, setAttachment] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize or reset form when modal opens or target changes
  useEffect(() => {
    if (contractToEdit) {
      setContractTitle(contractToEdit.contractTitle);
      setContractType(contractToEdit.contractType);
      setEntity(contractToEdit.entity);
      setProjectLocation(contractToEdit.projectLocation);
      setDocumentNumber(contractToEdit.documentNumber);
      setParentContractId(contractToEdit.parentContractId || '');
      setEffectiveDate(contractToEdit.effectiveDate);
      setExpiryDate(contractToEdit.expiryDate);
      if (['TOP 14 Days', 'TOP 30 Days', 'TOP 45 Days', 'TOP 60 Days', 'TOP 90 Days'].includes(contractToEdit.top)) {
        setTop(contractToEdit.top);
        setCustomTop('');
      } else {
        setTop('Custom');
        setCustomTop(contractToEdit.top);
      }
      setContractPic(contractToEdit.contractPic);
      setPicPhone(contractToEdit.picPhone);
      setPicEmail(contractToEdit.picEmail);
      setAttachment(contractToEdit.attachment || '');
      setNotes(contractToEdit.notes || '');
    } else if (parentContract) {
      // Adding Addendum, Amendment, or Renewal linked to parent
      const type = initialType || 'Addendum';
      setContractType(type);
      setParentContractId(parentContract.id);
      setEntity(parentContract.entity);
      setProjectLocation(parentContract.projectLocation);
      setTop(parentContract.top);
      setContractPic(parentContract.contractPic);
      setPicPhone(parentContract.picPhone);
      setPicEmail(parentContract.picEmail);

      const prefix = type === 'Addendum' ? 'Addendum to' : type === 'Amendment' ? 'Amendment to' : 'Renewal of';
      setContractTitle(`${prefix} ${parentContract.contractTitle}`);

      // Auto generate document number suggestion
      const year = new Date().getFullYear();
      const code = type === 'Addendum' ? 'ADD' : type === 'Amendment' ? 'AMD' : 'RNW';
      setDocumentNumber(`${code}/${String(Math.floor(Math.random() * 900) + 100)}/${parentContract.entity}/${year}`);

      if (type === 'Renewal') {
        // Effective date begins day after parent expiry
        setEffectiveDate(parentContract.expiryDate);
        // Expiry date defaults to 1 or 2 years later
        const exp = new Date(parentContract.expiryDate);
        exp.setFullYear(exp.getFullYear() + 1);
        setExpiryDate(exp.toISOString().split('T')[0]);
      } else {
        const today = new Date().toISOString().split('T')[0];
        setEffectiveDate(today);
        setExpiryDate(parentContract.expiryDate);
      }
      setAttachment('');
      setNotes('');
    } else {
      // New standalone Main Contract
      const defaultEntity = (customer.operatingEntities && customer.operatingEntities[0]) || 'PDT';
      setContractTitle('');
      setContractType(initialType || 'Main Contract');
      setEntity(defaultEntity);
      setProjectLocation(customer.city ? `${customer.city}, ${customer.province || 'Indonesia'}` : '');
      const year = new Date().getFullYear();
      setDocumentNumber(`MSA/${String(Math.floor(Math.random() * 900) + 100)}/${defaultEntity}/${year}`);
      setParentContractId('');

      const today = new Date().toISOString().split('T')[0];
      const nextYear = new Date();
      nextYear.setFullYear(nextYear.getFullYear() + 2);

      setEffectiveDate(today);
      setExpiryDate(nextYear.toISOString().split('T')[0]);
      setTop(customer.paymentTerm || 'TOP 30 Days');
      setCustomTop('');
      setContractPic(customer.ownerName || currentUser.name || '');
      setPicPhone(customer.phone || '+62 812 ');
      setPicEmail('');
      setAttachment('');
      setNotes('');
    }
    setErrors({});
  }, [isOpen, contractToEdit, parentContract, initialType, customer, currentUser]);

  const generateDocNumber = () => {
    const year = new Date().getFullYear();
    const typeCode =
      contractType === 'Main Contract'
        ? 'MSA'
        : contractType === 'Addendum'
        ? 'ADD'
        : contractType === 'Amendment'
        ? 'AMD'
        : contractType === 'Renewal'
        ? 'RNW'
        : 'CTR';
    const rand = Math.floor(100 + Math.random() * 900);
    setDocumentNumber(`${typeCode}/${rand}/${entity}/${year}`);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!contractTitle.trim()) newErrors.contractTitle = 'Contract title is required';
    if (!documentNumber.trim()) newErrors.documentNumber = 'Document number is required';
    if (!projectLocation.trim()) newErrors.projectLocation = 'Project / location is required';
    if (!effectiveDate) newErrors.effectiveDate = 'Effective date is required';
    if (!expiryDate) newErrors.expiryDate = 'Expiry date is required';
    if (effectiveDate && expiryDate && expiryDate < effectiveDate) {
      newErrors.expiryDate = 'Expiry date must be after effective date';
    }
    if (top === 'Custom' && !customTop.trim()) {
      newErrors.top = 'Please specify custom payment term';
    }
    if (!contractPic.trim()) newErrors.contractPic = 'Contract PIC name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const finalTop = top === 'Custom' ? customTop.trim() : top;

    try {
      if (contractToEdit) {
        updateContract(contractToEdit.id, {
          contractTitle: contractTitle.trim(),
          contractType,
          entity,
          projectLocation: projectLocation.trim(),
          documentNumber: documentNumber.trim(),
          parentContractId: parentContractId || undefined,
          effectiveDate,
          expiryDate,
          top: finalTop,
          contractPic: contractPic.trim(),
          picPhone: picPhone.trim(),
          picEmail: picEmail.trim(),
          attachment: attachment.trim() || undefined,
          notes: notes.trim() || undefined,
          updatedBy: currentUser.name,
        });

        showToast('Contract updated successfully.', 'success');
        if (onSuccess) {
          onSuccess({
            ...contractToEdit,
            contractTitle: contractTitle.trim(),
            contractType,
            entity,
            projectLocation: projectLocation.trim(),
            documentNumber: documentNumber.trim(),
            parentContractId: parentContractId || undefined,
            effectiveDate,
            expiryDate,
            top: finalTop,
            contractPic: contractPic.trim(),
            picPhone: picPhone.trim(),
            picEmail: picEmail.trim(),
            attachment: attachment.trim() || undefined,
            notes: notes.trim() || undefined,
            updatedBy: currentUser.name,
          });
        }
      } else {
        const today = '2026-10-05';
        let status: Contract['contractStatus'] = 'Active';
        if (expiryDate < today) {
          status = 'Expired';
        } else {
          const expDate = new Date(expiryDate);
          const currDate = new Date(today);
          const diffDays = Math.ceil((expDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffDays <= 90) {
            status = 'Expiring Soon';
          }
        }

        const newContract = addContract({
          customerId: customer.id,
          contractTitle: contractTitle.trim(),
          contractType,
          entity,
          projectLocation: projectLocation.trim(),
          documentNumber: documentNumber.trim(),
          parentContractId: parentContractId || undefined,
          effectiveDate,
          expiryDate,
          top: finalTop,
          contractPic: contractPic.trim(),
          picPhone: picPhone.trim(),
          picEmail: picEmail.trim(),
          contractStatus: status,
          attachment: attachment.trim() || `${documentNumber.replace(/\//g, '_')}.pdf`,
          notes: notes.trim() || undefined,
          createdBy: currentUser.name,
          updatedBy: currentUser.name,
        });

        showToast(
          `${contractType} ${newContract.documentNumber} created successfully.`,
          'success'
        );
        if (onSuccess) {
          onSuccess(newContract);
        }
      }

      onClose();
    } catch (err: any) {
      showToast(err?.message || 'Failed to save contract.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isChildType = ['Addendum', 'Amendment', 'Renewal'].includes(contractType);
  const potentialParents = existingCustomerContracts.filter(c => c.id !== contractToEdit?.id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="3xl"
      title={
        contractToEdit
          ? 'Edit Contract'
          : parentContract
          ? `Add ${initialType} to Contract`
          : 'Add Contract'
      }
      description={`Customer: ${customer.name} (${customer.code})`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Context Banner */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0070C0]/10 text-[#0070C0] flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Target Customer
              </span>
              <span className="text-xs font-bold text-[#172B4D]">{customer.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">Operating Entity:</span>
            <EntityBadge entity={entity} size="sm" />
          </div>
        </div>

        {/* SECTION 1: Contract Information */}
        <div className="space-y-3.5 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#172B4D] uppercase tracking-wider">
            <FileText className="w-4 h-4 text-[#0070C0]" />
            <span>Contract Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Contract Title"
                placeholder="e.g. Master Service Agreement for FTL Trucking & Distribution"
                value={contractTitle}
                onChange={(e) => setContractTitle(e.target.value)}
                error={errors.contractTitle}
                required
              />
            </div>

            <div>
              <Select
                label="Contract Type"
                value={contractType}
                onChange={(e) => setContractType(e.target.value as ContractType)}
                options={[
                  { value: 'Main Contract', label: 'Main Contract (MSA)' },
                  { value: 'Addendum', label: 'Addendum (Fleet/Scope Expansion)' },
                  { value: 'Amendment', label: 'Amendment (Clause/Price Adjustment)' },
                  { value: 'Renewal', label: 'Renewal (Period Extension)' },
                  { value: 'Other', label: 'Other Agreement' },
                ]}
              />
            </div>

            <div>
              <Select
                label="Entity"
                value={entity}
                onChange={(e) => setEntity(e.target.value as EntityId)}
                options={[
                  { value: 'PETRA', label: 'PETRA - PT Pancaran Energi Transport' },
                  { value: 'PDT', label: 'PDT - PT Pancaran Darat Transport' },
                  { value: 'PLI', label: 'PLI - PT Pancaran Logistik Indonesia' },
                ]}
              />
            </div>

            <div>
              <Input
                label="Project / Location"
                placeholder="e.g. Jakarta, Cikarang & Karawang DC"
                value={projectLocation}
                onChange={(e) => setProjectLocation(e.target.value)}
                error={errors.projectLocation}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Document Number <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={generateDocNumber}
                  className="text-[10px] text-[#0070C0] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Suggest Format</span>
                </button>
              </div>
              <input
                type="text"
                placeholder="e.g. MSA/001/PDT/IV/2025"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                className={`w-full px-3 py-2 text-xs font-mono rounded-lg border transition-colors ${
                  errors.documentNumber
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-200 focus:border-[#0070C0] focus:ring-1 focus:ring-[#0070C0]'
                } bg-white text-[#172B4D]`}
              />
              {errors.documentNumber && (
                <p className="text-[10px] text-rose-500 mt-1">{errors.documentNumber}</p>
              )}
            </div>

            {/* Parent Contract selection if Addendum / Amendment / Renewal */}
            {isChildType && potentialParents.length > 0 && (
              <div className="sm:col-span-2 bg-blue-50/50 border border-blue-200/60 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#0070C0] mb-2">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Linked Parent Contract (Hierarchy Root)</span>
                </div>
                <Select
                  value={parentContractId}
                  onChange={(e) => setParentContractId(e.target.value)}
                  options={[
                    { value: '', label: '-- Select Parent Contract --' },
                    ...potentialParents.map(c => ({
                      value: c.id,
                      label: `${c.documentNumber} - ${c.contractTitle} (${c.contractType})`,
                    })),
                  ]}
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Linking this {contractType.toLowerCase()} connects it to the parent contract's audit hierarchy and history tree.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: Period */}
        <div className="space-y-3.5 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#172B4D] uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-[#0070C0]" />
            <span>Period</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Effective Date"
                type="date"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                error={errors.effectiveDate}
                required
              />
            </div>
            <div>
              <Input
                label="Expiry Date"
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                error={errors.expiryDate}
                required
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Commercial Terms */}
        <div className="space-y-3.5 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#172B4D] uppercase tracking-wider">
            <CreditCard className="w-4 h-4 text-[#0070C0]" />
            <span>Commercial Terms</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Select
                label="TOP (Term of Payment)"
                value={top}
                onChange={(e) => setTop(e.target.value)}
                options={[
                  { value: 'TOP 14 Days', label: 'TOP 14 Days' },
                  { value: 'TOP 30 Days', label: 'TOP 30 Days (Standard)' },
                  { value: 'TOP 45 Days', label: 'TOP 45 Days' },
                  { value: 'TOP 60 Days', label: 'TOP 60 Days' },
                  { value: 'TOP 90 Days', label: 'TOP 90 Days' },
                  { value: 'Cash On Delivery (COD)', label: 'Cash On Delivery (COD)' },
                  { value: 'Custom', label: 'Custom Term...' },
                ]}
              />
            </div>

            {top === 'Custom' && (
              <div>
                <Input
                  label="Specify Custom TOP"
                  placeholder="e.g. 50% Advance, 50% post BAST"
                  value={customTop}
                  onChange={(e) => setCustomTop(e.target.value)}
                  error={errors.top}
                  required
                />
              </div>
            )}
          </div>
        </div>

        {/* SECTION 4: Contact */}
        <div className="space-y-3.5 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-2 text-xs font-bold text-[#172B4D] uppercase tracking-wider">
            <User className="w-4 h-4 text-[#0070C0]" />
            <span>Contact</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Input
                label="Contract PIC"
                placeholder="Full name of person in charge"
                value={contractPic}
                onChange={(e) => setContractPic(e.target.value)}
                error={errors.contractPic}
                required
              />
            </div>
            <div>
              <Input
                label="Phone"
                placeholder="+62 812 3456 7890"
                value={picPhone}
                onChange={(e) => setPicPhone(e.target.value)}
              />
            </div>
            <div>
              <Input
                label="Email"
                type="email"
                placeholder="pic@customer.com"
                value={picEmail}
                onChange={(e) => setPicEmail(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: Document */}
        <div className="space-y-3.5 pb-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#172B4D] uppercase tracking-wider">
            <Paperclip className="w-4 h-4 text-[#0070C0]" />
            <span>Document</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Attachment File Name or Reference
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. MSA_Final_Signed_2025.pdf"
                  value={attachment}
                  onChange={(e) => setAttachment(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-[#172B4D] focus:border-[#0070C0] focus:ring-1 focus:ring-[#0070C0]"
                />
                <button
                  type="button"
                  onClick={() => {
                    const cleanDoc = (documentNumber || 'CONTRACT').replace(/[^a-zA-Z0-9]/g, '_');
                    setAttachment(`${cleanDoc}_Signed.pdf`);
                  }}
                  className="px-3 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors shrink-0 cursor-pointer"
                >
                  Generate Name
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Supported formats: PDF, DOCX, ZIP (Max 25 MB).
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Notes
              </label>
              <textarea
                rows={3}
                placeholder="Special clauses, penalty limits, insurance requirements, or renewal notice period notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white text-[#172B4D] focus:border-[#0070C0] focus:ring-1 focus:ring-[#0070C0] resize-y"
              />
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <Button variant="ghost" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
            {contractToEdit ? 'Save Changes' : 'Create Contract'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
