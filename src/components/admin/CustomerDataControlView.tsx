import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer } from '../../types';
import {
  ShieldCheck,
  Building2,
  Search,
  Filter,
  UserCheck,
  GitMerge,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  User,
  RotateCcw,
  Users,
  Briefcase,
  CalendarCheck,
  AlertOctagon,
  Edit2
} from 'lucide-react';
import { StatusBadge } from '../layout/StatusBadge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';

export const CustomerDataControlView: React.FC = () => {
  const {
    customers,
    updateCustomer,
    mergeCustomers,
    users,
    opportunities,
    activities,
    picas,
    currentUser,
    openCustomer360,
    showToast,
    clearAllTransactionData
  } = useApp();

  const isSuperAdmin = currentUser.role === 'Super Admin';

  const [activeTab, setActiveTab] = useState<'directory' | 'duplicates' | 'merge'>('directory');
  const [search, setSearch] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Change Owner Modal State
  const [transferCustomer, setTransferCustomer] = useState<Customer | null>(null);
  const [newOwnerId, setNewOwnerId] = useState('');
  const [transferReason, setTransferReason] = useState('');

  // Merge Workstation State
  const [primaryId, setPrimaryId] = useState(customers[0]?.id || '');
  const [duplicateId, setDuplicateId] = useState(customers[1]?.id || '');

  // 1. Filtered Customer Directory
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      if (ownerFilter !== 'All' && c.ownerId !== ownerFilter) return false;
      if (statusFilter !== 'All' && c.status !== statusFilter) return false;

      if (search) {
        const q = search.toLowerCase().trim();
        const match =
          c.name.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          (c.legalEntityName && c.legalEntityName.toLowerCase().includes(q)) ||
          (c.npwp && c.npwp.toLowerCase().includes(q)) ||
          (c.phone && c.phone.toLowerCase().includes(q)) ||
          (c.website && c.website.toLowerCase().includes(q)) ||
          (c.ownerName && c.ownerName.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [customers, ownerFilter, statusFilter, search]);

  // 2. Automated Duplicate Detection Engine
  const detectedDuplicates = useMemo(() => {
    const pairs: {
      customerA: Customer;
      customerB: Customer;
      matchReason: string;
      confidence: 'High' | 'Medium';
    }[] = [];

    for (let i = 0; i < customers.length; i++) {
      for (let j = i + 1; j < customers.length; j++) {
        const a = customers[i];
        const b = customers[j];

        // Check NPWP match
        if (a.npwp && b.npwp && a.npwp.replace(/[^0-9]/g, '') === b.npwp.replace(/[^0-9]/g, '')) {
          pairs.push({ customerA: a, customerB: b, matchReason: `Identical Tax ID (NPWP: ${a.npwp})`, confidence: 'High' });
          continue;
        }

        // Check Phone match
        if (a.phone && b.phone && a.phone.replace(/[^0-9]/g, '') === b.phone.replace(/[^0-9]/g, '')) {
          pairs.push({ customerA: a, customerB: b, matchReason: `Matching Corporate Phone (${a.phone})`, confidence: 'High' });
          continue;
        }

        // Check Website match
        if (a.website && b.website && a.website.toLowerCase() === b.website.toLowerCase()) {
          pairs.push({ customerA: a, customerB: b, matchReason: `Identical Corporate Website (${a.website})`, confidence: 'High' });
          continue;
        }

        // Check exact or normalized name match
        const normA = a.name.toLowerCase().replace(/pt\.|tbk|cv\.|indonesia|group/g, '').trim();
        const normB = b.name.toLowerCase().replace(/pt\.|tbk|cv\.|indonesia|group/g, '').trim();
        if (normA.length > 3 && normB.length > 3 && (normA === normB || normA.includes(normB) || normB.includes(normA))) {
          pairs.push({ customerA: a, customerB: b, matchReason: `Close Name Correlation ("${a.name}" & "${b.name}")`, confidence: 'Medium' });
        }
      }
    }

    return pairs;
  }, [customers]);

  // Active reps for ownership transfer
  const activeReps = users.filter(u => u.status === 'Active');

  const handleOpenTransfer = (c: Customer) => {
    setTransferCustomer(c);
    setNewOwnerId(c.ownerId);
    setTransferReason('');
  };

  const handleConfirmTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferCustomer || !newOwnerId) return;

    if (newOwnerId === transferCustomer.ownerId) {
      showToast('Selected user is already the current account owner.', 'warning');
      return;
    }

    const newOwner = users.find(u => u.id === newOwnerId);
    if (!newOwner) return;

    updateCustomer(transferCustomer.id, {
      ownerId: newOwner.id,
      ownerName: newOwner.name,
      ownerRole: newOwner.role,
      lastUpdated: '2026-10-05',
    });

    showToast(`Account "${transferCustomer.name}" transferred to ${newOwner.name} (${newOwner.role}).`, 'success');
    setTransferCustomer(null);
  };

  const handleToggleCustomerStatus = (c: Customer) => {
    const newStatus = c.status === 'Inactive' ? 'Active Customer' : 'Inactive';
    updateCustomer(c.id, {
      status: newStatus as any,
      lastUpdated: '2026-10-05',
    });
    showToast(`Customer "${c.name}" status set to ${newStatus}.`, 'info');
  };

  const handleExecuteMerge = (e: React.FormEvent) => {
    e.preventDefault();
    if (primaryId === duplicateId) {
      showToast('Primary master customer and duplicate customer must be distinct entities.', 'error');
      return;
    }

    const primaryCust = customers.find(c => c.id === primaryId);
    const duplicateCust = customers.find(c => c.id === duplicateId);

    if (!primaryCust || !duplicateCust) return;

    mergeCustomers(primaryId, duplicateId);
    showToast(`Merged duplicate "${duplicateCust.name}" into master account "${primaryCust.name}".`, 'success');
    setActiveTab('directory');
  };

  if (!isSuperAdmin) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-xl mx-auto my-12 space-y-4 shadow-sm">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-[#172B4D]">Super Admin Access Required</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Customer Data Control, ownership reassignment, and deduplication governance are restricted to Super Administrators.
          </p>
        </div>
      </div>
    );
  }

  const primaryCust = customers.find(c => c.id === primaryId);
  const duplicateCust = customers.find(c => c.id === duplicateId);

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-[#172B4D] tracking-tight">
              Customer Data Control & Governance
            </h1>
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              Super Admin Control
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Search all customer accounts, audit ownership assignments, transfer accounts, and manage duplicate records.
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Kosongkan semua data transaksi (customer, pipeline, aktivitas, follow-up, PICA, kontrak, profil operasional)? Master data dan akun pengguna akan tetap tersimpan.')) {
                clearAllTransactionData();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            title="Kosongkan semua data transaksi untuk pengujian dari awal"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset / Kosongkan Data Transaksi</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-xl shadow-xs overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setActiveTab('directory')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'directory'
              ? 'bg-[#0070C0] text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>All Accounts & Ownership ({customers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('duplicates')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'duplicates'
              ? 'bg-[#0070C0] text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
          <span>Duplicate Warnings</span>
          {detectedDuplicates.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-amber-100 text-amber-800">
              {detectedDuplicates.length} Potential
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('merge')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'merge'
              ? 'bg-[#0070C0] text-white font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <GitMerge className="w-3.5 h-3.5" />
          <span>Customer Merge Utility</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. ALL CUSTOMERS DIRECTORY & OWNERSHIP REASSIGNMENT           */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-semibold text-slate-500">Owner:</span>
              <select
                value={ownerFilter}
                onChange={(e) => setOwnerFilter(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:border-[#0070C0] cursor-pointer max-w-[150px]"
              >
                <option value="All">All Commercial Owners</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>

              <span className="font-semibold text-slate-500 ml-2">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:border-[#0070C0] cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Active Customer">Active Customer</option>
                <option value="Prospect">Prospect</option>
                <option value="Dormant">Dormant</option>
                <option value="Inactive">Inactive</option>
              </select>

              {(ownerFilter !== 'All' || statusFilter !== 'All' || search) && (
                <button
                  onClick={() => {
                    setOwnerFilter('All');
                    setStatusFilter('All');
                    setSearch('');
                  }}
                  className="text-xs text-rose-600 hover:underline font-medium ml-2 cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>

            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, code, NPWP, owner..."
                className="w-full pl-9 pr-4 py-1.5 text-xs text-[#172B4D] bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#0070C0]"
              />
            </div>
          </div>

          {/* Directory Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-3">Customer Name</th>
                    <th className="py-3 px-3">Legal Entity & Tax NPWP</th>
                    <th className="py-3 px-3">Commercial Owner</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Connected Records</th>
                    <th className="py-3 px-4 text-right">Governance Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No customer accounts found matching filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map(c => {
                      const oppsCount = opportunities.filter(o => o.customerId === c.id).length;
                      const actsCount = activities.filter(a => a.customerId === c.id).length;
                      const picaCount = picas.filter(p => p.customerId === c.id).length;

                      return (
                        <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-700 whitespace-nowrap">
                            {c.code}
                          </td>
                          <td className="py-3.5 px-3 font-semibold text-[#172B4D]">
                            <button
                              onClick={() => openCustomer360(c.id)}
                              className="hover:text-[#0070C0] hover:underline transition-colors text-left"
                            >
                              {c.name}
                            </button>
                            <div className="text-[11px] text-slate-400 font-normal">{c.industry} · {c.businessSegment}</div>
                          </td>
                          <td className="py-3.5 px-3">
                            <div className="text-slate-800 font-medium">{c.legalEntityName}</div>
                            <div className="text-[11px] text-slate-400 font-mono">NPWP: {c.npwp || 'Unspecified'}</div>
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <div className="font-semibold text-slate-800">{c.ownerName}</div>
                            <div className="text-[10px] text-slate-400">{c.ownerRole}</div>
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <StatusBadge status={c.status} size="sm" />
                          </td>
                          <td className="py-3.5 px-3 text-right whitespace-nowrap">
                            <span className="text-slate-500 font-medium">
                              {oppsCount} Deals · {actsCount} Acts · {picaCount} PICA
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenTransfer(c)}
                                className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-[#0070C0] hover:bg-blue-100 rounded-lg transition-colors cursor-pointer border border-blue-200"
                                title="Change Account Owner"
                              >
                                Transfer Owner
                              </button>

                              <button
                                onClick={() => handleToggleCustomerStatus(c)}
                                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                                  c.status === 'Inactive'
                                    ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                                    : 'text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200'
                                }`}
                              >
                                {c.status === 'Inactive' ? 'Activate' : 'Deactivate'}
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
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. DUPLICATE DETECTION & REVIEW WARNINGS                     */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'duplicates' && (
        <div className="space-y-4">
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-amber-950 text-sm">Automated Account Deduplication Scanner</h3>
              <p className="text-amber-900 mt-0.5 leading-relaxed">
                The scanner identifies potential redundant accounts sharing Tax NPWP, Email domains, or phonetic company names. Review each pair to reassign ownership or merge entities.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {detectedDuplicates.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-xs text-slate-400 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-bold text-slate-700">No duplicate customer entities detected.</p>
                <p>All active NPWP, email domains, and company legal profiles are unique.</p>
              </div>
            ) : (
              detectedDuplicates.map((pair, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                        {pair.confidence} Match Confidence
                      </span>
                      <span className="text-xs font-semibold text-slate-700">
                        {pair.matchReason}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setPrimaryId(pair.customerA.id);
                        setDuplicateId(pair.customerB.id);
                        setActiveTab('merge');
                      }}
                      className="px-3 py-1 bg-[#0070C0] text-white text-xs font-semibold rounded-lg hover:bg-[#005a9c] transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                    >
                      <GitMerge className="w-3.5 h-3.5" />
                      <span>Resolve in Merge Utility</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Record A */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-600">{pair.customerA.code}</span>
                        <StatusBadge status={pair.customerA.status} size="sm" />
                      </div>
                      <h4 className="font-bold text-[#172B4D]">{pair.customerA.name}</h4>
                      <p className="text-slate-500 text-[11px]">NPWP: {pair.customerA.npwp || '-'}</p>
                      <p className="text-slate-500 text-[11px]">Owner: {pair.customerA.ownerName} ({pair.customerA.ownerRole})</p>
                    </div>

                    {/* Record B */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-slate-600">{pair.customerB.code}</span>
                        <StatusBadge status={pair.customerB.status} size="sm" />
                      </div>
                      <h4 className="font-bold text-[#172B4D]">{pair.customerB.name}</h4>
                      <p className="text-slate-500 text-[11px]">NPWP: {pair.customerB.npwp || '-'}</p>
                      <p className="text-slate-500 text-[11px]">Owner: {pair.customerB.ownerName} ({pair.customerB.ownerRole})</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. CONTROLLED CUSTOMER MERGE UTILITY                         */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'merge' && (
        <form onSubmit={handleExecuteMerge} className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 space-y-6 max-w-4xl">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-[#172B4D] flex items-center gap-2">
              <GitMerge className="w-5 h-5 text-[#0070C0]" />
              <span>Controlled Customer Merge Utility</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Safely consolidate duplicate customer entities into a canonical master account. All opportunities, activities, follow-ups, contacts, and PICA records are migrated automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primary Master Account */}
            <div className="p-4 bg-blue-50/40 border border-blue-200 rounded-xl space-y-3 text-xs">
              <span className="font-bold text-[#0070C0] uppercase tracking-wider block">
                1. Primary Master Entity (Surviving Master)
              </span>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Select Master Record *</label>
                <select
                  value={primaryId}
                  onChange={(e) => setPrimaryId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-[#0070C0]"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code} · {c.ownerName})
                    </option>
                  ))}
                </select>
              </div>

              {primaryCust && (
                <div className="bg-white p-3 rounded-lg border border-blue-100 space-y-1 text-slate-700">
                  <div className="font-bold text-[#172B4D]">{primaryCust.name}</div>
                  <div className="text-[11px] text-slate-500">Legal: {primaryCust.legalEntityName}</div>
                  <div className="text-[11px] text-slate-500">NPWP: {primaryCust.npwp || 'Unspecified'}</div>
                  <div className="text-[11px] text-slate-500">Owner: {primaryCust.ownerName} ({primaryCust.ownerRole})</div>
                  <div className="text-[11px] text-blue-700 font-semibold pt-1">
                    Retained as Canonical Entity
                  </div>
                </div>
              )}
            </div>

            {/* Duplicate Account */}
            <div className="p-4 bg-rose-50/40 border border-rose-200 rounded-xl space-y-3 text-xs">
              <span className="font-bold text-rose-700 uppercase tracking-wider block">
                2. Duplicate Entity (Consolidated & Deactivated)
              </span>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Select Duplicate Record *</label>
                <select
                  value={duplicateId}
                  onChange={(e) => setDuplicateId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-rose-400"
                >
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code} · {c.ownerName})
                    </option>
                  ))}
                </select>
              </div>

              {duplicateCust && (
                <div className="bg-white p-3 rounded-lg border border-rose-100 space-y-1 text-slate-700">
                  <div className="font-bold text-[#172B4D]">{duplicateCust.name}</div>
                  <div className="text-[11px] text-slate-500">Legal: {duplicateCust.legalEntityName}</div>
                  <div className="text-[11px] text-slate-500">NPWP: {duplicateCust.npwp || 'Unspecified'}</div>
                  <div className="text-[11px] text-slate-500">Owner: {duplicateCust.ownerName} ({duplicateCust.ownerRole})</div>
                  <div className="text-[11px] text-rose-700 font-semibold pt-1">
                    Will be migrated and soft-deactivated
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="block font-bold">Safeguard Guarantee: Zero Data Loss</strong>
              <p className="leading-relaxed">
                All linked opportunities, contacts, daily activity logs, follow-up milestones, and PICA exception records belonging to "{duplicateCust?.name}" will be atomically reassigned to "{primaryCust?.name}".
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActiveTab('directory')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={primaryId === duplicateId}
              className="bg-[#0070C0] hover:bg-[#005a9c]"
            >
              <GitMerge className="w-3.5 h-3.5 mr-1" />
              Execute Controlled Merge
            </Button>
          </div>
        </form>
      )}

      {/* Transfer Ownership Modal */}
      {transferCustomer && (
        <Modal
          isOpen={true}
          onClose={() => setTransferCustomer(null)}
          title={`Transfer Account Ownership — ${transferCustomer.name}`}
          description={`Reassign commercial ownership from ${transferCustomer.ownerName} to another representative.`}
          maxWidth="md"
        >
          <form onSubmit={handleConfirmTransfer} className="space-y-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Current Account Owner</span>
                <span className="font-bold text-[#172B4D]">{transferCustomer.ownerName} ({transferCustomer.ownerRole})</span>
              </div>
            </div>

            <Select
              label="Select New Commercial Representative *"
              required
              value={newOwnerId}
              onChange={(e) => setNewOwnerId(e.target.value)}
            >
              {activeReps.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role} · {u.position})
                </option>
              ))}
            </Select>

            <div>
              <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                Reason for Reassignment (Audit Log) *
              </label>
              <textarea
                rows={2}
                required
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
                placeholder="e.g. Account territory realignment, representative portfolio rebalancing..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0070C0]/20 focus:border-[#0070C0] bg-white"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setTransferCustomer(null)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Confirm Ownership Transfer
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
