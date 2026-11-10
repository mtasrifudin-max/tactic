import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ContactPerson, ContactRoleType, EntityId } from '../../types';
import {
  Building2,
  Phone,
  Mail,
  Globe,
  Plus,
  Calendar,
  Briefcase,
  AlertOctagon,
  Clock,
  User,
  ArrowLeft,
  FileText,
  MapPin,
  ShieldAlert,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  FileCheck,
  Layers,
  DollarSign,
  FolderOpen
} from 'lucide-react';
import { StatusBadge } from '../layout/StatusBadge';
import { EntityBadge } from '../common/EntityBadge';
import { CustomerContractsTab } from './contracts/CustomerContractsTab';
import { CustomerOperationsTab } from './operations/CustomerOperationsTab';
import { CustomerFinancialTab } from './financial/CustomerFinancialTab';
import { CustomerDocumentsTab } from './documents/CustomerDocumentsTab';
import { AccountAttentionSection } from './attention/AccountAttentionSection';

export const Customer360: React.FC = () => {
  const {
    scopedCustomers: customers,
    selectedCustomerId,
    customer360Tab,
    setCustomer360Tab,
    setActiveMenu,
    contacts,
    contracts,
    operationalProfiles,
    financialRecords,
    scopedOpportunities: opportunities,
    scopedActivities: activities,
    scopedPicas: picas,
    scopedFollowUps: followUps,
    addContact,
    openOpportunityDetail,
    openPicaDetail,
    openContractDetail,
    setIsAddActivityOpen,
    setActivityPreselectedCustomerId,
    setIsAddOpportunityOpen,
    setOpportunityPreselectedCustomerId,
    setIsAddPicaOpen,
    setPicaPreselectedCustomerId,
    showToast,
  } = useApp();

  const customer = customers.find(c => c.id === selectedCustomerId) || customers[0];

  // Modals for Contacts
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactJob, setNewContactJob] = useState('');
  const [newContactDept, setNewContactDept] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactWa, setNewContactWa] = useState('');
  const [newContactRoleTypes, setNewContactRoleTypes] = useState<ContactRoleType[]>(['Decision Maker']);
  const [newContactNotes, setNewContactNotes] = useState('');

  if (!customer) {
    return (
      <div className="p-8 text-center text-slate-500">
        <Building2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
        <p>No customer selected.</p>
        <button
          onClick={() => setActiveMenu('customer-list')}
          className="mt-3 px-4 py-1.5 bg-[#0070C0] text-white text-xs font-semibold rounded-lg"
        >
          Go to Customer List
        </button>
      </div>
    );
  }

  // Relations
  const customerContacts = contacts.filter(c => c.customerId === customer.id);
  const customerContracts = contracts.filter(c => c.customerId === customer.id);
  const customerOperationalProfiles = operationalProfiles.filter(p => p.customerId === customer.id);
  const customerOpps = opportunities.filter(o => o.customerId === customer.id);
  const customerActivities = activities.filter(a => a.customerId === customer.id);
  const customerPicas = picas.filter(p => p.customerId === customer.id);

  const openOpps = customerOpps.filter(o => o.stage !== 'Award' && o.stage !== 'Lost');
  const openPicas = customerPicas.filter(p => p.status !== 'Closed');

  // Operational metrics for Overview & Customer 360 KPI (use active operational records, avoid double counting)
  const activeOperationalProfiles = customerOperationalProfiles.filter(p => p.status === 'Active');
  const customerActiveTotalUnits = activeOperationalProfiles.reduce((sum, p) => sum + (p.totalUnit || 0), 0);
  const uniqueActiveProjects = Array.from(new Set(activeOperationalProfiles.map(p => p.projectLocation.trim()).filter(Boolean)));
  const uniqueActiveAreas = Array.from(new Set(activeOperationalProfiles.map(p => p.operationalRegion.trim()).filter(Boolean)));
  const uniqueActiveServices = Array.from(new Set(activeOperationalProfiles.map(p => p.service.trim()).filter(Boolean)));

  // Contract Summary data for Overview
  const activeContractsList = customerContracts.filter(c => c.contractStatus === 'Active');
  const latestActiveContract = activeContractsList[0] || customerContracts[0];
  const activeContractsCount = activeContractsList.length;

  const customerActiveContractsCount = customerContracts.filter(c => c.contractStatus === 'Active').length;
  const customerExpiringContractsCount = customerContracts.filter(c => c.contractStatus === 'Expiring Soon').length;
  const customerExpiredContractsCount = customerContracts.filter(c => c.contractStatus === 'Expired').length;

  const todayStr = '2026-10-05';
  const upcomingContractExpiries = customerContracts
    .filter(c => c.contractStatus !== 'Terminated' && c.contractStatus !== 'Expired' && c.expiryDate >= todayStr)
    .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));
  const nearestExpiringContract = upcomingContractExpiries[0];

  // Customer Financial Performance calculations (Year 2026 or available records)
  const customerFinancials = useMemo(() => {
    return financialRecords.filter(r => r.customerId === customer.id);
  }, [financialRecords, customer.id]);

  const currentFinancialYear = 2026;
  const currentYearFinancials = useMemo(() => {
    const forYear = customerFinancials.filter(r => r.year === currentFinancialYear);
    return forYear.length > 0 ? forYear : customerFinancials;
  }, [customerFinancials, currentFinancialYear]);

  const hasCustomerFinancialData = currentYearFinancials.length > 0;

  // YTD sums - strictly do NOT sum percentages, only nominal values
  const customerRevenueYTD = useMemo(() => {
    if (!hasCustomerFinancialData) return null;
    return currentYearFinancials.reduce((sum, r) => sum + (typeof r.revenue === 'number' && isFinite(r.revenue) ? r.revenue : 0), 0);
  }, [hasCustomerFinancialData, currentYearFinancials]);

  const customerDirectMarginYTD = useMemo(() => {
    if (!hasCustomerFinancialData) return null;
    return currentYearFinancials.reduce((sum, r) => sum + (typeof r.directMargin === 'number' && isFinite(r.directMargin) ? r.directMargin : 0), 0);
  }, [hasCustomerFinancialData, currentYearFinancials]);

  const customerTargetDM = useMemo(() => {
    if (!hasCustomerFinancialData) return null;
    return currentYearFinancials.reduce((sum, r) => sum + (typeof r.targetDirectMargin === 'number' && isFinite(r.targetDirectMargin) ? r.targetDirectMargin : 0), 0);
  }, [hasCustomerFinancialData, currentYearFinancials]);

  // AR and Unbill are latest reporting month snapshots
  const { customerLatestAR, customerLatestUnbill } = useMemo(() => {
    if (!hasCustomerFinancialData) return { customerLatestAR: null, customerLatestUnbill: null };
    const latestMonth = currentYearFinancials.reduce((max, r) => Math.max(max, r.month), 0);
    const records = currentYearFinancials.filter(r => r.month === latestMonth);
    const arSum = records.reduce((sum, r) => sum + (typeof r.ar === 'number' && isFinite(r.ar) ? r.ar : 0), 0);
    const unbillSum = records.reduce((sum, r) => sum + (typeof r.unbill === 'number' && isFinite(r.unbill) ? r.unbill : 0), 0);
    return { customerLatestAR: arSum, customerLatestUnbill: unbillSum };
  }, [hasCustomerFinancialData, currentYearFinancials]);

  // Financial formatting - strictly never outputs NaN/Infinity
  const formatCompactFinancial = (val?: number | null) => {
    if (val === undefined || val === null || isNaN(val) || !isFinite(val)) return '—';
    const abs = Math.abs(val);
    if (abs >= 1_000_000_000) {
      return `IDR ${(val / 1_000_000_000).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}B`;
    }
    if (abs >= 1_000_000) {
      return `IDR ${(val / 1_000_000).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}M`;
    }
    return `IDR ${val.toLocaleString('id-ID')}`;
  };

  const formatFullFinancial = (val?: number | null) => {
    if (val === undefined || val === null || isNaN(val) || !isFinite(val)) return '—';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val).replace('Rp', 'IDR ');
  };

  // Format currency for pipeline and activities
  const formatIDR = (val: number) => {
    if (val >= 1_000_000_000) {
      return `IDR ${(val / 1_000_000_000).toFixed(1)} B`;
    }
    if (val >= 1_000_000) {
      return `IDR ${(val / 1_000_000).toFixed(0)} M`;
    }
    return `IDR ${val.toLocaleString('id-ID')}`;
  };

  const roleTypeOptions: ContactRoleType[] = [
    'Decision Maker',
    'Influencer',
    'Procurement',
    'User',
    'Operational PIC',
    'Finance PIC',
    'Other'
  ];

  const toggleRoleType = (rt: ContactRoleType) => {
    if (newContactRoleTypes.includes(rt)) {
      setNewContactRoleTypes(newContactRoleTypes.filter(r => r !== rt));
    } else {
      setNewContactRoleTypes([...newContactRoleTypes, rt]);
    }
  };

  const handleAddContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim()) return;

    addContact({
      customerId: customer.id,
      customerName: customer.name,
      name: newContactName.trim(),
      jobTitle: newContactJob.trim(),
      department: newContactDept.trim(),
      email: newContactEmail.trim(),
      phone: newContactPhone.trim(),
      whatsapp: newContactWa.trim() || newContactPhone.trim(),
      roleTypes: newContactRoleTypes.length ? newContactRoleTypes : ['Other'],
      notes: newContactNotes.trim(),
    });

    setIsAddContactModalOpen(false);
    setNewContactName('');
    setNewContactJob('');
    setNewContactDept('');
    setNewContactEmail('');
    setNewContactPhone('');
    setNewContactWa('');
    setNewContactNotes('');
  };

  const primaryEntity = customer.operatingEntities && customer.operatingEntities.length > 0
    ? customer.operatingEntities[0]
    : 'PDT' as EntityId;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Return to List */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveMenu('customer-list')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0070C0] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customer List</span>
        </button>
        <span className="text-xs font-mono text-slate-400">
          ID: {customer.code}
        </span>
      </div>

      {/* Customer 360 Header - Compact, Modern, Executive-Friendly */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl font-bold text-[#172B4D] tracking-tight">
                {customer.name}
              </h1>
              <span className="font-mono text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {customer.name.split(' ')[0]}
              </span>
              <StatusBadge status={customer.status} size="sm" />
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-normal bg-emerald-50 text-emerald-700 border border-emerald-100">
                KYC: VERIFIED
              </span>
              <EntityBadge entity={primaryEntity} size="sm" />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Segment: <strong className="text-slate-700">{customer.businessSegment || customer.industry}</strong></span>
              <span aria-hidden="true">·</span>
              <span>Owner: <strong className="text-[#172B4D]">{customer.ownerName}</strong></span>
              <span aria-hidden="true">·</span>
              <span>Department: <strong className="text-slate-700">COMMERCIAL</strong></span>
              <span aria-hidden="true">·</span>
              <span>Entity: <strong className="text-slate-700">{primaryEntity}</strong></span>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setActivityPreselectedCustomerId(customer.id);
                setIsAddActivityOpen(true);
              }}
              className="px-3 py-1.5 bg-blue-50 text-[#0070C0] border border-blue-200 hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Activity</span>
            </button>

            <button
              onClick={() => {
                setOpportunityPreselectedCustomerId(customer.id);
                setIsAddOpportunityOpen(true);
              }}
              className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Opportunity</span>
            </button>

            <button
              onClick={() => {
                setPicaPreselectedCustomerId(customer.id);
                setIsAddPicaOpen(true);
              }}
              className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ PICA</span>
            </button>

            <button
              onClick={() => {
                setCustomer360Tab('contracts');
              }}
              className="px-3 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Contract</span>
            </button>

            <button
              onClick={() => {
                setCustomer360Tab('operations');
              }}
              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Operations</span>
            </button>
          </div>
        </div>

        {/* Compact KPI Area (8 compact KPI cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 pt-4 border-t border-slate-100">
          <div className="bg-slate-50/70 border border-slate-200/60 rounded-lg p-2.5">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Revenue YTD</div>
            <div className="text-xs font-bold text-[#172B4D] tabular-nums mt-1 truncate" title={formatFullFinancial(customerRevenueYTD)}>
              {formatCompactFinancial(customerRevenueYTD)}
            </div>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/60 rounded-lg p-2.5">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Direct Margin</div>
            <div className="text-xs font-bold text-emerald-700 tabular-nums mt-1 truncate" title={formatFullFinancial(customerDirectMarginYTD)}>
              {formatCompactFinancial(customerDirectMarginYTD)}
            </div>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/60 rounded-lg p-2.5">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Target DM</div>
            <div className="text-xs font-bold text-slate-700 tabular-nums mt-1 truncate" title={formatFullFinancial(customerTargetDM)}>
              {formatCompactFinancial(customerTargetDM)}
            </div>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/60 rounded-lg p-2.5">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">AR</div>
            <div className="text-xs font-bold text-amber-700 tabular-nums mt-1 truncate" title={formatFullFinancial(customerLatestAR)}>
              {formatCompactFinancial(customerLatestAR)}
            </div>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/60 rounded-lg p-2.5">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Unbill</div>
            <div className="text-xs font-bold text-blue-700 tabular-nums mt-1 truncate" title={formatFullFinancial(customerLatestUnbill)}>
              {formatCompactFinancial(customerLatestUnbill)}
            </div>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/60 rounded-lg p-2.5">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Total Unit</div>
            <div className="text-xs font-bold text-[#172B4D] tabular-nums mt-1">
              {customerActiveTotalUnits > 0 ? customerActiveTotalUnits : '—'}
            </div>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/60 rounded-lg p-2.5">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Active Contract</div>
            <div className="text-xs font-bold text-[#172B4D] tabular-nums mt-1">
              {activeContractsCount > 0 ? activeContractsCount : '—'}
            </div>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/60 rounded-lg p-2.5">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Open Opp</div>
            <div className="text-xs font-bold text-[#0070C0] tabular-nums mt-1">{openOpps.length}</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto no-scrollbar">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'contacts', label: `Contacts (${customerContacts.length})` },
          { key: 'contracts', label: `Contracts (${customerContracts.length})` },
          { key: 'operations', label: `Operations (${customerOperationalProfiles.length})` },
          { key: 'financial', label: 'Financial' },
          { key: 'activity', label: `Activity (${customerActivities.length})` },
          { key: 'pipeline', label: `Pipeline (${customerOpps.length})` },
          { key: 'pica', label: `PICA (${customerPicas.length})` },
          { key: 'documents', label: `Documents (${customerContracts.length + (customerOperationalProfiles.length * 2) + customerPicas.length + 4})` },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setCustomer360Tab(tab.key as any)}
            className={`pb-3 px-3 text-xs font-semibold transition-all relative shrink-0 cursor-pointer ${
              customer360Tab === tab.key
                ? 'text-[#0070C0] border-b-2 border-[#0070C0]'
                : 'text-slate-500 hover:text-[#172B4D]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {customer360Tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Section 1: Customer Information */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider border-b border-slate-100 pb-2">
                Customer Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Customer Name</span>
                  <span className="font-semibold text-[#172B4D]">{customer.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Short Name</span>
                  <span className="font-semibold text-[#172B4D]">{customer.name.split(' ')[0]}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Segment</span>
                  <span className="font-semibold text-slate-700">{customer.businessSegment || customer.industry}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">KYC Status</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-normal bg-emerald-50 text-emerald-700 border border-emerald-100">
                    VERIFIED
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">PIC / Owner</span>
                  <span className="font-semibold text-[#172B4D]">{customer.ownerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Department Head</span>
                  <span className="font-semibold text-slate-700">Bambang Sudibyo</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Department</span>
                  <span className="font-semibold text-slate-700">Commercial & Non Energy</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Operational Region</span>
                  <span className="font-semibold text-slate-700">{customer.city}, {customer.province}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">NPWP</span>
                  <span className="font-mono text-slate-700">{customer.npwp || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">NIB</span>
                  <span className="font-mono text-slate-700">{customer.nib || '—'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Website</span>
                  {customer.website ? (
                    <a
                      href={customer.website}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-[#0070C0] hover:underline flex items-center gap-1"
                    >
                      <span>{customer.website.replace('https://', '')}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : '—'}
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Customer Type</span>
                  <span className="font-medium text-slate-700">{customer.customerType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Status</span>
                  <StatusBadge status={customer.status} size="sm" />
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[11px] mb-1">Address</span>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {customer.address || `${customer.city}, ${customer.province}, ${customer.country}`}
                </p>
              </div>
            </div>

            {/* Right Column: Summaries */}
            <div className="space-y-4">
              {/* Section 2: Contract Summary */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
                    Contract Summary
                  </h3>
                  <button
                    onClick={() => setCustomer360Tab('contracts')}
                    className="text-[11px] font-semibold text-[#0070C0] hover:underline cursor-pointer"
                  >
                    View Contracts ({customerContracts.length})
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Entity</span>
                    <span className="font-semibold text-[#172B4D]">
                      {latestActiveContract ? latestActiveContract.entity : primaryEntity}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">TOP (Payment Term)</span>
                    <span className="font-semibold text-slate-700">
                      {latestActiveContract ? latestActiveContract.top : (customer.paymentTerm || '—')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Active Contract</span>
                    <span className="font-semibold text-slate-700">
                      {activeContractsCount > 0 ? (
                        <span className="text-emerald-700 font-bold">
                          {activeContractsCount} Active
                        </span>
                      ) : customerContracts.length > 0 ? (
                        <span className="text-slate-500">
                          0 Active ({customerContracts.length} Total)
                        </span>
                      ) : (
                        '—'
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nearest Expiry Date</span>
                    <span className="font-semibold text-slate-700">
                      {nearestExpiringContract ? (
                        <span className={nearestExpiringContract.contractStatus === 'Expiring Soon' ? 'text-amber-700 font-bold' : 'text-slate-800'}>
                          {nearestExpiringContract.expiryDate}
                        </span>
                      ) : (
                        '—'
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 3: Operational Summary */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
                    Operational Summary
                  </h3>
                  <button
                    onClick={() => setCustomer360Tab('operations')}
                    className="text-[11px] font-semibold text-[#0070C0] hover:underline cursor-pointer"
                  >
                    View Operations ({customerOperationalProfiles.length})
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Total Unit</span>
                    <span className="font-semibold text-[#172B4D]">
                      {customerActiveTotalUnits > 0 ? (
                        <span className="text-emerald-700 font-bold">{customerActiveTotalUnits} Units</span>
                      ) : (
                        '—'
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Active Project</span>
                    <span className="font-semibold text-slate-700">
                      {uniqueActiveProjects.length > 0 ? (
                        <span>{uniqueActiveProjects.length} Project{uniqueActiveProjects.length > 1 ? 's' : ''}</span>
                      ) : (
                        '—'
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Operational Area</span>
                    <span className="font-semibold text-slate-700 truncate block" title={uniqueActiveAreas.join(', ')}>
                      {uniqueActiveAreas.length > 0 ? uniqueActiveAreas.join(', ') : (customer.city || '—')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Active Service</span>
                    <span className="font-semibold text-[#0070C0] truncate block" title={uniqueActiveServices.join(', ')}>
                      {uniqueActiveServices.length > 0
                        ? uniqueActiveServices.join(', ')
                        : (customer.currentService || customer.potentialService || '—')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 4: Commercial Performance */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
                    Commercial Performance
                  </h3>
                  <button
                    onClick={() => setCustomer360Tab('financial')}
                    className="text-[11px] font-semibold text-[#0070C0] hover:underline cursor-pointer"
                  >
                    View Financials ({customerFinancials.length})
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Revenue YTD</span>
                    <span className="font-semibold text-[#172B4D] font-mono tabular-nums">
                      {formatFullFinancial(customerRevenueYTD)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Direct Margin</span>
                    <span className="font-semibold text-emerald-700 font-mono tabular-nums">
                      {formatFullFinancial(customerDirectMarginYTD)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Target DM</span>
                    <span className="font-semibold text-slate-700 font-mono tabular-nums">
                      {formatFullFinancial(customerTargetDM)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">AR</span>
                    <span className="font-semibold text-amber-700 font-mono tabular-nums">
                      {formatFullFinancial(customerLatestAR)}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px]">Unbill</span>
                    <span className="font-semibold text-blue-700 font-mono tabular-nums">
                      {formatFullFinancial(customerLatestUnbill)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upgraded Rule-Based Account Attention & Next Action Section */}
          <AccountAttentionSection
            customer={customer}
            contracts={contracts}
            picas={picas}
            followUps={followUps}
            opportunities={opportunities}
            directMarginYTD={customerDirectMarginYTD}
            targetDirectMarginYTD={customerTargetDM}
            latestAR={customerLatestAR}
            latestUnbill={customerLatestUnbill}
            formatFullFinancial={formatFullFinancial}
            formatCompactFinancial={formatCompactFinancial}
            onOpenContract={openContractDetail}
            onOpenOpportunity={openOpportunityDetail}
            onOpenPica={openPicaDetail}
            onNavigateTab={(tab) => setCustomer360Tab(tab)}
          />
        </div>
      )}

      {/* Tab 2: Contacts */}
      {customer360Tab === 'contacts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#172B4D]">Contact Persons ({customerContacts.length})</h2>
              <p className="text-xs text-slate-400">Stakeholder mapping across Procurement, Decision Makers, and Operations</p>
            </div>
            <button
              onClick={() => setIsAddContactModalOpen(true)}
              className="px-3 py-1.5 bg-[#0070C0] text-white text-xs font-semibold rounded-lg hover:bg-[#005a9c] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Contact</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customerContacts.length === 0 ? (
              <div className="col-span-full bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs">
                No contact persons added yet. Click "+ Add Contact" to record customer stakeholders.
              </div>
            ) : (
              customerContacts.map(cnt => (
                <div key={cnt.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-[#172B4D]">{cnt.name}</h4>
                      <p className="text-xs text-slate-500">{cnt.jobTitle} · {cnt.department}</p>
                    </div>
                  </div>

                  {/* Role Type Badges */}
                  <div className="flex flex-wrap gap-1">
                    {cnt.roleTypes.map(rt => (
                      <span key={rt} className="text-[10px] font-semibold bg-blue-50 text-[#0070C0] border border-blue-100 px-2 py-0.5 rounded">
                        {rt}
                      </span>
                    ))}
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <a href={`mailto:${cnt.email}`} className="text-[#0070C0] hover:underline truncate">{cnt.email}</a>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{cnt.phone}</span>
                    </div>
                    {cnt.whatsapp && (
                      <div className="flex items-center gap-2 text-emerald-700">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>WA: {cnt.whatsapp}</span>
                      </div>
                    )}
                  </div>

                  {cnt.notes && (
                    <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 italic">
                      "{cnt.notes}"
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Contracts */}
      {customer360Tab === 'contracts' && (
        <CustomerContractsTab customer={customer} />
      )}

      {/* Tab 4: Operations */}
      {customer360Tab === 'operations' && (
        <CustomerOperationsTab customer={customer} />
      )}

      {/* Tab 5: Financial */}
      {customer360Tab === 'financial' && (
        <CustomerFinancialTab customer={customer} />
      )}

      {/* Tab 6: Activity Timeline */}
      {customer360Tab === 'activity' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#172B4D]">Daily Activity History</h2>
              <p className="text-xs text-slate-400">Chronological interaction timeline (Visits, Calls, Presentations, Follow-ups)</p>
            </div>
            <button
              onClick={() => {
                setActivityPreselectedCustomerId(customer.id);
                setIsAddActivityOpen(true);
              }}
              className="px-3.5 py-1.5 bg-[#0070C0] text-white text-xs font-semibold rounded-lg hover:bg-[#005a9c] flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Activity</span>
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            {customerActivities.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No activity logged for this customer yet.
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {customerActivities.map(act => (
                  <div key={act.id} className="relative group">
                    {/* Timeline bullet */}
                    <div className="absolute -left-6 top-1.5 w-4 h-4 rounded-full bg-white border-2 border-[#0070C0] group-hover:bg-[#0070C0] transition-colors" />

                    <div className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-xl p-4 transition-colors space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#172B4D]">
                            {act.subject}
                          </span>
                          <span className="text-[11px] font-semibold bg-blue-100 text-[#0070C0] px-2 py-0.5 rounded">
                            {act.activityType}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          {act.date} · {act.time}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {act.description}
                      </p>

                      {act.result && (
                        <div className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-slate-100">
                          <strong className="text-slate-500 font-semibold block text-[10px] uppercase">Meeting Result:</strong>
                          {act.result}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-500">
                        <div>
                          Logged by: <strong className="text-slate-700">{act.userName}</strong>
                        </div>
                        {act.nextAction && (
                          <div className="flex items-center gap-1.5 text-amber-700 font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Next Action: {act.nextAction} (Due: {act.nextFollowUpDate || 'TBD'})</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 7: Pipeline / Opportunity */}
      {customer360Tab === 'pipeline' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-[#172B4D]">Commercial Opportunities</h2>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                  {customerOpps.length} Total ({openOpps.length} Open)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Commercial deals, quotation status, and closing timeline</p>
            </div>
            <button
              onClick={() => {
                setOpportunityPreselectedCustomerId(customer.id);
                setIsAddOpportunityOpen(true);
              }}
              className="px-3.5 py-1.5 bg-[#0070C0] text-white text-xs font-semibold rounded-lg hover:bg-[#005a9c] flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Opportunity</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs text-xs">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Open Deals</span>
              <span className="text-base font-bold text-[#172B4D] tabular-nums mt-0.5 block">{openOpps.length}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Open Pipeline Value</span>
              <span className="text-base font-bold text-[#0070C0] tabular-nums mt-0.5 block">
                {formatIDR(openOpps.reduce((s, o) => s + o.potentialRevenue, 0))}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Customer Potential</span>
              <span className="text-base font-bold text-slate-700 tabular-nums mt-0.5 block">{formatIDR(customer.potentialRevenue)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Account Owner</span>
              <span className="text-xs font-bold text-slate-700 mt-1 block truncate">{customer.ownerName}</span>
            </div>
          </div>

          <div className="space-y-3">
            {customerOpps.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs">
                <Briefcase className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                No opportunities yet for this customer. Click "+ Opportunity" to create a new deal.
              </div>
            ) : (
              customerOpps.map(opp => (
                <div
                  key={opp.id}
                  onClick={() => openOpportunityDetail(opp.id)}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-[#0070C0] hover:shadow-sm cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[10px] text-slate-400 font-semibold bg-slate-100 px-1.5 py-0.5 rounded">
                        {opp.code}
                      </span>
                      <h4 className="font-bold text-sm text-[#172B4D] group-hover:text-[#0070C0] transition-colors truncate">
                        {opp.opportunityName}
                      </h4>
                      <StatusBadge status={opp.stage} size="sm" />
                      {opp.stage === 'Lost' && opp.lostReason && (
                        <span className="text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded">
                          Lost: {opp.lostReason}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1">{opp.description}</p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                      <span>Service: <strong className="text-slate-600">{opp.service}</strong></span>
                      <span>·</span>
                      <span>Target Closing: <strong className="text-slate-600">{opp.targetClosingDate}</strong></span>
                      <span>·</span>
                      <span>Probability: <strong className="text-slate-600">{opp.probability}%</strong></span>
                      <span>·</span>
                      <span>Owner: <strong className="text-slate-600">{opp.ownerName}</strong></span>
                    </div>
                  </div>

                  <div className="text-left md:text-right shrink-0">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Potential Revenue</div>
                    <div className="text-base font-bold text-[#0070C0] tabular-nums mt-0.5">
                      {formatIDR(opp.potentialRevenue)}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Updated: {opp.updatedDate || opp.createdDate}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 8: PICA */}
      {customer360Tab === 'pica' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#172B4D]">PICA Records ({customerPicas.length})</h2>
              <p className="text-xs text-slate-400">Problem Identification & Corrective Actions</p>
            </div>
            <button
              onClick={() => {
                setPicaPreselectedCustomerId(customer.id);
                setIsAddPicaOpen(true);
              }}
              className="px-3 py-1.5 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ PICA</span>
            </button>
          </div>

          <div className="space-y-3">
            {customerPicas.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs">
                No PICA issues recorded for this customer.
              </div>
            ) : (
              customerPicas.map(p => (
                <div
                  key={p.id}
                  onClick={() => openPicaDetail(p.id)}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:border-rose-300 cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {p.picaNumber}
                      </span>
                      <h4 className="font-bold text-sm text-[#172B4D] hover:text-rose-600 transition-colors">
                        {p.issueTitle}
                      </h4>
                      <StatusBadge status={p.status} size="sm" />
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-1">{p.issueDescription}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>Priority: <strong className="text-rose-700">{p.priority}</strong></span>
                      <span>·</span>
                      <span>PIC: {p.picName}</span>
                      <span>·</span>
                      <span>Due: {p.dueDate}</span>
                    </div>
                  </div>

                  <div className="text-left md:text-right shrink-0">
                    <span className="text-xs font-semibold text-[#0070C0]">
                      View Resolution Steps →
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 9: Documents (Consolidated View) */}
      {customer360Tab === 'documents' && (
        <CustomerDocumentsTab customer={customer} />
      )}

      {/* Add Contact Modal */}
      {isAddContactModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-[#172B4D]">Add Contact Person for {customer.name}</h3>
              <button onClick={() => setIsAddContactModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddContactSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="e.g. Anton Sugito"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0070C0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    value={newContactJob}
                    onChange={(e) => setNewContactJob(e.target.value)}
                    placeholder="e.g. Procurement Manager"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0070C0]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={newContactDept}
                    onChange={(e) => setNewContactDept(e.target.value)}
                    placeholder="e.g. Supply Chain"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0070C0]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newContactEmail}
                    onChange={(e) => setNewContactEmail(e.target.value)}
                    placeholder="name@company.co.id"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0070C0]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone / Mobile</label>
                  <input
                    type="text"
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    placeholder="+62 812..."
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0070C0]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Role Type (Multiple Selectable)</label>
                <div className="flex flex-wrap gap-1.5">
                  {roleTypeOptions.map(rt => {
                    const isSelected = newContactRoleTypes.includes(rt);
                    return (
                      <button
                        type="button"
                        key={rt}
                        onClick={() => toggleRoleType(rt)}
                        className={`px-2.5 py-1 rounded text-xs transition-colors ${
                          isSelected
                            ? 'bg-[#0070C0] text-white font-semibold'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {rt}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={newContactNotes}
                  onChange={(e) => setNewContactNotes(e.target.value)}
                  placeholder="Stakeholder influence, communication preferences..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0070C0]"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddContactModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0070C0] text-white font-semibold rounded-lg hover:bg-[#005a9c]"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
