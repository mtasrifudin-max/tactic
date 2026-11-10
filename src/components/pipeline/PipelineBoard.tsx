import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { OpportunityStage, Opportunity, LostReason } from '../../types';
import {
  Kanban,
  Table as TableIcon,
  Plus,
  Search,
  Filter,
  Calendar,
  Building2,
  DollarSign,
  Briefcase,
  AlertOctagon,
  ChevronRight,
  TrendingUp,
  MoreVertical,
  Eye,
  Edit
} from 'lucide-react';
import { StatusBadge } from '../layout/StatusBadge';
import { EntityBadge } from '../common/EntityBadge';
import { OpportunityDetailModal } from './OpportunityDetailModal';
import { AddOpportunityModal } from './AddOpportunityModal';
import { LostReasonModal } from './LostReasonModal';
import { Button } from '../ui/Button';

export const PipelineBoard: React.FC = () => {
  const {
    opportunities,
    scopedOpportunities,
    users,
    currentUser,
    updateOpportunityStage,
    openOpportunityDetail,
    selectedOpportunityId,
    isAddOpportunityOpen,
    setIsAddOpportunityOpen,
    openCustomer360,
    showToast
  } = useApp();

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [search, setSearch] = useState('');
  const [ownerFilter, setOwnerFilter] = useState<string>('All');
  const [serviceFilter, setServiceFilter] = useState<string>('All');

  // Drag and drop state
  const [draggedOppId, setDraggedOppId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<OpportunityStage | null>(null);

  // Lost modal state for drag-to-lost or manual mark
  const [lostTargetOpp, setLostTargetOpp] = useState<Opportunity | null>(null);

  // Edit Opportunity Modal state
  const [oppToEdit, setOppToEdit] = useState<Opportunity | null>(null);

  const stages: OpportunityStage[] = ['Qualification', 'Proposal', 'Negotiation', 'Award', 'Lost'];

  // Format currency
  const formatIDR = (val: number) => {
    if (val >= 1_000_000_000) {
      return `IDR ${(val / 1_000_000_000).toFixed(1)} B`;
    }
    if (val >= 1_000_000) {
      return `IDR ${(val / 1_000_000).toFixed(0)} M`;
    }
    return `IDR ${val.toLocaleString('id-ID')}`;
  };

  // Distinct Services from scoped opportunities
  const distinctServices = useMemo(() => {
    return Array.from(new Set(scopedOpportunities.map(o => o.service))).filter(Boolean);
  }, [scopedOpportunities]);

  // Filtered Opportunities based on 3-tier scoping
  const filteredOpportunities = useMemo(() => {
    return scopedOpportunities.filter(o => {
      const q = search.toLowerCase().trim();
      const matchSearch = !q ||
        o.opportunityName.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.code.toLowerCase().includes(q) ||
        o.service.toLowerCase().includes(q);

      if (!matchSearch) return false;
      if (ownerFilter !== 'All' && o.ownerId !== ownerFilter) return false;
      if (serviceFilter !== 'All' && o.service !== serviceFilter) return false;
      return true;
    });
  }, [scopedOpportunities, search, ownerFilter, serviceFilter]);

  // Total Open Pipeline Value (excluding Lost)
  const totalOpenValue = filteredOpportunities
    .filter(o => o.stage !== 'Lost')
    .reduce((sum, o) => sum + o.potentialRevenue, 0);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, oppId: string) => {
    e.dataTransfer.setData('text/plain', oppId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedOppId(oppId);
  };

  const handleDragOver = (e: React.DragEvent, stage: OpportunityStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stage) {
      setDragOverStage(stage);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if leaving the drop container
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, targetStage: OpportunityStage) => {
    e.preventDefault();
    setDragOverStage(null);
    const oppId = e.dataTransfer.getData('text/plain') || draggedOppId;
    setDraggedOppId(null);

    if (!oppId) return;
    const opp = opportunities.find(o => o.id === oppId);
    if (!opp || opp.stage === targetStage) return;

    if (targetStage === 'Lost') {
      setLostTargetOpp(opp);
    } else {
      updateOpportunityStage(oppId, targetStage);
      showToast(`Moved "${opp.opportunityName}" to ${targetStage}.`, 'info');
    }
  };

  const handleConfirmLost = (reason: LostReason, notes: string) => {
    if (!lostTargetOpp) return;
    updateOpportunityStage(lostTargetOpp.id, 'Lost', { reason, notes });
    showToast(`Opportunity "${lostTargetOpp.opportunityName}" marked as Lost (${reason}).`, 'warning');
    setLostTargetOpp(null);
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-[#172B4D] tracking-tight">
              Pipeline
            </h1>
            <span className="text-xs font-bold text-[#0070C0] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full tabular-nums">
              Open: {formatIDR(totalOpenValue)}
            </span>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
              {filteredOpportunities.length} Deals
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track commercial deals across Qualification, Proposal, Negotiation, and Award stages.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* View Mode Toggle: Kanban (Default) / Table View */}
          <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-lg text-xs font-medium shadow-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-[#0070C0] text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#0070C0] text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsAddOpportunityOpen(true)}
            className="shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Opportunity</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto text-xs">
          <div className="flex items-center gap-1 text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold text-[11px] uppercase tracking-wider">Filters:</span>
          </div>

          {/* Owner Filter */}
          <select
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:border-[#0070C0] cursor-pointer"
          >
            <option value="All">All Commercial Reps</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role.includes('Key') ? 'KAM' : u.role.includes('Development') ? 'BD' : 'Admin'})
              </option>
            ))}
          </select>

          {/* Service Filter */}
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:border-[#0070C0] cursor-pointer max-w-[160px]"
          >
            <option value="All">All Services</option>
            {distinctServices.map(srv => (
              <option key={srv} value={srv}>{srv}</option>
            ))}
          </select>

          {(ownerFilter !== 'All' || serviceFilter !== 'All' || search) && (
            <button
              onClick={() => {
                setOwnerFilter('All');
                setServiceFilter('All');
                setSearch('');
              }}
              className="text-xs text-rose-600 hover:underline font-medium cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search deal name, customer, service..."
            className="w-full pl-9 pr-4 py-1.5 text-xs text-[#172B4D] bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#0070C0] transition-all"
          />
        </div>
      </div>

      {/* VIEW 1: KANBAN BOARD (DEFAULT VIEW) */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {stages.map(stage => {
            const oppsInStage = filteredOpportunities.filter(o => o.stage === stage);
            const stageVal = oppsInStage.reduce((sum, o) => sum + o.potentialRevenue, 0);
            const isDragOver = dragOverStage === stage;

            let stageBadgeColor = 'text-slate-600 border-slate-200';
            if (stage === 'Qualification') stageBadgeColor = 'text-[#0070C0] border-blue-200 bg-blue-50/50';
            else if (stage === 'Proposal') stageBadgeColor = 'text-sky-700 border-sky-200 bg-sky-50/50';
            else if (stage === 'Negotiation') stageBadgeColor = 'text-amber-700 border-amber-200 bg-amber-50/50';
            else if (stage === 'Award') stageBadgeColor = 'text-emerald-700 border-emerald-200 bg-emerald-50/50';
            else if (stage === 'Lost') stageBadgeColor = 'text-rose-700 border-rose-200 bg-rose-50/50';

            return (
              <div
                key={stage}
                onDragOver={(e) => handleDragOver(e, stage)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage)}
                className={`rounded-2xl p-3 flex flex-col min-w-[245px] transition-all border ${
                  isDragOver
                    ? 'bg-blue-50/90 border-[#0070C0] ring-2 ring-[#0070C0]/20'
                    : 'bg-slate-100/70 border-slate-200/80'
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-[#172B4D]">{stage}</span>
                    <span className={`w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center border bg-white ${stageBadgeColor}`}>
                      {oppsInStage.length}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 tabular-nums">
                    {formatIDR(stageVal)}
                  </span>
                </div>

                {/* Cards Container with Drag and Drop */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[68vh] pr-0.5">
                  {oppsInStage.length === 0 ? (
                    <div className="py-10 text-center text-slate-400 text-xs border border-dashed border-slate-200/80 rounded-xl">
                      Drop deals here
                    </div>
                  ) : (
                    oppsInStage.map(opp => (
                      /* KANBAN CARD:
                         Show only:
                         1. Customer
                         2. Opportunity Name
                         3. Service
                         4. Potential Revenue
                         5. Probability
                         6. Target Closing
                         7. Owner
                         Compact and readable.
                      */
                      <div
                        key={opp.id}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, opp.id)}
                        onClick={() => openOpportunityDetail(opp.id)}
                        className={`bg-white border rounded-xl p-3.5 shadow-xs hover:border-[#0070C0] hover:shadow-md cursor-grab active:cursor-grabbing transition-all space-y-2 group ${
                          draggedOppId === opp.id ? 'opacity-50 border-dashed border-[#0070C0]' : 'border-slate-200'
                        }`}
                        title="Click to view details or drag to change stage"
                      >
                        {/* 1. Customer & Entity */}
                        <div className="flex items-center justify-between gap-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <EntityBadge entity={opp.entity} size="xs" />
                            <span className="text-[11px] font-medium text-slate-600 truncate max-w-[130px]">
                              {opp.customerName}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">
                            {opp.code}
                          </span>
                        </div>

                        {/* 2. Opportunity Name */}
                        <h4 className="text-xs font-bold text-[#172B4D] group-hover:text-[#0070C0] transition-colors leading-snug line-clamp-2">
                          {opp.opportunityName}
                        </h4>

                        {/* 3. Service */}
                        <div className="text-[10px] text-slate-600 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded truncate">
                          {opp.service}
                        </div>

                        {/* 4. Potential Revenue & 5. Probability */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <span className="text-xs font-bold text-[#0070C0] tabular-nums">
                            {formatIDR(opp.potentialRevenue)}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            opp.stage === 'Award'
                              ? 'bg-emerald-100 text-emerald-800'
                              : opp.stage === 'Lost'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {opp.probability}% win
                          </span>
                        </div>

                        {/* 6. Target Closing & 7. Owner */}
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                          <span className="flex items-center gap-1 text-slate-500">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{opp.targetClosingDate}</span>
                          </span>
                          <span className="font-semibold text-slate-700 truncate max-w-[90px]">
                            {opp.ownerName}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Opportunity</th>
                  <th className="py-3 px-3">Entity</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Service</th>
                  <th className="py-3 px-3">Stage</th>
                  <th className="py-3 px-3 text-right">Potential Revenue</th>
                  <th className="py-3 px-3 text-right">Probability</th>
                  <th className="py-3 px-3">Target Closing</th>
                  <th className="py-3 px-3">Owner</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOpportunities.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-400">
                        <Briefcase className="w-5 h-5 opacity-40" />
                      </div>
                      <p className="font-semibold text-slate-700 text-xs">No opportunities yet.</p>
                      <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-0.5">Register a new commercial opportunity to build your pipeline.</p>
                    </td>
                  </tr>
                ) : (
                  filteredOpportunities.map(opp => (
                    <tr
                      key={opp.id}
                      onClick={() => openOpportunityDetail(opp.id)}
                      className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                    >
                      {/* Opportunity Name & Code */}
                      <td className="py-3.5 px-4 font-normal text-[#172B4D]">
                        <div className="group-hover:text-[#0070C0] transition-colors font-normal">
                          {opp.opportunityName}
                        </div>
                        <span className="font-mono text-[10px] text-slate-400 font-normal">{opp.code}</span>
                      </td>

                      {/* Entity */}
                      <td className="py-3.5 px-3 font-normal">
                        <EntityBadge entity={opp.entity} size="xs" />
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-3 font-normal text-slate-700">
                        {opp.customerName}
                      </td>

                      {/* Service */}
                      <td className="py-3.5 px-3 text-slate-600 font-normal">
                        <span className="bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded text-[11px]">
                          {opp.service}
                        </span>
                      </td>

                      {/* Stage */}
                      <td className="py-3.5 px-3" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={opp.stage}
                          onChange={(e) => {
                            const newStg = e.target.value as OpportunityStage;
                            if (newStg === 'Lost') {
                              setLostTargetOpp(opp);
                            } else {
                              updateOpportunityStage(opp.id, newStg);
                              showToast(`Stage updated to ${newStg}.`, 'info');
                            }
                          }}
                          className="text-[11px] bg-white border border-slate-200 rounded px-2 py-1 font-normal text-slate-700 focus:outline-none focus:border-[#0070C0] cursor-pointer"
                        >
                          <option value="Qualification">Qualification</option>
                          <option value="Proposal">Proposal</option>
                          <option value="Negotiation">Negotiation</option>
                          <option value="Award">Award</option>
                          <option value="Lost">Lost</option>
                        </select>
                      </td>

                      {/* Potential Revenue */}
                      <td className="py-3.5 px-3 text-right font-normal text-[#0070C0] tabular-nums">
                        {formatIDR(opp.potentialRevenue)}
                      </td>

                      {/* Probability */}
                      <td className="py-3.5 px-3 text-right tabular-nums">
                        <span className="font-normal text-slate-700">{opp.probability}%</span>
                      </td>

                      {/* Target Closing */}
                      <td className="py-3.5 px-3 text-slate-500 tabular-nums font-normal">
                        {opp.targetClosingDate}
                      </td>

                      {/* Owner */}
                      <td className="py-3.5 px-3 text-slate-700 font-normal">
                        {opp.ownerName}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openOpportunityDetail(opp.id)}
                            className="p-1 text-slate-400 hover:text-[#0070C0] hover:bg-slate-100 rounded transition-colors cursor-pointer"
                            title="View Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setOppToEdit(opp)}
                            className="p-1 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                            title="Edit Opportunity"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Opportunity Detail Modal */}
      {selectedOpportunityId && <OpportunityDetailModal />}

      {/* Add Opportunity Modal */}
      <AddOpportunityModal
        isOpen={isAddOpportunityOpen || Boolean(oppToEdit)}
        onClose={() => {
          setIsAddOpportunityOpen(false);
          setOppToEdit(null);
        }}
        opportunityToEdit={oppToEdit}
      />

      {/* Lost Reason Modal for Drag to Lost or Table stage switch */}
      <LostReasonModal
        isOpen={Boolean(lostTargetOpp)}
        onClose={() => setLostTargetOpp(null)}
        opportunityName={lostTargetOpp?.opportunityName || ''}
        onConfirm={handleConfirmLost}
      />
    </div>
  );
};
