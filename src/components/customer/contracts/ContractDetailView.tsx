import React from 'react';
import { Customer, Contract, ContractType } from '../../../types';
import { StatusBadge } from '../../layout/StatusBadge';
import { EntityBadge } from '../../common/EntityBadge';
import { ContractHierarchy } from './ContractHierarchy';
import {
  ArrowLeft,
  FileText,
  Calendar,
  Building2,
  MapPin,
  CreditCard,
  User,
  Phone,
  Mail,
  Paperclip,
  Clock,
  Edit,
  PlusCircle,
  FilePlus,
  RefreshCw,
  Ban,
  CheckCircle2,
  Download,
  AlertTriangle,
  Info
} from 'lucide-react';

interface ContractDetailViewProps {
  contract: Contract;
  customer: Customer;
  allCustomerContracts: Contract[];
  onBack: () => void;
  onEdit: (contract: Contract) => void;
  onAddSubContract: (parent: Contract, type: ContractType) => void;
  onTerminate: (contract: Contract) => void;
  onSelectContract: (contract: Contract) => void;
}

export const ContractDetailView: React.FC<ContractDetailViewProps> = ({
  contract,
  customer,
  allCustomerContracts,
  onBack,
  onEdit,
  onAddSubContract,
  onTerminate,
  onSelectContract,
}) => {
  // Days calculation
  const today = '2026-10-05';
  const expDate = new Date(contract.expiryDate);
  const currDate = new Date(today);
  const diffDays = Math.ceil((expDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));

  const isExpired = contract.contractStatus === 'Expired' || diffDays < 0;
  const isExpiringSoon = contract.contractStatus === 'Expiring Soon' || (diffDays >= 0 && diffDays <= 90);
  const isTerminated = contract.contractStatus === 'Terminated';

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-150">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0070C0] transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Contracts</span>
          </button>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl font-bold text-[#172B4D] tracking-tight">
              {contract.contractTitle}
            </h2>
            <StatusBadge status={contract.contractStatus} size="sm" />
            <EntityBadge entity={contract.entity} size="sm" showFullName />
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <span>Doc No: <strong className="font-mono text-slate-700">{contract.documentNumber}</strong></span>
            <span>·</span>
            <span>Type: <strong className="text-slate-700">{contract.contractType}</strong></span>
            <span>·</span>
            <span>Created by: <strong className="text-slate-700">{contract.createdBy}</strong></span>
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onEdit(contract)}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:text-[#0070C0] hover:border-[#0070C0] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          <button
            onClick={() => onAddSubContract(contract, 'Addendum')}
            className="px-3 py-1.5 bg-blue-50 text-[#0070C0] border border-blue-200 hover:bg-blue-100/70 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Addendum</span>
          </button>

          <button
            onClick={() => onAddSubContract(contract, 'Amendment')}
            className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100/70 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FilePlus className="w-3.5 h-3.5" />
            <span>Add Amendment</span>
          </button>

          <button
            onClick={() => onAddSubContract(contract, 'Renewal')}
            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100/70 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Add Renewal</span>
          </button>

          {!isTerminated && (
            <button
              onClick={() => onTerminate(contract)}
              className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Terminate contract without deleting from audit log"
            >
              <Ban className="w-3.5 h-3.5" />
              <span>Terminate</span>
            </button>
          )}
        </div>
      </div>

      {/* Expiry Warning Callout if Expiring Soon or Terminated */}
      {isExpiringSoon && !isExpired && !isTerminated && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-amber-900">Contract Expiring Soon: </span>
            <span className="text-amber-800">
              This contract will expire on {contract.expiryDate} ({diffDays} days remaining). Initiate renewal or contract review in advance.
            </span>
          </div>
        </div>
      )}

      {isExpired && !isTerminated && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-rose-900">Contract Expired: </span>
            <span className="text-rose-800">
              This agreement concluded on {contract.expiryDate}. To continue operations with this customer, register a Renewal contract.
            </span>
          </div>
        </div>
      )}

      {isTerminated && (
        <div className="bg-slate-100 border border-slate-300 rounded-xl p-3.5 flex items-center gap-3">
          <Ban className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-slate-800">Contract Terminated: </span>
            <span className="text-slate-600">
              This agreement has been prematurely terminated. Preserved in system for commercial audit and history purposes.
            </span>
          </div>
        </div>
      )}

      {/* Main Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Core Contract Details & Terms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Contract Details */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0070C0]" />
                <span>Contract Overview & Scope</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Contract Title</span>
                <span className="font-semibold text-[#172B4D] text-sm">{contract.contractTitle}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Customer</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-[#172B4D]">{customer.name}</span>
                </div>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Entity</span>
                <div className="mt-1">
                  <EntityBadge entity={contract.entity} size="sm" showFullName />
                </div>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Contract Type</span>
                <span className="font-semibold text-slate-700 inline-block mt-0.5 px-2 py-0.5 bg-slate-100 rounded text-xs">
                  {contract.contractType}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Project / Location</span>
                <div className="flex items-center gap-1.5 mt-0.5 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium">{contract.projectLocation}</span>
                </div>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Document Number</span>
                <span className="font-mono font-semibold text-slate-800 bg-slate-50 px-2 py-1 rounded border border-slate-100 inline-block mt-0.5">
                  {contract.documentNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Period & Commercial Terms */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <Calendar className="w-4 h-4 text-[#0070C0]" />
              <span>Period & Commercial Terms</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Effective Date</span>
                <span className="font-semibold text-slate-800 text-sm mt-0.5 block">{contract.effectiveDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Expiry Date</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-semibold text-slate-800 text-sm">{contract.expiryDate}</span>
                  {!isExpired && !isTerminated && (
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {diffDays}d left
                    </span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">TOP (Term of Payment)</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#0070C0]" />
                  <span className="font-bold text-[#0070C0] text-sm">{contract.top}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Document & Notes */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <Paperclip className="w-4 h-4 text-[#0070C0]" />
              <span>Attachment & Special Notes</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px] mb-1.5">Attached Contract Document</span>
                {contract.attachment ? (
                  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200/80 max-w-md">
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="p-1.5 rounded bg-blue-100 text-[#0070C0]">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="font-mono text-xs font-semibold text-[#172B4D] truncate">
                        {contract.attachment}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const content = `%PDF-1.4\n% Contract: ${contract.contractTitle}\n% Number: ${contract.documentNumber}\n`;
                        const blob = new Blob([content], { type: 'application/pdf' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = contract.attachment || `${contract.documentNumber.replace(/[\/\s]/g, '_')}.pdf`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-[#0070C0] hover:bg-blue-50 rounded transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                ) : (
                  <span className="text-slate-400 italic">No document attached yet</span>
                )}
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] mb-1">Contract Notes & Clauses</span>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                  {contract.notes || 'No special notes or clauses recorded for this contract.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Contact Person & Hierarchy */}
        <div className="space-y-6">
          {/* Contact PIC Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="w-4 h-4 text-[#0070C0]" />
              <span>Contract PIC</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">PIC Name</span>
                <span className="font-bold text-[#172B4D] text-sm mt-0.5 block">{contract.contractPic}</span>
              </div>

              {contract.picPhone && (
                <div>
                  <span className="text-slate-400 block text-[11px]">Phone</span>
                  <a
                    href={`tel:${contract.picPhone}`}
                    className="flex items-center gap-2 text-slate-700 hover:text-[#0070C0] font-medium mt-0.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{contract.picPhone}</span>
                  </a>
                </div>
              )}

              {contract.picEmail && (
                <div>
                  <span className="text-slate-400 block text-[11px]">Email</span>
                  <a
                    href={`mailto:${contract.picEmail}`}
                    className="flex items-center gap-2 text-[#0070C0] hover:underline font-medium mt-0.5 truncate"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{contract.picEmail}</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Audit Metadata */}
          <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 text-xs text-slate-500 space-y-2">
            <div className="flex items-center gap-1.5 text-slate-700 font-semibold mb-1">
              <Info className="w-3.5 h-3.5 text-slate-400" />
              <span>Audit History</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Created:</span>
              <span className="font-medium text-slate-700">{contract.createdAt} ({contract.createdBy})</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Last Updated:</span>
              <span className="font-medium text-slate-700">{contract.updatedAt} ({contract.updatedBy})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contract Family Hierarchy Tree */}
      <ContractHierarchy
        currentContract={contract}
        allCustomerContracts={allCustomerContracts}
        onSelectContract={onSelectContract}
      />
    </div>
  );
};
