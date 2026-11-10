import React from 'react';
import { OperationalProfile, Customer } from '../../../types';
import { StatusBadge } from '../../layout/StatusBadge';
import { EntityBadge } from '../../common/EntityBadge';
import {
  X,
  Truck,
  MapPin,
  Calendar,
  Layers,
  Activity,
  ArrowRight,
  ShieldCheck,
  FileText,
  Clock,
  User,
  Gauge
} from 'lucide-react';

interface OperationalProfileDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: OperationalProfile | null;
  customer: Customer;
  onEdit: (profile: OperationalProfile) => void;
}

export const OperationalProfileDetailModal: React.FC<OperationalProfileDetailModalProps> = ({
  isOpen,
  onClose,
  profile,
  customer,
  onEdit
}) => {
  if (!isOpen || !profile) return null;

  const pa = profile.paPercentage ?? 0;
  const dt = profile.dtPercentage ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0070C0]/10 text-[#0070C0] flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#172B4D]">
                  {profile.projectLocation}
                </h2>
                <StatusBadge status={profile.status} size="sm" />
                <EntityBadge entity={profile.entity} size="sm" />
              </div>
              <p className="text-xs text-slate-500">
                Customer: <strong className="text-slate-700">{customer.name}</strong> ({customer.code}) · Region: {profile.operationalRegion}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
          {/* Route Visual Banner */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Origin
              </span>
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{profile.origin}</span>
              </div>
            </div>

            <div className="flex items-center justify-center px-2 text-[#0070C0]">
              <div className="flex items-center gap-1 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full text-[11px] font-semibold">
                <span>Direct Route</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex-1 sm:text-right">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Destination
              </span>
              <div className="flex items-center sm:justify-end gap-1.5 font-bold text-slate-800 text-sm">
                <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{profile.destination}</span>
              </div>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-2xs">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Total Unit</span>
              <div className="text-xl font-bold text-[#172B4D] mt-1 tabular-nums">
                {profile.totalUnit} <span className="text-xs font-normal text-slate-500">Units</span>
              </div>
              <span className="text-[10px] text-slate-500 truncate block mt-0.5">{profile.unitType}</span>
            </div>

            <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-2xs">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Physical Avail. (PA)</span>
              <div className="text-xl font-bold text-emerald-600 mt-1 tabular-nums">
                {profile.paPercentage !== undefined ? `${profile.paPercentage}%` : '—'}
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">Downtime (DT): {profile.dtPercentage ?? '—'}%</span>
            </div>

            <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-2xs">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Est. Monthly Trips</span>
              <div className="text-xl font-bold text-[#0070C0] mt-1 tabular-nums">
                {profile.estimatedTrips !== undefined ? `${profile.estimatedTrips}` : '—'}
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">Trips / Month</span>
            </div>

            <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-2xs">
              <span className="text-[10px] font-semibold text-slate-400 uppercase">Est. Volume</span>
              <div className="text-sm font-bold text-slate-800 mt-1 truncate">
                {profile.estimatedVolume || '—'}
              </div>
              <span className="text-[10px] text-slate-500 block mt-0.5">Capacity Throughput</span>
            </div>
          </div>

          {/* Availability Gauge Visualizer */}
          {(profile.paPercentage !== undefined || profile.dtPercentage !== undefined) && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#172B4D] flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-[#0070C0]" />
                  <span>Availability & Reliability Breakdown</span>
                </span>
                <span className="font-mono text-xs font-semibold text-slate-600">
                  Total: {pa + dt}%
                </span>
              </div>
              <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
                <div
                  style={{ width: `${Math.min(100, pa)}%` }}
                  className="bg-emerald-500 h-full transition-all"
                  title={`Physical Availability: ${pa}%`}
                />
                <div
                  style={{ width: `${Math.min(100 - Math.min(100, pa), dt)}%` }}
                  className="bg-amber-500 h-full transition-all"
                  title={`Downtime: ${dt}%`}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  PA (Physical Availability): {pa}%
                </span>
                <span className="flex items-center gap-1.5 text-amber-700 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  DT (Downtime): {dt}%
                </span>
              </div>
            </div>
          )}

          {/* Service & SLA Specifications */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#0070C0]" />
              <span>Service Specifications & Commitment</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Service Type</span>
                <span className="font-semibold text-slate-800 text-xs">{profile.service}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Operating Entity</span>
                <span className="font-semibold text-slate-800 text-xs">{profile.entity}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Effective Date</span>
                <span className="font-semibold text-slate-800 text-xs">{profile.effectiveDate}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">End Date</span>
                <span className="font-semibold text-slate-800 text-xs">{profile.endDate}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Service Level Agreement (SLA)</span>
                <p className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-slate-700 text-xs leading-relaxed">
                  {profile.sla || 'Standard SLA as specified under service agreement.'}
                </p>
              </div>
              {profile.notes && (
                <div className="sm:col-span-2">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Operational Notes</span>
                  <p className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-slate-600 italic text-xs">
                    "{profile.notes}"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Audit Trail */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400 border-t border-slate-100 pt-3">
            <span>Created by: <strong className="text-slate-600">{profile.createdBy}</strong> ({profile.createdAt})</span>
            <span>Last updated by: <strong className="text-slate-600">{profile.updatedBy}</strong> ({profile.updatedAt})</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-3.5 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onEdit(profile);
            }}
            className="px-4 py-2 bg-[#0070C0] hover:bg-[#005a9c] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};
