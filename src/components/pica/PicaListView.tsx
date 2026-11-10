import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { PicaPriority, PicaStatus, Pica } from '../../types';
import {
  AlertOctagon,
  Plus,
  Search,
  Filter,
  Clock,
  Building2,
  FileCheck2,
  History,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Send,
  X,
  RotateCcw,
  Check,
  CheckCircle2,
  Calendar,
  User,
  ArrowRight
} from 'lucide-react';
import { StatusBadge } from '../layout/StatusBadge';
import { EntityBadge } from '../common/EntityBadge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { PicaDetailModal } from './PicaDetailModal';
import { CreatePicaModal } from './CreatePicaModal';

export const PicaListView: React.FC = () => {
  const {
    picas,
    scopedPicas,
    customers,
    opportunities,
    activities,
    users,
    currentUser,
    masterData,
    picaSubTab,
    setPicaSubTab,
    selectedPicaId,
    openPicaDetail,
    verifyPica,
    closePica,
    startPicaProgress,
    isAddPicaOpen,
    setIsAddPicaOpen,
    openCustomer360,
    showToast
  } = useApp();

  const todayStr = '2026-10-05';

  // Search and Filters
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [customerFilter, setCustomerFilter] = useState<string>('All');
  const [picFilter, setPicFilter] = useState<string>('All');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [dateFilter, setDateFilter] = useState<string>('');

  // Fast Verification Modal
  const [verifyingPica, setVerifyingPica] = useState<Pica | null>(null);
  const [verificationDecision, setVerificationDecision] = useState<'Approve' | 'Return'>('Approve');
  const [verificationNotes, setVerificationNotes] = useState('');

  const canVerify = currentUser.role === 'Head of Department' || currentUser.role === 'Super Admin';

  // Determine departments this user leads (or all for Super Admin)
  const managedDepartments = useMemo(() => {
    if (currentUser.role === 'Super Admin') {
      return masterData
        .filter(m => m.category === 'Department' && m.isActive)
        .map(m => m.name);
    }
    if (currentUser.role === 'Head of Department') {
      const depts = masterData
        .filter(m => m.category === 'Department' && (m.headUserId === currentUser.id || m.name.toLowerCase() === (currentUser.department || '').toLowerCase()))
        .map(m => m.name);

      if (depts.length === 0 && currentUser.department) {
        depts.push(currentUser.department);
      }
      return Array.from(new Set(depts));
    }
    return [];
  }, [masterData, currentUser]);

  const availableDepartments = useMemo(() => {
    const fromMaster = masterData.filter(m => m.category === 'Department' && m.isActive).map(m => m.name);
    if (currentUser.role === 'Head of Department') {
      return managedDepartments.length > 0 ? managedDepartments : fromMaster;
    }
    return fromMaster;
  }, [masterData, managedDepartments, currentUser.role]);

  // Filtered PICAs based on 3-tier scoping
  const filteredPicas = useMemo(() => {
    return scopedPicas.filter(p => {
      // Sub-tab scoping:
      if (picaSubTab === 'progress') {
        if (p.status !== 'Open' && p.status !== 'In Progress') return false;
      } else if (picaSubTab === 'verification') {
        if (p.status !== 'Waiting Verification') return false;

        // Departmental routing: Head of Department only sees tickets from their led departments
        if (currentUser.role === 'Head of Department' && managedDepartments.length > 0) {
          const pDept = p.department || users.find(u => u.id === p.picId)?.department || 'Commercial & Business Development';
          if (!managedDepartments.some(d => d.toLowerCase() === pDept.toLowerCase())) {
            return false;
          }
        }
      } else if (picaSubTab === 'history') {
        if (p.status !== 'Closed') return false;
      }

      // Department Filter
      if (departmentFilter !== 'All') {
        const pDept = p.department || users.find(u => u.id === p.picId)?.department || 'Commercial & Business Development';
        if (pDept.toLowerCase() !== departmentFilter.toLowerCase()) return false;
      }

      // Priority Filter
      if (priorityFilter !== 'All' && p.priority !== priorityFilter) return false;

      // Customer Filter
      if (customerFilter !== 'All' && p.customerId !== customerFilter) return false;

      // PIC Filter
      if (picFilter !== 'All' && p.picId !== picFilter) return false;

      // Date Filter (Created Date or Closed Date)
      if (dateFilter) {
        if (picaSubTab === 'history') {
          if (p.closedDate !== dateFilter && p.createdDate !== dateFilter) return false;
        } else {
          if (p.createdDate !== dateFilter && p.dueDate !== dateFilter) return false;
        }
      }

      // Search Query
      const q = search.toLowerCase().trim();
      if (q) {
        const match =
          p.issueTitle.toLowerCase().includes(q) ||
          p.customerName.toLowerCase().includes(q) ||
          p.picaNumber.toLowerCase().includes(q) ||
          p.picName.toLowerCase().includes(q) ||
          (p.department && p.department.toLowerCase().includes(q)) ||
          (p.rootCause && p.rootCause.toLowerCase().includes(q)) ||
          p.correctiveAction.toLowerCase().includes(q);
        if (!match) return false;
      }

      return true;
    });
  }, [scopedPicas, picaSubTab, priorityFilter, customerFilter, picFilter, departmentFilter, dateFilter, search, currentUser, managedDepartments, users]);

  // Counts for Badges based on scopedPicas
  const openCount = scopedPicas.filter(p => p.status === 'Open').length;
  const inProgressCount = scopedPicas.filter(p => p.status === 'In Progress').length;
  const waitingVerificationCount = scopedPicas.filter(p => {
    if (p.status !== 'Waiting Verification') return false;
    if (currentUser.role === 'Head of Department' && managedDepartments.length > 0) {
      const pDept = p.department || users.find(u => u.id === p.picId)?.department || 'Commercial & Business Development';
      return managedDepartments.some(d => d.toLowerCase() === pDept.toLowerCase());
    }
    return true;
  }).length;
  const closedCount = scopedPicas.filter(p => p.status === 'Closed').length;
  const overdueCount = scopedPicas.filter(p => p.dueDate < todayStr && p.status !== 'Closed').length;

  const handleConfirmVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingPica) return;

    if (verificationDecision === 'Return' && !verificationNotes.trim()) {
      showToast('Please provide notes explaining what revision is required.', 'warning');
      return;
    }

    if (verificationDecision === 'Approve') {
      verifyPica(verifyingPica.id, true, verificationNotes.trim() || 'Verified and approved by Department Head.');
      showToast(`PICA ${verifyingPica.picaNumber} approved and verified.`, 'success');
    } else {
      verifyPica(verifyingPica.id, false, verificationNotes.trim());
      showToast(`PICA ${verifyingPica.picaNumber} returned to PIC for revision.`, 'info');
    }

    setVerifyingPica(null);
    setVerificationNotes('');
  };

  const handleQuickClose = (picaId: string, picaNum: string) => {
    closePica(picaId);
    showToast(`PICA ${picaNum} closed and archived to History.`, 'success');
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-[#172B4D] tracking-tight">
              PICA Management
            </h1>
            {overdueCount > 0 && (
              <span className="text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full tabular-nums">
                {overdueCount} Overdue
              </span>
            )}
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              {filteredPicas.length} Cases
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Problem Identification & Corrective Action: Systematic root cause resolution, containment, and management verification.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsAddPicaOpen(true)}
          className="bg-rose-600 hover:bg-rose-700 shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create PICA</span>
        </Button>
      </div>

      {/* Sub Tabs: All, Create, Progress PICA, Verification, History */}
      <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl shadow-xs overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setPicaSubTab('all')}
          className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            picaSubTab === 'all'
              ? 'bg-[#0070C0] text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <span>All Cases</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            picaSubTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {picas.length}
          </span>
        </button>

        <button
          onClick={() => setIsAddPicaOpen(true)}
          className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            picaSubTab === 'create'
              ? 'bg-rose-600 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Plus className="w-3.5 h-3.5 text-rose-500" />
          <span>Create PICA</span>
        </button>

        <button
          onClick={() => setPicaSubTab('progress')}
          className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            picaSubTab === 'progress'
              ? 'bg-[#0070C0] text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-500" />
          <span>Progress PICA</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            picaSubTab === 'progress' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
          }`}>
            {openCount + inProgressCount}
          </span>
        </button>

        <button
          onClick={() => setPicaSubTab('verification')}
          className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            picaSubTab === 'verification'
              ? 'bg-purple-700 text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5 text-purple-600" />
          <span>Approval & Verification</span>
          {waitingVerificationCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-purple-100 text-purple-800">
              {waitingVerificationCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setPicaSubTab('history')}
          className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            picaSubTab === 'history'
              ? 'bg-[#0070C0] text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <History className="w-3.5 h-3.5 text-slate-400" />
          <span>History (Closed)</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
            picaSubTab === 'history' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
          }`}>
            {closedCount}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1 text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold text-[11px] uppercase tracking-wider">Filters:</span>
          </div>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:border-[#0070C0] cursor-pointer"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Customer Filter */}
          <select
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:border-[#0070C0] cursor-pointer max-w-[160px]"
          >
            <option value="All">All Customers</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:border-[#0070C0] cursor-pointer max-w-[170px]"
          >
            <option value="All">All Departments</option>
            {availableDepartments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* PIC Filter */}
          <select
            value={picFilter}
            onChange={(e) => setPicFilter(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:border-[#0070C0] cursor-pointer max-w-[140px]"
          >
            <option value="All">All PICs</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>

          {/* Date Filter */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-md px-2 py-0.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="text-xs text-slate-700 focus:outline-none bg-transparent cursor-pointer"
              title="Filter by date"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-slate-400 hover:text-slate-600 ml-1 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {(priorityFilter !== 'All' || customerFilter !== 'All' || departmentFilter !== 'All' || picFilter !== 'All' || dateFilter || search) && (
            <button
              onClick={() => {
                setPriorityFilter('All');
                setCustomerFilter('All');
                setDepartmentFilter('All');
                setPicFilter('All');
                setDateFilter('');
                setSearch('');
              }}
              className="text-xs text-rose-600 hover:underline font-medium cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search PICA #, issue, root cause..."
            className="w-full pl-9 pr-4 py-1.5 text-xs text-[#172B4D] bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#0070C0] transition-all"
          />
        </div>
      </div>

      {/* VIEW SUBPAGES */}

      {/* 1. VERIFICATION BANNER IF ON VERIFICATION TAB */}
      {picaSubTab === 'verification' && (
        <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-100 text-purple-700 rounded-lg shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-purple-950 text-sm">Quality Verification Queue</h3>
              <p className="text-purple-800 mt-0.5">
                {currentUser.role === 'Head of Department'
                  ? `Departmental Approver: ${currentUser.name} (${currentUser.position || 'Head of Department'}) — Managing ${managedDepartments.join(' & ')}.`
                  : 'Submitted corrective & preventive actions requiring Head of Department review before case closure.'}
              </p>
            </div>
          </div>
          <span className="font-semibold text-purple-900 bg-purple-200/60 px-3 py-1 rounded-lg shrink-0">
            {filteredPicas.length} Awaiting Verification
          </span>
        </div>
      )}

      {/* 2. HISTORY / CLOSED PICA TABLE VIEW */}
      {picaSubTab === 'history' ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
              Closed PICA Archive & Resolution History
            </span>
            <span className="text-[11px] text-slate-400">
              Showing {filteredPicas.length} resolved cases
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">PICA Number</th>
                  <th className="py-3 px-3">Entity</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-4">Issue</th>
                  <th className="py-3 px-3">PIC</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Created Date</th>
                  <th className="py-3 px-3">Closed Date</th>
                  <th className="py-3 px-3">Verified By</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPicas.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-12 text-center text-slate-400">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-400">
                        <History className="w-5 h-5 opacity-40" />
                      </div>
                      <p className="font-semibold text-slate-700 text-xs">No closed PICA records.</p>
                      <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-0.5">Resolved and verified PICA exceptions will be archived here.</p>
                    </td>
                  </tr>
                ) : (
                  filteredPicas.map(p => (
                    <tr
                      key={p.id}
                      onClick={() => openPicaDetail(p.id)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-normal text-slate-800">
                        {p.picaNumber}
                      </td>
                      <td className="py-3.5 px-3 font-normal">
                        <EntityBadge entity={p.entity} size="xs" />
                      </td>
                      <td className="py-3.5 px-3 font-normal text-[#172B4D]">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openCustomer360(p.customerId, 'pica');
                          }}
                          className="hover:text-[#0070C0] transition-colors cursor-pointer text-left font-normal"
                        >
                          {p.customerName}
                        </button>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-normal bg-slate-100 text-slate-700 border border-slate-200">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span>{p.department || users.find(u => u.id === p.picId)?.department || 'Commercial & Business Development'}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-normal text-[#172B4D] truncate">{p.issueTitle}</div>
                        <p className="text-slate-500 text-[11px] truncate font-normal">{p.correctiveAction}</p>
                      </td>
                      <td className="py-3.5 px-3 text-slate-700 font-normal">
                        {p.picName}
                      </td>
                      <td className="py-3.5 px-3">
                        <StatusBadge status={p.priority} size="sm" />
                      </td>
                      <td className="py-3.5 px-3 text-slate-500 font-mono font-normal">
                        {p.createdDate}
                      </td>
                      <td className="py-3.5 px-3 text-emerald-700 font-mono font-normal">
                        {p.closedDate || 'Resolved'}
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 font-normal">
                        {p.verifiedBy || 'Commercial Management'}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <span className="text-xs font-normal text-[#0070C0] hover:underline">
                          View Details →
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* STANDARD / PROGRESS / VERIFICATION TABLE VIEW */
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">PICA Number</th>
                  <th className="py-3 px-3">Entity</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-4">Issue Description</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">PIC</th>
                  <th className="py-3 px-3">Due Date</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPicas.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">
                      <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-400">
                        <AlertOctagon className="w-5 h-5 opacity-40" />
                      </div>
                      <p className="font-semibold text-slate-700 text-xs">
                        {picaSubTab === 'verification' ? 'No PICA waiting for verification.' : picaSubTab === 'progress' ? 'No active PICA cases in progress.' : 'No PICA records found.'}
                      </p>
                      <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-0.5">
                        {picaSubTab === 'verification' ? 'All submitted containment actions have been reviewed.' : 'Register a new PICA case to log operational exceptions.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredPicas.map(p => {
                    const isOverdue = p.dueDate < todayStr && p.status !== 'Closed';
                    const isWaitingVerification = p.status === 'Waiting Verification';
                    const isVerified = p.status === 'Verified';

                    return (
                      <tr
                        key={p.id}
                        onClick={() => openPicaDetail(p.id)}
                        className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                          isOverdue ? 'bg-rose-50/25' : isWaitingVerification ? 'bg-purple-50/20' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono font-normal text-slate-800 whitespace-nowrap">
                          {p.picaNumber}
                        </td>
                        <td className="py-3.5 px-3 font-normal">
                          <EntityBadge entity={p.entity} size="xs" />
                        </td>
                        <td className="py-3.5 px-3 font-normal text-slate-900">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openCustomer360(p.customerId, 'pica');
                            }}
                            className="hover:text-[#0070C0] transition-colors cursor-pointer text-left font-normal"
                          >
                            {p.customerName}
                          </button>
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-normal bg-slate-100 text-slate-700 border border-slate-200">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            <span>{p.department || users.find(u => u.id === p.picId)?.department || 'Commercial & Business Development'}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 max-w-md">
                          <div className="font-normal text-[#172B4D] hover:text-[#0070C0] transition-colors leading-snug">
                            {p.issueTitle}
                          </div>
                          <p className="text-slate-500 line-clamp-1 mt-0.5 font-normal">{p.issueDescription}</p>
                          {p.rootCause && (
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5 font-normal">
                              Root: {p.rootCause}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-slate-700 font-normal whitespace-nowrap">
                          {p.picName}
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <StatusBadge status={p.priority} size="sm" />
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap tabular-nums font-normal">
                          <div className={`font-normal ${isOverdue ? 'text-rose-600' : 'text-slate-700'}`}>
                            {p.dueDate}
                          </div>
                          {isOverdue && (
                            <span className="inline-block text-[10px] font-normal text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded uppercase tracking-wider mt-0.5">
                              OVERDUE
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <StatusBadge status={p.status} size="sm" />
                        </td>
                        <td className="py-3.5 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            {/* Fast Action 1: If Waiting Verification and User can verify */}
                            {isWaitingVerification && canVerify && (
                              <button
                                onClick={() => {
                                  setVerifyingPica(p);
                                  setVerificationDecision('Approve');
                                  setVerificationNotes('');
                                }}
                                className="px-2.5 py-1 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>Verify</span>
                              </button>
                            )}

                            {/* Fast Action 2: If Verified, Provide Close PICA button */}
                            {isVerified && (
                              <button
                                onClick={() => handleQuickClose(p.id, p.picaNumber)}
                                className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-2xs flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Close PICA</span>
                              </button>
                            )}

                            {/* Standard Review Link */}
                            <button
                              onClick={() => openPicaDetail(p.id)}
                              className="px-2.5 py-1 text-xs font-semibold text-[#0070C0] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            >
                              Review →
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fast Verification Modal (Approve or Return for Revision) */}
      {verifyingPica && (
        <Modal
          isOpen={true}
          onClose={() => setVerifyingPica(null)}
          title={`Verify PICA Case — ${verifyingPica.picaNumber}`}
          description={`Conduct commercial & operational verification for ${verifyingPica.customerName}: ${verifyingPica.issueTitle}`}
          maxWidth="lg"
        >
          <form onSubmit={handleConfirmVerification} className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-purple-50 p-2.5 rounded-lg border border-purple-200 text-xs text-purple-900 gap-2">
              <div className="flex items-center gap-1.5 font-semibold">
                <Building2 className="w-4 h-4 text-purple-700 shrink-0" />
                <span>Department: {verifyingPica.department || users.find(u => u.id === verifyingPica.picId)?.department || 'Commercial & Business Development'}</span>
              </div>
              <div className="flex items-center gap-1.5 font-semibold text-purple-800">
                <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0" />
                <span>Approver: {currentUser.name} ({currentUser.position || currentUser.role})</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Problem Statement</span>
                <p className="text-slate-800 font-medium mt-0.5">{verifyingPica.issueDescription}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Corrective Action</span>
                <p className="text-slate-800 font-medium mt-0.5">{verifyingPica.correctiveAction}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Preventive Action</span>
                <p className="text-slate-800 font-medium mt-0.5">{verifyingPica.preventiveAction}</p>
              </div>
            </div>

            {/* Decision Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#172B4D]">
                Verification Decision *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setVerificationDecision('Approve')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    verificationDecision === 'Approve'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-200'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Approve & Verify</span>
                </button>

                <button
                  type="button"
                  onClick={() => setVerificationDecision('Return')}
                  className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    verificationDecision === 'Return'
                      ? 'bg-amber-50 border-amber-500 text-amber-900 ring-2 ring-amber-200'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <RotateCcw className="w-4 h-4 text-amber-600" />
                  <span>Return for Revision</span>
                </button>
              </div>
            </div>

            {/* Verification Notes */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#172B4D]">
                Verification Notes {verificationDecision === 'Return' ? '*' : '(Optional)'}
              </label>
              <textarea
                rows={3}
                required={verificationDecision === 'Return'}
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder={
                  verificationDecision === 'Approve'
                    ? 'e.g. Corrective containment verified with customer PIC. Preventive SOP confirmed with logistics ops.'
                    : 'Explain why the corrective or preventive action is insufficient...'
                }
                className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setVerifyingPica(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className={verificationDecision === 'Approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'}
              >
                {verificationDecision === 'Approve' ? 'Confirm Approval' : 'Return to PIC'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Global Add PICA Modal */}
      <CreatePicaModal
        isOpen={isAddPicaOpen}
        onClose={() => setIsAddPicaOpen(false)}
      />

      {/* PICA Detail Modal */}
      {selectedPicaId && <PicaDetailModal />}
    </div>
  );
};
