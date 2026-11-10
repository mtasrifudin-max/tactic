import React, { useState, useMemo } from 'react';
import { Customer, Contract, ContractType } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { StatusBadge } from '../../layout/StatusBadge';
import { EntityBadge } from '../../common/EntityBadge';
import { AddContractModal } from './AddContractModal';
import { ContractDetailView } from './ContractDetailView';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import {
  FileCheck,
  Plus,
  Calendar,
  AlertTriangle,
  Clock,
  Eye,
  Edit,
  PlusCircle,
  FilePlus,
  RefreshCw,
  Ban,
  FileText,
  Download,
  Search,
  Filter,
  Layers,
  ArrowUpDown,
  MoreVertical
} from 'lucide-react';

interface CustomerContractsTabProps {
  customer: Customer;
}

export const CustomerContractsTab: React.FC<CustomerContractsTabProps> = ({ customer }) => {
  const {
    contracts,
    updateContract,
    showToast,
    currentUser,
    selectedContractId,
    setSelectedContractId
  } = useApp();

  // Contracts belonging to this customer
  const customerContracts = useMemo(() => {
    return contracts.filter(c => c.customerId === customer.id);
  }, [contracts, customer.id]);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [contractToEdit, setContractToEdit] = useState<Contract | null>(null);
  const [parentContractForSub, setParentContractForSub] = useState<Contract | null>(null);
  const [initialTypeForModal, setInitialTypeForModal] = useState<ContractType>('Main Contract');

  // Terminate Dialog State
  const [contractToTerminate, setContractToTerminate] = useState<Contract | null>(null);
  const [isTerminateLoading, setIsTerminateLoading] = useState(false);

  // Search & Filter state
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Today reference
  const today = '2026-10-05';

  // Summary Metrics calculations
  const summaryMetrics = useMemo(() => {
    const active = customerContracts.filter(c => c.contractStatus === 'Active').length;
    const expiringSoon = customerContracts.filter(c => c.contractStatus === 'Expiring Soon').length;
    const expired = customerContracts.filter(c => c.contractStatus === 'Expired').length;

    // Nearest expiry among Active and Expiring Soon contracts
    const upcoming = customerContracts
      .filter(c => c.contractStatus !== 'Terminated' && c.contractStatus !== 'Expired' && c.expiryDate >= today)
      .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));

    let nearestExpiryText = '—';
    let nearestExpirySub = 'No upcoming expiries';

    if (upcoming.length > 0) {
      const nearest = upcoming[0];
      const expDate = new Date(nearest.expiryDate);
      const currDate = new Date(today);
      const diffDays = Math.ceil((expDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));

      // Format date e.g. "15 Nov 2026"
      const dateFormatted = expDate.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });

      nearestExpiryText = dateFormatted;
      nearestExpirySub = `${diffDays === 0 ? 'Expires today' : `In ${diffDays} days`} · ${nearest.documentNumber}`;
    }

    return {
      active,
      expiringSoon,
      expired,
      nearestExpiryText,
      nearestExpirySub,
    };
  }, [customerContracts, today]);

  // Filtered contracts list
  const filteredContracts = useMemo(() => {
    return customerContracts.filter(c => {
      const matchesSearch =
        c.contractTitle.toLowerCase().includes(searchFilter.toLowerCase()) ||
        c.documentNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
        c.projectLocation.toLowerCase().includes(searchFilter.toLowerCase()) ||
        c.contractPic.toLowerCase().includes(searchFilter.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' || c.contractStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [customerContracts, searchFilter, statusFilter]);

  // Handlers
  const handleOpenAdd = () => {
    setContractToEdit(null);
    setParentContractForSub(null);
    setInitialTypeForModal('Main Contract');
    setIsAddModalOpen(true);
  };

  const handleEdit = (contract: Contract) => {
    setContractToEdit(contract);
    setParentContractForSub(null);
    setInitialTypeForModal(contract.contractType);
    setIsAddModalOpen(true);
  };

  const handleAddSubContract = (parent: Contract, type: ContractType) => {
    setContractToEdit(null);
    setParentContractForSub(parent);
    setInitialTypeForModal(type);
    setIsAddModalOpen(true);
  };

  const handleTerminateConfirm = () => {
    if (!contractToTerminate) return;
    setIsTerminateLoading(true);

    try {
      const termNote = `[Terminated on ${new Date().toISOString().split('T')[0]} by ${currentUser.name}]`;
      const updatedNotes = contractToTerminate.notes
        ? `${contractToTerminate.notes}\n${termNote}`
        : termNote;

      updateContract(contractToTerminate.id, {
        contractStatus: 'Terminated',
        notes: updatedNotes,
        updatedBy: currentUser.name,
      });

      showToast(`Contract ${contractToTerminate.documentNumber} has been terminated.`, 'warning');
      setContractToTerminate(null);
    } catch (err: any) {
      showToast(err?.message || 'Failed to terminate contract.', 'error');
    } finally {
      setIsTerminateLoading(false);
    }
  };

  // If a contract detail is currently selected, render the detail page
  const selectedContract = customerContracts.find(c => c.id === selectedContractId);
  if (selectedContract) {
    return (
      <ContractDetailView
        contract={selectedContract}
        customer={customer}
        allCustomerContracts={customerContracts}
        onBack={() => setSelectedContractId(null)}
        onEdit={handleEdit}
        onAddSubContract={handleAddSubContract}
        onTerminate={(c) => setContractToTerminate(c)}
        onSelectContract={(c) => setSelectedContractId(c.id)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Page Header: Title + Add Contract Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-[#172B4D]">Contracts</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Service agreements, addenda, amendments, and renewal terms for {customer.name}
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-3.5 py-2 bg-[#0070C0] text-white text-xs font-semibold rounded-lg hover:bg-[#005a9c] flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Contract</span>
        </button>
      </div>

      {/* 2. Top Summary Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Contracts */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Active Contracts</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-700 tabular-nums tracking-tight">
            {summaryMetrics.active}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">In-force operations</div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Expiring Soon</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-700 tabular-nums tracking-tight">
            {summaryMetrics.expiringSoon}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Within next 90 days</div>
        </div>

        {/* Expired */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Expired</span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-700">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-700 tabular-nums tracking-tight">
            {summaryMetrics.expired}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Concluded agreements</div>
        </div>

        {/* Nearest Expiry */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Nearest Expiry</span>
            <div className="p-2 rounded-lg bg-blue-50 text-[#0070C0]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-base sm:text-lg font-bold text-[#172B4D] tabular-nums tracking-tight truncate">
            {summaryMetrics.nearestExpiryText}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 truncate">
            {summaryMetrics.nearestExpirySub}
          </div>
        </div>
      </div>

      {/* 3. Contract Table Section with Filters */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {/* Table Filter Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, doc no, location, PIC..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-[#0070C0] focus:ring-1 focus:ring-[#0070C0] transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:border-[#0070C0]"
            >
              <option value="ALL">All Statuses ({customerContracts.length})</option>
              <option value="Active">Active</option>
              <option value="Expiring Soon">Expiring Soon</option>
              <option value="Expired">Expired</option>
              <option value="Draft">Draft</option>
              <option value="Terminated">Terminated</option>
            </select>
          </div>
        </div>

        {/* Contract Table */}
        {filteredContracts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-blue-50 text-[#0070C0] rounded-full flex items-center justify-center mx-auto">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#172B4D]">
              {customerContracts.length === 0 ? 'No Contracts Recorded' : 'No Matching Contracts Found'}
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {customerContracts.length === 0
                ? 'Create master service agreements, addenda, or amendment records to track legal and commercial terms.'
                : 'Try adjusting your search query or status filter.'}
            </p>
            {customerContracts.length === 0 && (
              <button
                onClick={handleOpenAdd}
                className="mt-2 px-3.5 py-2 bg-[#0070C0] text-white text-xs font-semibold rounded-lg hover:bg-[#005a9c] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add First Contract</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 min-w-[200px]">Contract Title</th>
                  <th className="py-3 px-3 min-w-[140px]">Project / Location</th>
                  <th className="py-3 px-3 min-w-[150px]">Document Number</th>
                  <th className="py-3 px-3 min-w-[110px]">Type</th>
                  <th className="py-3 px-3 min-w-[80px]">Entity</th>
                  <th className="py-3 px-3 min-w-[100px]">Effective Date</th>
                  <th className="py-3 px-3 min-w-[100px]">Expiry Date</th>
                  <th className="py-3 px-3 min-w-[110px]">Status</th>
                  <th className="py-3 px-3 min-w-[100px]">Document</th>
                  <th className="py-3 px-4 text-right min-w-[180px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredContracts.map((contract) => {
                  const isTerminated = contract.contractStatus === 'Terminated';
                  const isChild = Boolean(contract.parentContractId);

                  return (
                    <tr
                      key={contract.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Contract Title */}
                      <td className="py-3 px-4">
                        <div className="flex items-start gap-2">
                          {isChild && (
                            <span
                              className="text-[10px] text-slate-400 font-mono mt-0.5 shrink-0"
                              title="Linked child agreement"
                            >
                              ↳
                            </span>
                          )}
                          <div>
                            <button
                              onClick={() => setSelectedContractId(contract.id)}
                              className="font-bold text-[#172B4D] hover:text-[#0070C0] text-left transition-colors cursor-pointer line-clamp-1 block"
                            >
                              {contract.contractTitle}
                            </button>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              PIC: {contract.contractPic} · {contract.top}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Project / Location */}
                      <td className="py-3 px-3 text-slate-600">
                        <span className="line-clamp-1" title={contract.projectLocation}>
                          {contract.projectLocation}
                        </span>
                      </td>

                      {/* Document Number */}
                      <td className="py-3 px-3">
                        <span className="font-mono text-[11px] text-slate-700 bg-slate-100/70 px-1.5 py-0.5 rounded border border-slate-200/60 inline-block">
                          {contract.documentNumber}
                        </span>
                      </td>

                      {/* Type */}
                      <td className="py-3 px-3">
                        <span className="text-[11px] font-medium text-slate-700 px-2 py-0.5 bg-slate-100 rounded">
                          {contract.contractType}
                        </span>
                      </td>

                      {/* Entity */}
                      <td className="py-3 px-3">
                        <EntityBadge entity={contract.entity} size="xs" />
                      </td>

                      {/* Effective Date */}
                      <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                        {contract.effectiveDate}
                      </td>

                      {/* Expiry Date */}
                      <td className="py-3 px-3 font-mono text-[11px]">
                        <span
                          className={
                            contract.contractStatus === 'Expiring Soon'
                              ? 'text-amber-700 font-bold'
                              : contract.contractStatus === 'Expired'
                              ? 'text-rose-700 font-bold'
                              : 'text-slate-600'
                          }
                        >
                          {contract.expiryDate}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <StatusBadge status={contract.contractStatus} size="sm" />
                      </td>

                      {/* Document */}
                      <td className="py-3 px-3">
                        {contract.attachment ? (
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
                              showToast(`Downloading "${contract.attachment || 'contract document'}"`, 'success', 'Contract Document');
                            }}
                            title={`Download ${contract.attachment}`}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0070C0] hover:underline cursor-pointer max-w-[120px] truncate"
                          >
                            <FileText className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{contract.attachment}</span>
                          </button>
                        ) : (
                          <span className="text-slate-300 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Actions: View, Edit, Add Addendum, Add Amendment, Add Renewal, Terminate */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1 flex-wrap">
                          {/* View */}
                          <button
                            onClick={() => setSelectedContractId(contract.id)}
                            title="View contract details and hierarchy"
                            className="px-2 py-1 text-slate-600 hover:text-[#0070C0] hover:bg-slate-100 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            View
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleEdit(contract)}
                            title="Edit contract terms"
                            className="px-2 py-1 text-slate-600 hover:text-[#0070C0] hover:bg-slate-100 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Edit
                          </button>

                          {/* Action Dropdown or quick action buttons */}
                          <ActionMenu
                            contract={contract}
                            onAddSubContract={handleAddSubContract}
                            onTerminate={(c) => setContractToTerminate(c)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info banner */}
        <div className="p-3 bg-slate-50/60 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Showing {filteredContracts.length} of {customerContracts.length} contracts</span>
          <span>Contracts are permanently retained for audit trail compliance.</span>
        </div>
      </div>

      {/* Add / Edit Contract Modal */}
      {isAddModalOpen && (
        <AddContractModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          customer={customer}
          contractToEdit={contractToEdit}
          parentContract={parentContractForSub}
          initialType={initialTypeForModal}
          existingCustomerContracts={customerContracts}
          onSuccess={(c) => {
            // If user added/edited, optionally select it or stay on list
          }}
        />
      )}

      {/* Terminate Confirmation Dialog */}
      {contractToTerminate && (
        <ConfirmDialog
          isOpen={Boolean(contractToTerminate)}
          onClose={() => setContractToTerminate(null)}
          onConfirm={handleTerminateConfirm}
          title="Terminate Contract"
          message={`Are you sure you want to terminate "${contractToTerminate.contractTitle}" (${contractToTerminate.documentNumber})? The contract status will be set to Terminated and retained in the system for commercial audit purposes.`}
          confirmText="Terminate Contract"
          variant="danger"
          isLoading={isTerminateLoading}
        />
      )}
    </div>
  );
};

// Sub-menu for Addendum, Amendment, Renewal, and Terminate
const ActionMenu: React.FC<{
  contract: Contract;
  onAddSubContract: (parent: Contract, type: ContractType) => void;
  onTerminate: (contract: Contract) => void;
}> = ({ contract, onAddSubContract, onTerminate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isTerminated = contract.contractStatus === 'Terminated';

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
        aria-label="More actions"
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-40 py-1.5 text-xs text-left animate-in fade-in-50 zoom-in-95 duration-100">
            <button
              onClick={() => {
                setIsOpen(false);
                onAddSubContract(contract, 'Addendum');
              }}
              className="w-full px-3 py-1.5 text-slate-700 hover:bg-blue-50 hover:text-[#0070C0] flex items-center gap-2 transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-[#0070C0]" />
              <span>Add Addendum</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onAddSubContract(contract, 'Amendment');
              }}
              className="w-full px-3 py-1.5 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <FilePlus className="w-3.5 h-3.5 text-indigo-600" />
              <span>Add Amendment</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onAddSubContract(contract, 'Renewal');
              }}
              className="w-full px-3 py-1.5 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
              <span>Add Renewal</span>
            </button>

            {!isTerminated && (
              <>
                <div className="my-1 border-t border-slate-100" />
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onTerminate(contract);
                  }}
                  className="w-full px-3 py-1.5 text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Ban className="w-3.5 h-3.5 text-rose-500" />
                  <span>Terminate</span>
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};
