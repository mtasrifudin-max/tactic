import React, { useState, useMemo } from 'react';
import { Customer, ConsolidatedDocument, DocumentRelatedModule } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { DocumentPreviewModal, triggerDocumentDownload } from './DocumentPreviewModal';
import { Select } from '../../ui/Select';
import {
  FileText,
  Download,
  Filter,
  Search,
  RotateCcw,
  Eye,
  Calendar,
  Layers,
  FolderOpen,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface CustomerDocumentsTabProps {
  customer: Customer;
}

export const CustomerDocumentsTab: React.FC<CustomerDocumentsTabProps> = ({ customer }) => {
  const {
    contracts,
    operationalProfiles,
    picas,
    showToast,
    openContractDetail,
    openPicaDetail,
    setCustomer360Tab
  } = useApp();

  // Filter & Search states
  const [selectedModule, setSelectedModule] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected document for preview modal
  const [selectedDocument, setSelectedDocument] = useState<ConsolidatedDocument | null>(null);

  // --------------------------------------------------------------------------
  // CONSOLIDATED DOCUMENT AGGREGATION
  // Aggregates references dynamically from Customer, Contract, Operational Profile, and PICA.
  // Does not duplicate physical files or database records.
  // --------------------------------------------------------------------------
  const allDocuments: ConsolidatedDocument[] = useMemo(() => {
    const docs: ConsolidatedDocument[] = [];

    // 1. CONTRACTS (Keep attachments linked to Contract)
    const customerContracts = contracts.filter(c => c.customerId === customer.id);
    customerContracts.forEach(c => {
      docs.push({
        id: `doc-cont-${c.id}`,
        documentName: c.contractTitle,
        documentType: c.contractType,
        relatedModule: 'Contract',
        documentNumber: c.documentNumber,
        effectiveDate: c.effectiveDate,
        expiryDate: c.expiryDate,
        uploadedBy: c.createdBy,
        uploadedDate: c.createdAt,
        fileName: c.attachment || `${c.documentNumber.replace(/[\/\s]/g, '_')}.pdf`,
        fileSize: '3.2 MB',
        sourceEntityId: c.id,
        sourceModuleTab: 'contracts',
        status: c.contractStatus,
        notes: c.notes
      });
    });

    // 2. OPERATIONAL PROFILES (SLA documents, Route & Fleet Permits)
    const customerOps = operationalProfiles.filter(p => p.customerId === customer.id);
    customerOps.forEach(p => {
      // SLA & Standard Operating Procedure
      docs.push({
        id: `doc-op-sla-${p.id}`,
        documentName: `SLA & Standard Operational Procedure - ${p.projectLocation}`,
        documentType: 'SLA & SOP',
        relatedModule: 'Operational Profile',
        documentNumber: `SLA/${p.entity}/${p.id.toUpperCase()}`,
        effectiveDate: p.effectiveDate,
        expiryDate: p.endDate,
        uploadedBy: p.createdBy,
        uploadedDate: p.createdAt,
        fileName: `SLA_${p.entity}_${p.projectLocation.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
        fileSize: '1.8 MB',
        sourceEntityId: p.id,
        sourceModuleTab: 'operations',
        status: p.status,
        notes: p.sla ? `SLA: ${p.sla}. Route: ${p.origin} to ${p.destination}` : p.notes
      });

      // Route & Fleet Transport Permit
      docs.push({
        id: `doc-op-permit-${p.id}`,
        documentName: `Route & Fleet Transport Permit - ${p.origin} to ${p.destination.split('(')[0].trim()}`,
        documentType: 'Route & Fleet Permit',
        relatedModule: 'Operational Profile',
        documentNumber: `PERMIT/DISHUB/${p.entity}/${p.id.toUpperCase()}`,
        effectiveDate: p.effectiveDate,
        expiryDate: p.endDate,
        uploadedBy: p.createdBy,
        uploadedDate: p.createdAt,
        fileName: `Route_Permit_${p.entity}_${p.id.toUpperCase()}.pdf`,
        fileSize: '1.4 MB',
        sourceEntityId: p.id,
        sourceModuleTab: 'operations',
        status: p.status,
        notes: `Authorized Fleet Allocation: ${p.totalUnit} Units (${p.unitType})`
      });
    });

    // 3. PICA (Incident investigation reports and evidence)
    const customerPicas = picas.filter(p => p.customerId === customer.id);
    customerPicas.forEach(pica => {
      docs.push({
        id: `doc-pica-${pica.id}`,
        documentName: `PICA Investigation & Corrective Evidence - ${pica.issueTitle}`,
        documentType: 'PICA Investigation & Evidence',
        relatedModule: 'PICA',
        documentNumber: pica.picaNumber,
        effectiveDate: pica.createdDate,
        expiryDate: pica.dueDate,
        uploadedBy: pica.createdBy,
        uploadedDate: pica.createdDate,
        fileName: pica.evidence && pica.evidence.endsWith('.pdf') ? pica.evidence : `Evidence_${pica.picaNumber.replace(/[\/\s]/g, '_')}.pdf`,
        fileSize: '2.1 MB',
        sourceEntityId: pica.id,
        sourceModuleTab: 'pica',
        status: pica.status,
        notes: `Priority: ${pica.priority} · Corrective Action: ${pica.correctiveAction}`
      });
    });

    // 4. CUSTOMER (Legal, Tax, and KYC Master Dossiers)
    // NPWP Certificate
    docs.push({
      id: `doc-cust-npwp-${customer.id}`,
      documentName: `Surat Keterangan Terdaftar Pajak & NPWP Certificate`,
      documentType: 'Tax & Legal',
      relatedModule: 'Customer',
      documentNumber: customer.npwp || `01.${customer.code.replace('CUST-', '')}.998.0-001.000`,
      effectiveDate: customer.createdDate,
      expiryDate: '—',
      uploadedBy: customer.createdBy || customer.ownerName,
      uploadedDate: customer.createdDate,
      fileName: `NPWP_${customer.code}.pdf`,
      fileSize: '840 KB',
      sourceEntityId: customer.id,
      sourceModuleTab: 'overview',
      status: 'Verified',
      notes: `Registered Taxpayer: ${customer.legalEntityName || customer.name}`
    });

    // NIB (Nomor Induk Berusaha / OSS Business License)
    docs.push({
      id: `doc-cust-nib-${customer.id}`,
      documentName: `Nomor Induk Berusaha (NIB OSS RI)`,
      documentType: 'Business License',
      relatedModule: 'Customer',
      documentNumber: customer.nib || `8120001234567`,
      effectiveDate: customer.createdDate,
      expiryDate: '—',
      uploadedBy: customer.createdBy || customer.ownerName,
      uploadedDate: customer.createdDate,
      fileName: `NIB_OSS_${customer.code}.pdf`,
      fileSize: '1.1 MB',
      sourceEntityId: customer.id,
      sourceModuleTab: 'overview',
      status: 'Verified',
      notes: `Commercial Transport & Logistics Trading Activity (KBLI standard)`
    });

    // Akta Pendirian & SK Kemenkumham
    docs.push({
      id: `doc-cust-akta-${customer.id}`,
      documentName: `Akta Pendirian Perusahaan & SK Kemenkumham RI`,
      documentType: 'Company Deed',
      relatedModule: 'Customer',
      documentNumber: `AHU-00188.${customer.code}.AH.01.01`,
      effectiveDate: customer.createdDate,
      expiryDate: '—',
      uploadedBy: customer.createdBy || customer.ownerName,
      uploadedDate: customer.createdDate,
      fileName: `Akta_Pendirian_${customer.code}.pdf`,
      fileSize: '4.8 MB',
      sourceEntityId: customer.id,
      sourceModuleTab: 'overview',
      status: 'Verified',
      notes: `Notarial deed of establishment and legal entity validation`
    });

    // KYC Verification Dossier
    docs.push({
      id: `doc-cust-kyc-${customer.id}`,
      documentName: `Customer KYC & Commercial Due Diligence Dossier`,
      documentType: 'KYC Dossier',
      relatedModule: 'Customer',
      documentNumber: `KYC-${customer.code}-VERIFIED`,
      effectiveDate: customer.createdDate,
      expiryDate: '—',
      uploadedBy: customer.ownerName,
      uploadedDate: customer.createdDate,
      fileName: `KYC_Dossier_${customer.code}_VERIFIED.pdf`,
      fileSize: '2.9 MB',
      sourceEntityId: customer.id,
      sourceModuleTab: 'overview',
      status: 'Verified',
      notes: `Status: KYC Verified by Commercial Operations & Legal Team`
    });

    return docs;
  }, [customer, contracts, operationalProfiles, picas]);

  // Dynamic filter options
  const availableTypes = useMemo(() => {
    const types = Array.from(new Set(allDocuments.map(d => d.documentType).filter(Boolean)));
    return types.sort();
  }, [allDocuments]);

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    allDocuments.forEach(d => {
      if (d.uploadedDate) {
        const y = d.uploadedDate.slice(0, 4);
        if (y) years.add(y);
      }
      if (d.effectiveDate && d.effectiveDate.length >= 4) {
        const y = d.effectiveDate.slice(0, 4);
        if (y && !isNaN(Number(y))) years.add(y);
      }
    });
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [allDocuments]);

  // Filter application
  const filteredDocuments = useMemo(() => {
    return allDocuments.filter(doc => {
      // Related Module Filter
      if (selectedModule !== 'ALL' && doc.relatedModule !== selectedModule) {
        return false;
      }

      // Document Type Filter
      if (selectedType !== 'ALL' && doc.documentType !== selectedType) {
        return false;
      }

      // Date / Year Filter
      if (selectedYear !== 'ALL') {
        const matchUploaded = doc.uploadedDate.startsWith(selectedYear);
        const matchEffective = doc.effectiveDate && doc.effectiveDate.startsWith(selectedYear);
        if (!matchUploaded && !matchEffective) return false;
      }

      // Text Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inName = doc.documentName.toLowerCase().includes(q);
        const inNumber = doc.documentNumber.toLowerCase().includes(q);
        const inFile = doc.fileName.toLowerCase().includes(q);
        const inType = doc.documentType.toLowerCase().includes(q);
        const inModule = doc.relatedModule.toLowerCase().includes(q);
        const inUploader = doc.uploadedBy.toLowerCase().includes(q);
        if (!inName && !inNumber && !inFile && !inType && !inModule && !inUploader) {
          return false;
        }
      }

      return true;
    });
  }, [allDocuments, selectedModule, selectedType, selectedYear, searchQuery]);

  const isFiltered = selectedModule !== 'ALL' || selectedType !== 'ALL' || selectedYear !== 'ALL' || searchQuery.trim() !== '';

  const resetFilters = () => {
    setSelectedModule('ALL');
    setSelectedType('ALL');
    setSelectedYear('ALL');
    setSearchQuery('');
  };

  // Document module badge colors
  const getModuleBadge = (mod: DocumentRelatedModule) => {
    switch (mod) {
      case 'Contract':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Contract
          </span>
        );
      case 'Operational Profile':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            Operations
          </span>
        );
      case 'PICA':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            PICA
          </span>
        );
      case 'Customer':
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            Customer
          </span>
        );
    }
  };

  // Module category counts for summary
  const contractDocsCount = allDocuments.filter(d => d.relatedModule === 'Contract').length;
  const operationalDocsCount = allDocuments.filter(d => d.relatedModule === 'Operational Profile').length;
  const picaDocsCount = allDocuments.filter(d => d.relatedModule === 'PICA').length;
  const customerDocsCount = allDocuments.filter(d => d.relatedModule === 'Customer').length;

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-bold text-[#172B4D]">Consolidated Document Repository</h2>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {allDocuments.length} Total Documents
            </span>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Directly Linked
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Unified view of contracts, operational profiles, SLAs, PICA evidence, and legal customer dossiers
          </p>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1: Contract Documents */}
        <div
          onClick={() => setSelectedModule('Contract')}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            selectedModule === 'Contract'
              ? 'bg-blue-50/80 border-[#0070C0] shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Contracts & MSAs
            </span>
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
          <div className="text-lg font-bold text-[#172B4D] tabular-nums mt-1">
            {contractDocsCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Main, Addenda, Renewals
          </div>
        </div>

        {/* Metric 2: Operational & Route Permits */}
        <div
          onClick={() => setSelectedModule('Operational Profile')}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            selectedModule === 'Operational Profile'
              ? 'bg-emerald-50/80 border-emerald-600 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
              SOP & Permits
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-lg font-bold text-emerald-800 tabular-nums mt-1">
            {operationalDocsCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Service SLAs & Route Manifests
          </div>
        </div>

        {/* Metric 3: PICA Evidence */}
        <div
          onClick={() => setSelectedModule('PICA')}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            selectedModule === 'PICA'
              ? 'bg-rose-50/80 border-rose-500 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">
              PICA Evidence
            </span>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
          </div>
          <div className="text-lg font-bold text-rose-800 tabular-nums mt-1">
            {picaDocsCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Investigation & Photo Logs
          </div>
        </div>

        {/* Metric 4: Legal & KYC Master */}
        <div
          onClick={() => setSelectedModule('Customer')}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            selectedModule === 'Customer'
              ? 'bg-purple-50/80 border-purple-500 shadow-xs'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">
              KYC & Legal Dossiers
            </span>
            <span className="w-2 h-2 rounded-full bg-purple-500" />
          </div>
          <div className="text-lg font-bold text-purple-800 tabular-nums mt-1">
            {customerDocsCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            NPWP, NIB, Deed, Dossier
          </div>
        </div>
      </div>

      {/* Filter Bar: Document Type, Related Module, Date */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-[#0070C0]" />
            <span>Document Filters & Search</span>
          </div>

          {isFiltered && (
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-[#0070C0] hover:text-[#005a9c] flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Filter 1: Related Module */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Related Module
            </label>
            <Select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Modules' },
                { value: 'Customer', label: 'Customer (Legal/KYC)' },
                { value: 'Contract', label: 'Contract' },
                { value: 'Operational Profile', label: 'Operational Profile' },
                { value: 'PICA', label: 'PICA' }
              ]}
            />
          </div>

          {/* Filter 2: Document Type */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Document Type
            </label>
            <Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Document Types' },
                ...availableTypes.map(t => ({ value: t, label: t }))
              ]}
            />
          </div>

          {/* Filter 3: Date (Year) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Date (Year)
            </label>
            <Select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Dates' },
                ...availableYears.map(y => ({ value: y, label: `Year ${y}` }))
              ]}
            />
          </div>

          {/* Search Query */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Search Document / Number
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search name, ref, file..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0070C0] focus:border-[#0070C0]"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Consolidated Documents Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {filteredDocuments.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <FolderOpen className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#172B4D]">No Documents Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {isFiltered
                ? 'No documents match your active filter criteria. Try resetting the filters.'
                : 'No document references found for this customer.'}
            </p>
            {isFiltered && (
              <button
                onClick={resetFilters}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-3.5 whitespace-nowrap">Document Name</th>
                  <th className="py-3 px-3 whitespace-nowrap">Document Type</th>
                  <th className="py-3 px-3 whitespace-nowrap">Related Module</th>
                  <th className="py-3 px-3 whitespace-nowrap">Document Number</th>
                  <th className="py-3 px-3 whitespace-nowrap">Effective Date</th>
                  <th className="py-3 px-3 whitespace-nowrap">Expiry Date</th>
                  <th className="py-3 px-3 whitespace-nowrap">Uploaded By</th>
                  <th className="py-3 px-3 whitespace-nowrap">Uploaded Date</th>
                  <th className="py-3 px-3 whitespace-nowrap">File</th>
                  <th className="py-3 px-3.5 whitespace-nowrap text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocuments.map(doc => {
                  const isExpiringSoon =
                    doc.expiryDate &&
                    doc.expiryDate !== '—' &&
                    doc.expiryDate >= '2026-11-05' &&
                    doc.expiryDate <= '2027-02-05';
                  const isExpired =
                    doc.expiryDate &&
                    doc.expiryDate !== '—' &&
                    doc.expiryDate < '2026-11-05';

                  return (
                    <tr
                      key={doc.id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => setSelectedDocument(doc)}
                    >
                      {/* Document Name */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-2 max-w-[220px]">
                          <div className="w-7 h-7 rounded-md bg-blue-50 text-[#0070C0] flex items-center justify-center shrink-0 border border-blue-100">
                            <FileText className="w-3.5 h-3.5" />
                          </div>
                          <span
                            className="font-semibold text-slate-800 group-hover:text-[#0070C0] transition-colors truncate block"
                            title={doc.documentName}
                          >
                            {doc.documentName}
                          </span>
                        </div>
                      </td>

                      {/* Document Type */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {doc.documentType}
                        </span>
                      </td>

                      {/* Related Module */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {getModuleBadge(doc.relatedModule)}
                      </td>

                      {/* Document Number */}
                      <td className="py-3 px-3 whitespace-nowrap font-mono text-[11px] text-slate-700">
                        {doc.documentNumber}
                      </td>

                      {/* Effective Date */}
                      <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                        {doc.effectiveDate || '—'}
                      </td>

                      {/* Expiry Date */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {doc.expiryDate && doc.expiryDate !== '—' ? (
                          <span
                            className={`font-medium ${
                              isExpired
                                ? 'text-rose-600 font-bold'
                                : isExpiringSoon
                                ? 'text-amber-700 font-bold'
                                : 'text-slate-600'
                            }`}
                          >
                            {doc.expiryDate}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">Perpetual</span>
                        )}
                      </td>

                      {/* Uploaded By */}
                      <td className="py-3 px-3 whitespace-nowrap text-slate-600 truncate max-w-[130px]" title={doc.uploadedBy}>
                        {doc.uploadedBy}
                      </td>

                      {/* Uploaded Date */}
                      <td className="py-3 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        {doc.uploadedDate}
                      </td>

                      {/* File */}
                      <td className="py-3 px-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => {
                            triggerDocumentDownload(doc.fileName, doc.documentName, doc.documentNumber, customer.name);
                            showToast(`Downloading "${doc.fileName}"`, 'success', 'File Download');
                          }}
                          title={`Download ${doc.fileName}`}
                          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#0070C0] hover:text-[#005a9c] hover:underline bg-blue-50/60 hover:bg-blue-100/60 px-2 py-1 rounded border border-blue-200/60 transition-colors max-w-[150px] truncate cursor-pointer"
                        >
                          <Download className="w-3 h-3 shrink-0" />
                          <span className="truncate font-mono">{doc.fileName}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3.5 whitespace-nowrap text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => setSelectedDocument(doc)}
                            className="p-1.5 text-slate-500 hover:text-[#0070C0] hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title="Preview Document Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              triggerDocumentDownload(doc.fileName, doc.documentName, doc.documentNumber, customer.name);
                              showToast(`Downloading "${doc.fileName}"`, 'success', 'File Download');
                            }}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title="Download Document"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Document Preview & Details Modal */}
      {selectedDocument && (
        <DocumentPreviewModal
          isOpen={Boolean(selectedDocument)}
          onClose={() => setSelectedDocument(null)}
          document={selectedDocument}
          customer={customer}
        />
      )}
    </div>
  );
};
