import React, { useState, useEffect } from 'react';
import { Customer, EntityId, OperationalProfile, OperationalProfileStatus } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { X, Truck, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface AddOperationalProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  profileToEdit?: OperationalProfile | null;
}

export const AddOperationalProfileModal: React.FC<AddOperationalProfileModalProps> = ({
  isOpen,
  onClose,
  customer,
  profileToEdit
}) => {
  const { addOperationalProfile, updateOperationalProfile, showToast, currentUser, validateAvailabilityBreakdown, masterData } = useApp();

  // Form Fields - Project Section
  const [entity, setEntity] = useState<EntityId>('PDT');
  const [projectLocation, setProjectLocation] = useState('');
  const [service, setService] = useState('');
  const [operationalRegion, setOperationalRegion] = useState('');

  // Route Section
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  // Fleet Section
  const [totalUnit, setTotalUnit] = useState<number | ''>('');
  const [unitType, setUnitType] = useState('');
  const [paPercentage, setPaPercentage] = useState<number | ''>('');
  const [dtPercentage, setDtPercentage] = useState<number | ''>('');

  // Volume Section
  const [estimatedTrips, setEstimatedTrips] = useState<number | ''>('');
  const [estimatedVolume, setEstimatedVolume] = useState('');

  // Service Section
  const [sla, setSla] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('2026-10-05');
  const [endDate, setEndDate] = useState('2027-10-04');
  const [status, setStatus] = useState<OperationalProfileStatus>('Active');
  const [notes, setNotes] = useState('');

  // Validation State for PA / DT
  const [availabilityWarning, setAvailabilityWarning] = useState<string | null>(null);

  // Populate or reset form
  useEffect(() => {
    if (!isOpen) return;

    if (profileToEdit) {
      setEntity(profileToEdit.entity);
      setProjectLocation(profileToEdit.projectLocation);
      setService(profileToEdit.service);
      setOperationalRegion(profileToEdit.operationalRegion);
      setOrigin(profileToEdit.origin);
      setDestination(profileToEdit.destination);
      setTotalUnit(profileToEdit.totalUnit);
      setUnitType(profileToEdit.unitType);
      setPaPercentage(profileToEdit.paPercentage ?? '');
      setDtPercentage(profileToEdit.dtPercentage ?? '');
      setEstimatedTrips(profileToEdit.estimatedTrips !== undefined ? Number(profileToEdit.estimatedTrips) : '');
      setEstimatedVolume(profileToEdit.estimatedVolume || '');
      setSla(profileToEdit.sla || '');
      setEffectiveDate(profileToEdit.effectiveDate);
      setEndDate(profileToEdit.endDate);
      setStatus(profileToEdit.status);
      setNotes(profileToEdit.notes || '');
    } else {
      const initialEntity = customer.operatingEntities && customer.operatingEntities.length > 0
        ? customer.operatingEntities[0]
        : 'PDT';
      setEntity(initialEntity);
      setProjectLocation(customer.businessSegment ? `${customer.name} - ${customer.businessSegment}` : customer.name);
      setService(customer.currentService || customer.potentialService || 'Dedicated Fleet Logistics');
      setOperationalRegion(customer.city ? `${customer.city}, ${customer.province || 'Indonesia'}` : 'Jabodetabek Corridor');
      setOrigin(customer.city || 'Jakarta');
      setDestination('Regional DC / Client Plant');
      setTotalUnit(10);
      setUnitType('CDD Box Truck');
      setPaPercentage(90);
      setDtPercentage(10);
      setEstimatedTrips(120);
      setEstimatedVolume('500 Tons / Month');
      setSla('99.5% On-Time Delivery adherence, GPS active tracking');
      setEffectiveDate('2026-10-05');
      setEndDate('2027-10-04');
      setStatus('Active');
      setNotes('');
    }
  }, [isOpen, profileToEdit, customer]);

  // Real-time validation of PA% + DT%
  useEffect(() => {
    const pa = paPercentage !== '' ? Number(paPercentage) : undefined;
    const dt = dtPercentage !== '' ? Number(dtPercentage) : undefined;

    if (pa !== undefined && dt !== undefined) {
      const res = validateAvailabilityBreakdown(pa, dt);
      if (!res.isValid && res.warning) {
        setAvailabilityWarning(res.warning);
      } else {
        setAvailabilityWarning(null);
      }
    } else {
      setAvailabilityWarning(null);
    }
  }, [paPercentage, dtPercentage, validateAvailabilityBreakdown]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectLocation.trim()) {
      showToast('Project / Location is required.', 'error', 'Validation Error');
      return;
    }
    if (!service.trim()) {
      showToast('Service is required.', 'error', 'Validation Error');
      return;
    }
    if (!origin.trim() || !destination.trim()) {
      showToast('Origin and Destination routes are required.', 'error', 'Validation Error');
      return;
    }
    if (totalUnit === '' || Number(totalUnit) <= 0) {
      showToast('Total Unit must be greater than 0.', 'error', 'Validation Error');
      return;
    }
    if (!unitType.trim()) {
      showToast('Unit Type is required.', 'error', 'Validation Error');
      return;
    }

    const paNum = paPercentage !== '' ? Number(paPercentage) : undefined;
    const dtNum = dtPercentage !== '' ? Number(dtPercentage) : undefined;

    const payload = {
      customerId: customer.id,
      entity,
      projectLocation: projectLocation.trim(),
      service: service.trim(),
      operationalRegion: operationalRegion.trim() || 'National Corridor',
      origin: origin.trim(),
      destination: destination.trim(),
      totalUnit: Number(totalUnit),
      unitType: unitType.trim(),
      paPercentage: paNum,
      dtPercentage: dtNum,
      estimatedTrips: estimatedTrips !== '' ? Number(estimatedTrips) : undefined,
      estimatedVolume: estimatedVolume.trim() || undefined,
      sla: sla.trim() || undefined,
      effectiveDate,
      endDate,
      status,
      notes: notes.trim() || undefined,
      createdBy: profileToEdit ? profileToEdit.createdBy : currentUser.name,
      updatedBy: currentUser.name,
    };

    if (profileToEdit) {
      updateOperationalProfile(profileToEdit.id, payload);
      showToast(`Operational Profile for "${payload.projectLocation}" updated successfully.`, 'success', 'Profile Updated');
    } else {
      addOperationalProfile(payload);
      showToast(`Operational Profile for "${payload.projectLocation}" created successfully.`, 'success', 'Profile Created');
    }

    onClose();
  };

  const paValue = paPercentage !== '' ? Number(paPercentage) : 0;
  const dtValue = dtPercentage !== '' ? Number(dtPercentage) : 0;
  const currentTotal = paValue + dtValue;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0070C0]/10 text-[#0070C0] flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#172B4D]">
                {profileToEdit ? 'Edit Operational Profile' : 'Add Operational Profile'}
              </h2>
              <p className="text-xs text-slate-500">
                Customer: <strong className="text-slate-700">{customer.name}</strong> ({customer.code})
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[78vh] overflow-y-auto">
          {/* SECTION 1: PROJECT */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
              <span className="w-2 h-2 rounded-full bg-[#0070C0]" />
              <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
                Project Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Entity <span className="text-rose-500">*</span>
                </label>
                <select
                  value={entity}
                  onChange={(e) => setEntity(e.target.value as EntityId)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0070C0] focus:border-[#0070C0]"
                >
                  {masterData
                    .filter(m => m.category === 'Entity' && m.isActive)
                    .map(m => (
                      <option key={m.code} value={m.code}>
                        {m.code} — {m.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Project / Location <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={projectLocation}
                  onChange={(e) => setProjectLocation(e.target.value)}
                  placeholder="e.g. GIIC Cikarang Logistics Hub"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0070C0] focus:border-[#0070C0]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Service <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  placeholder="e.g. Car Carrier Distribution, Milk-Run Haulage"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0070C0] focus:border-[#0070C0]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Operational Region <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={operationalRegion}
                  onChange={(e) => setOperationalRegion(e.target.value)}
                  placeholder="e.g. West Java Corridor, Trans-Java"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0070C0] focus:border-[#0070C0]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: ROUTE */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
                Route
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Origin <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="e.g. Cikarang Factory Plant Yard"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0070C0] focus:border-[#0070C0]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Destination <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Dealer Network West Java & Bali"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0070C0] focus:border-[#0070C0]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: FLEET */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
                Fleet & Availability
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Total Unit <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={totalUnit}
                  onChange={(e) => setTotalUnit(e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value) || 0))}
                  placeholder="e.g. 35"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-[#172B4D] focus:outline-none focus:ring-1 focus:ring-[#0070C0] focus:border-[#0070C0]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Unit Type <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={unitType}
                  onChange={(e) => setUnitType(e.target.value)}
                  placeholder="e.g. Car Carrier 6-Car Capacity, CDD Box, Prime Mover"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0070C0] focus:border-[#0070C0]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>PA Percentage (Physical Availability)</span>
                  <span className="text-[10px] text-slate-400 font-mono">%</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={paPercentage}
                  onChange={(e) => setPaPercentage(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  placeholder="e.g. 90"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0070C0] focus:border-[#0070C0]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>DT Percentage (Downtime)</span>
                  <span className="text-[10px] text-slate-400 font-mono">%</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={dtPercentage}
                  onChange={(e) => setDtPercentage(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  placeholder="e.g. 10"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0070C0] focus:border-[#0070C0]"
                />
              </div>
            </div>

            {/* Validation Breakdown Visualizer */}
            {(paPercentage !== '' || dtPercentage !== '') && (
              <div className="p-3 rounded-lg border bg-slate-50/70 border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-700">Availability Allocation</span>
                  <span className={`font-mono font-bold ${currentTotal === 100 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    Total: {currentTotal}% {currentTotal === 100 && '✓ (Balanced)'}
                  </span>
                </div>
                {/* Visual Bar */}
                <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${Math.min(100, paValue)}%` }}
                    className="bg-emerald-500 h-full transition-all"
                    title={`PA: ${paValue}%`}
                  />
                  <div
                    style={{ width: `${Math.min(100 - Math.min(100, paValue), dtValue)}%` }}
                    className="bg-amber-500 h-full transition-all"
                    title={`DT: ${dtValue}%`}
                  />
                </div>
                <div className="flex items-center gap-4 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    PA: {paValue}%
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    DT: {dtValue}%
                  </span>
                </div>
              </div>
            )}

            {/* Warning if total is not 100% */}
            {availabilityWarning && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <strong className="font-semibold block">Availability Warning:</strong>
                  <span>{availabilityWarning}</span>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4: VOLUME */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
                Volume & Frequency
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Estimated Trips (Monthly)
                </label>
                <input
                  type="number"
                  min="0"
                  value={estimatedTrips}
                  onChange={(e) => setEstimatedTrips(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                  placeholder="e.g. 180"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0070C0] focus:border-[#0070C0]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Estimated Volume
                </label>
                <input
                  type="text"
                  value={estimatedVolume}
                  onChange={(e) => setEstimatedVolume(e.target.value)}
                  placeholder="e.g. 1,080 Units / Month or 5,000 Tons"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0070C0] focus:border-[#0070C0]"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: SERVICE */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
                Service & Commitment
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  SLA (Service Level Agreement)
                </label>
                <input
                  type="text"
                  value={sla}
                  onChange={(e) => setSla(e.target.value)}
                  placeholder="e.g. Max 48h lead time, 99.5% on-time delivery adherence"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0070C0] focus:border-[#0070C0]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Effective Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0070C0] focus:border-[#0070C0]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  End Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0070C0] focus:border-[#0070C0]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Status <span className="text-rose-500">*</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OperationalProfileStatus)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0070C0] focus:border-[#0070C0]"
                >
                  <option value="Planned">Planned</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Notes / Operational Special Requirements
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Requires safety clearance and night haulage escort permits."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0070C0] focus:border-[#0070C0] resize-none"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0070C0] hover:bg-[#005a9c] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              {profileToEdit ? 'Save Changes' : 'Create Operational Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
