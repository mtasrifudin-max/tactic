import React from 'react';
import { Contract } from '../../../types';
import { StatusBadge } from '../../layout/StatusBadge';
import { EntityBadge } from '../../common/EntityBadge';
import { FileText, GitBranch, ArrowRight, CornerDownRight, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

interface ContractHierarchyProps {
  currentContract: Contract;
  allCustomerContracts: Contract[];
  onSelectContract: (contract: Contract) => void;
}

export const ContractHierarchy: React.FC<ContractHierarchyProps> = ({
  currentContract,
  allCustomerContracts,
  onSelectContract,
}) => {
  // Determine root main contract
  const rootContract: Contract = currentContract.parentContractId
    ? allCustomerContracts.find(c => c.id === currentContract.parentContractId) || currentContract
    : currentContract;

  // Find all child contracts of root contract
  const childContracts = allCustomerContracts.filter(c => c.parentContractId === rootContract.id);

  // Group children by type
  const addenda = childContracts.filter(c => c.contractType === 'Addendum');
  const amendments = childContracts.filter(c => c.contractType === 'Amendment');
  const renewals = childContracts.filter(c => c.contractType === 'Renewal');
  const others = childContracts.filter(c => !['Addendum', 'Amendment', 'Renewal'].includes(c.contractType));

  const totalRelated = childContracts.length + 1; // root + children

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-50 text-[#0070C0]">
            <GitBranch className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
              Related Contract Hierarchy
            </h4>
            <p className="text-[11px] text-slate-400">
              Contract family lineage ({totalRelated} documents linked in this structure)
            </p>
          </div>
        </div>
      </div>

      {/* Visual Hierarchy Tree */}
      <div className="space-y-3 pt-1">
        {/* Root Contract Card */}
        <div
          onClick={() => onSelectContract(rootContract)}
          className={`group p-3.5 rounded-xl border transition-all cursor-pointer ${
            rootContract.id === currentContract.id
              ? 'bg-blue-50/50 border-[#0070C0] shadow-xs ring-1 ring-[#0070C0]/20'
              : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <div className="p-2 rounded-lg bg-white border border-slate-200 text-[#0070C0] shrink-0 mt-0.5">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-[#0070C0]">
                    Root · {rootContract.contractType}
                  </span>
                  <EntityBadge entity={rootContract.entity} size="xs" />
                  <span className="font-mono text-[11px] text-slate-500 font-semibold">
                    {rootContract.documentNumber}
                  </span>
                  {rootContract.id === currentContract.id && (
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                      Current View
                    </span>
                  )}
                </div>
                <h5 className="text-xs font-bold text-[#172B4D] mt-1 group-hover:text-[#0070C0] transition-colors">
                  {rootContract.contractTitle}
                </h5>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Period: <span className="font-medium text-slate-700">{rootContract.effectiveDate}</span> to{' '}
                  <span className="font-medium text-slate-700">{rootContract.expiryDate}</span> · TOP:{' '}
                  <span className="font-medium text-slate-700">{rootContract.top}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <StatusBadge status={rootContract.contractStatus} size="sm" />
              <button
                type="button"
                className="text-xs text-[#0070C0] group-hover:underline flex items-center gap-1 font-semibold"
              >
                <span>{rootContract.id === currentContract.id ? 'Viewing' : 'Inspect'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Child Contracts Tree Branch */}
        {childContracts.length === 0 ? (
          <div className="ml-6 pl-4 border-l-2 border-dashed border-slate-200 py-2">
            <p className="text-xs text-slate-400 italic">
              No Addendum, Amendment, or Renewal logged for this Master Contract yet. Use the actions menu above to register supplementary agreements.
            </p>
          </div>
        ) : (
          <div className="ml-4 sm:ml-6 pl-4 sm:pl-6 border-l-2 border-slate-200 space-y-2.5">
            {childContracts.map(child => {
              const isSelected = child.id === currentContract.id;
              let badgeColor = 'bg-amber-100 text-amber-800';
              if (child.contractType === 'Amendment') badgeColor = 'bg-indigo-100 text-indigo-800';
              if (child.contractType === 'Renewal') badgeColor = 'bg-emerald-100 text-emerald-800';

              return (
                <div
                  key={child.id}
                  onClick={() => onSelectContract(child)}
                  className={`group relative p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/50 border-[#0070C0] shadow-xs ring-1 ring-[#0070C0]/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80'
                  }`}
                >
                  {/* Branch connector line icon */}
                  <div className="absolute -left-[25px] sm:-left-[33px] top-4 text-slate-300">
                    <CornerDownRight className="w-4 h-4" />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600 shrink-0 mt-0.5">
                        <Layers className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${badgeColor}`}>
                            {child.contractType}
                          </span>
                          <EntityBadge entity={child.entity} size="xs" />
                          <span className="font-mono text-[11px] text-slate-500 font-semibold">
                            {child.documentNumber}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded">
                              Current View
                            </span>
                          )}
                        </div>
                        <h6 className="text-xs font-bold text-[#172B4D] mt-1 group-hover:text-[#0070C0] transition-colors">
                          {child.contractTitle}
                        </h6>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Period: <span className="font-medium text-slate-700">{child.effectiveDate}</span> to{' '}
                          <span className="font-medium text-slate-700">{child.expiryDate}</span> · TOP:{' '}
                          <span className="font-medium text-slate-700">{child.top}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                      <StatusBadge status={child.contractStatus} size="sm" />
                      <button
                        type="button"
                        className="text-xs text-[#0070C0] group-hover:underline flex items-center gap-1 font-semibold"
                      >
                        <span>{isSelected ? 'Viewing' : 'Inspect'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
