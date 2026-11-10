import React from 'react';
import { CustomerFinancialMonthly, Customer } from '../../../types';
import { Modal } from '../../ui/Modal';
import { EntityBadge } from '../../common/EntityBadge';
import {
  History,
  Calendar,
  Building2,
  FileSpreadsheet,
  Database,
  UserCheck,
  Clock,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface FinancialHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: CustomerFinancialMonthly | null;
  customer: Customer;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const FinancialHistoryModal: React.FC<FinancialHistoryModalProps> = ({
  isOpen,
  onClose,
  record,
  customer
}) => {
  if (!record) return null;

  const monthName = MONTH_NAMES[record.month - 1] || `Month ${record.month}`;

  const formatCurrency = (val?: number | null) => {
    if (val === undefined || val === null || isNaN(val) || !isFinite(val)) {
      return '—';
    }
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val).replace('Rp', 'IDR ');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Financial Record History & Audit Log"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Header Summary Banner */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                {record.id}
              </span>
              <EntityBadge entity={record.entity} />
              <span className="text-xs font-semibold text-slate-600">
                {monthName} {record.year}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Database className="w-3.5 h-3.5 text-[#0070C0]" />
              <span>Source: <strong className="text-slate-700">{record.dataSource}</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs border-t border-slate-200/70 pt-3">
            <div>
              <span className="text-slate-400 block text-[11px]">Customer</span>
              <span className="font-semibold text-slate-800">{customer.name} ({customer.code})</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Segment & Project</span>
              <span className="font-semibold text-slate-800">{record.segment} · {record.projectLocation}</span>
            </div>
          </div>
        </div>

        {/* Audit Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Creation Metadata */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Record Origin</span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Created By:</span>
                <span className="font-medium text-slate-800">{record.createdBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Created At:</span>
                <span className="font-mono text-slate-800">{record.createdAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Data Source:</span>
                <span className="font-medium text-[#0070C0]">{record.dataSource}</span>
              </div>
            </div>
          </div>

          {/* Sync & Update Metadata */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Latest Modification & Sync</span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Updated By:</span>
                <span className="font-medium text-slate-800">{record.updatedBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Updated At:</span>
                <span className="font-mono text-slate-800">{record.updatedAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">External ID:</span>
                <span className="font-mono text-slate-800">{record.externalId || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Last Sync Date:</span>
                <span className="font-mono text-slate-800">{record.lastSyncDate || '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Snapshot of Commercial Values */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Recorded Commercial Financial Figures
            </h4>
            <span className="text-[11px] text-slate-500">IDR Values as entered/imported</span>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            <div className="grid grid-cols-2 px-4 py-2 hover:bg-slate-50/50">
              <span className="text-slate-500">Revenue</span>
              <span className="font-mono font-semibold text-right text-slate-800 tabular-nums">
                {formatCurrency(record.revenue)}
              </span>
            </div>
            <div className="grid grid-cols-2 px-4 py-2 hover:bg-slate-50/50">
              <span className="text-slate-500">Trucking Contract</span>
              <span className="font-mono text-right text-slate-800 tabular-nums">
                {formatCurrency(record.truckingContract)}
              </span>
            </div>
            <div className="grid grid-cols-2 px-4 py-2 hover:bg-slate-50/50">
              <span className="text-slate-500">Variable Cost</span>
              <span className="font-mono text-right text-slate-800 tabular-nums">
                {formatCurrency(record.variableCost)}
              </span>
            </div>
            <div className="grid grid-cols-2 px-4 py-2 hover:bg-slate-50/50">
              <span className="text-slate-500">Driver Cost</span>
              <span className="font-mono text-right text-slate-800 tabular-nums">
                {formatCurrency(record.driverCost)}
              </span>
            </div>
            <div className="grid grid-cols-2 px-4 py-2 hover:bg-slate-50/50">
              <span className="text-slate-500">Shipment Cost</span>
              <span className="font-mono text-right text-slate-800 tabular-nums">
                {formatCurrency(record.shipmentCost)}
              </span>
            </div>
            <div className="grid grid-cols-2 px-4 py-2 bg-emerald-50/30 hover:bg-emerald-50/50">
              <span className="font-semibold text-emerald-800">Direct Margin (DM)</span>
              <span className="font-mono font-bold text-right text-emerald-800 tabular-nums">
                {formatCurrency(record.directMargin)}
              </span>
            </div>
            <div className="grid grid-cols-2 px-4 py-2 hover:bg-slate-50/50">
              <span className="text-slate-500">Target Direct Margin</span>
              <span className="font-mono text-right text-slate-800 tabular-nums">
                {formatCurrency(record.targetDirectMargin)}
              </span>
            </div>
            <div className="grid grid-cols-2 px-4 py-2 hover:bg-slate-50/50">
              <span className="text-slate-500">Accounts Receivable (AR)</span>
              <span className="font-mono font-semibold text-right text-amber-700 tabular-nums">
                {formatCurrency(record.ar)}
              </span>
            </div>
            <div className="grid grid-cols-2 px-4 py-2 hover:bg-slate-50/50">
              <span className="text-slate-500">Unbilled Revenue (Unbill)</span>
              <span className="font-mono font-semibold text-right text-blue-700 tabular-nums">
                {formatCurrency(record.unbill)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer info note */}
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 p-3 rounded-lg border border-slate-200/60">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Commercial monitoring audit log. Values represent actual booked commercial realization and do not modify official general ledger ERP accounting records.
          </span>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
          >
            Close History
          </button>
        </div>
      </div>
    </Modal>
  );
};
