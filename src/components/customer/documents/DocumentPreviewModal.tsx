import React from 'react';
import { ConsolidatedDocument, Customer } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { Modal } from '../../ui/Modal';
import {
  FileText,
  Download,
  Calendar,
  User,
  Hash,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Building2,
  Tag,
  AlertCircle,
  FileCheck
} from 'lucide-react';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: ConsolidatedDocument | null;
  customer: Customer;
}

/**
 * Client-side safe file downloader
 * Generates an authentic simulated PDF payload without triggering window.alert/window.open
 */
export const triggerDocumentDownload = (
  fileName: string,
  docName: string,
  docNumber: string,
  customerName: string
) => {
  const content = `%PDF-1.4
% Pancaran Group - Commercial Management System (CMS)
% Customer: ${customerName}
% Document Title: ${docName}
% Document Number: ${docNumber}
% Generated/Synced Date: ${new Date().toISOString()}
% Security Classification: Commercial In Confidence

This is a certified digital commercial document copy for ${customerName}.
Reference: ${docNumber}
Filename: ${fileName}
`;
  const blob = new Blob([content], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = window.document.createElement('a');
  a.href = url;
  a.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  window.document.body.appendChild(a);
  a.click();
  window.document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  document: doc,
  customer
}) => {
  const {
    openContractDetail,
    openPicaDetail,
    setCustomer360Tab,
    showToast
  } = useApp();

  if (!doc) return null;

  const handleDownload = () => {
    triggerDocumentDownload(doc.fileName, doc.documentName, doc.documentNumber, customer.name);
    showToast(`Downloading "${doc.fileName}"`, 'success', 'Document Download');
  };

  const handleNavigateToSource = () => {
    onClose();
    if (doc.relatedModule === 'Contract' && doc.sourceEntityId) {
      openContractDetail(doc.sourceEntityId);
    } else if (doc.relatedModule === 'PICA' && doc.sourceEntityId) {
      openPicaDetail(doc.sourceEntityId);
    } else if (doc.relatedModule === 'Operational Profile') {
      setCustomer360Tab('operations');
    } else if (doc.relatedModule === 'Customer') {
      setCustomer360Tab('overview');
    }
  };

  const getModuleBadgeColor = (mod: string) => {
    switch (mod) {
      case 'Contract':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Operational Profile':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'PICA':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Customer':
      default:
        return 'bg-purple-50 text-purple-700 border-purple-200';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Commercial Document Preview"
      description={`Consolidated reference for ${customer.name}`}
      maxWidth="2xl"
    >
      <div className="space-y-5 p-1">
        {/* Header Summary Banner */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 text-[#0070C0] flex items-center justify-center shrink-0 border border-blue-200">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-sm text-[#172B4D] leading-tight">
                  {doc.documentName}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getModuleBadgeColor(doc.relatedModule)}`}>
                  {doc.relatedModule}
                </span>
              </div>
              <p className="font-mono text-xs text-slate-500 mt-1">
                Ref: {doc.documentNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-[#0070C0] hover:bg-[#005a9c] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Document Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white border border-slate-200 rounded-xl p-4 text-xs">
          <div>
            <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
              Document Type
            </span>
            <span className="font-semibold text-slate-700 mt-0.5 block truncate" title={doc.documentType}>
              {doc.documentType}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
              Effective Date
            </span>
            <span className="font-semibold text-slate-700 mt-0.5 block">
              {doc.effectiveDate || '—'}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
              Expiry Date
            </span>
            <span className={`font-semibold mt-0.5 block ${
              doc.expiryDate && doc.expiryDate !== '—' && doc.expiryDate < '2026-11-05'
                ? 'text-rose-600 font-bold'
                : 'text-slate-700'
            }`}>
              {doc.expiryDate || '—'}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
              Uploaded By
            </span>
            <span className="font-semibold text-slate-700 mt-0.5 block truncate" title={doc.uploadedBy}>
              {doc.uploadedBy}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
              Upload Date
            </span>
            <span className="font-semibold text-slate-600 mt-0.5 block">
              {doc.uploadedDate}
            </span>
          </div>

          <div>
            <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
              File Attachment
            </span>
            <span className="font-mono text-xs text-[#0070C0] font-semibold mt-0.5 block truncate" title={doc.fileName}>
              {doc.fileName}
            </span>
          </div>

          <div className="col-span-2">
            <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">
              Source Status
            </span>
            <span className="font-medium text-slate-700 mt-0.5 block truncate">
              {doc.status || 'Active / Verified'}
            </span>
          </div>
        </div>

        {/* Visual Document Viewer Sheet (Simulated Authentic Enterprise Document) */}
        <div className="border border-slate-200 rounded-xl bg-slate-50/50 p-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200 pb-2">
            <span className="font-semibold flex items-center gap-1.5 text-slate-700">
              <FileCheck className="w-4 h-4 text-[#0070C0]" />
              Document Sheet Preview
            </span>
            <span className="font-mono text-[11px] text-slate-400">
              {doc.fileSize || '2.4 MB · Portable Document Format'}
            </span>
          </div>

          {/* Paper Canvas */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-xs space-y-4 font-sans text-xs">
            {/* Header / Watermark style */}
            <div className="flex items-center justify-between border-b-2 border-[#172B4D] pb-3">
              <div>
                <div className="font-bold text-sm tracking-tight text-[#172B4D] uppercase">
                  Pancaran Group · Commercial Logistics
                </div>
                <div className="text-[10px] text-slate-400 font-medium">
                  PT Pancaran Energi Transport · PT Pancaran Darat Transport · PT Pancaran Logistik Indonesia
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-[11px] font-bold text-[#0070C0] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {doc.documentNumber}
                </span>
              </div>
            </div>

            {/* Document Body Excerpt */}
            <div className="space-y-3 text-slate-700">
              <div className="font-bold text-xs text-[#172B4D]">
                SUBJECT: {doc.documentName}
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-400 block">Customer Party:</span>
                  <span className="font-semibold text-slate-800">{customer.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Originating Module:</span>
                  <span className="font-semibold text-slate-800">{doc.relatedModule}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Validity Period:</span>
                  <span className="font-semibold text-slate-800">
                    {doc.effectiveDate} {doc.expiryDate && doc.expiryDate !== '—' ? `to ${doc.expiryDate}` : '(Ongoing / In-Force)'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Verified By:</span>
                  <span className="font-semibold text-slate-800">{doc.uploadedBy}</span>
                </div>
              </div>

              {doc.notes && (
                <div className="text-[11px] bg-amber-50/60 p-3 rounded-lg border border-amber-200/60 text-amber-900">
                  <span className="font-semibold block text-[10px] uppercase text-amber-800 mb-0.5">Commercial Notes:</span>
                  <p className="leading-relaxed">{doc.notes}</p>
                </div>
              )}

              <p className="text-[11px] text-slate-500 leading-relaxed italic">
                This document reference is consolidated directly from the {doc.relatedModule} record. All contractual terms, operational obligations, or incident evidence remain authoritative within the primary module.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Close Preview
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleNavigateToSource}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-[#172B4D] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#0070C0]" />
              <span>Open in {doc.relatedModule}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-2 bg-[#0070C0] hover:bg-[#005a9c] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
