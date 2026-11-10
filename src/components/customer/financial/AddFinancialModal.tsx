import React, { useState, useEffect } from 'react';
import { Customer, CustomerFinancialMonthly, EntityId } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Button } from '../../ui/Button';
import {
  DollarSign,
  Calendar,
  Building2,
  FileSpreadsheet,
  AlertCircle,
  Database,
  Layers,
  Info
} from 'lucide-react';

interface AddFinancialModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  recordToEdit?: CustomerFinancialMonthly | null;
  defaultMonth?: number;
  defaultYear?: number;
}

const MONTH_OPTIONS = [
  { value: '1', label: '01 - January' },
  { value: '2', label: '02 - February' },
  { value: '3', label: '03 - March' },
  { value: '4', label: '04 - April' },
  { value: '5', label: '05 - May' },
  { value: '6', label: '06 - June' },
  { value: '7', label: '07 - July' },
  { value: '8', label: '08 - August' },
  { value: '9', label: '09 - September' },
  { value: '10', label: '10 - October' },
  { value: '11', label: '11 - November' },
  { value: '12', label: '12 - December' }
];

const DATA_SOURCES = [
  'Manual Commercial Entry',
  'SAP ERP Sync',
  'TMS Billing Import',
  'Excel Commercial Upload',
  'Contract Rate Sheet'
];

export const AddFinancialModal: React.FC<AddFinancialModalProps> = ({
  isOpen,
  onClose,
  customer,
  recordToEdit,
  defaultMonth,
  defaultYear
}) => {
  const {
    addFinancialRecord,
    updateFinancialRecord,
    showToast,
    currentUser,
    operationalProfiles
  } = useApp();

  const isEditMode = Boolean(recordToEdit);

  // Suggested projects from active operational profiles
  const customerProjects = React.useMemo(() => {
    const list = operationalProfiles
      .filter(p => p.customerId === customer.id)
      .map(p => p.projectLocation.trim())
      .filter(Boolean);
    return Array.from(new Set(list));
  }, [operationalProfiles, customer.id]);

  // Form State
  const [year, setYear] = useState<number>(defaultYear || 2026);
  const [month, setMonth] = useState<number>(defaultMonth || 9);
  const [entity, setEntity] = useState<EntityId>('PDT');
  const [segment, setSegment] = useState<string>('');
  const [projectLocation, setProjectLocation] = useState<string>('');

  // Financial Values (purely entered/imported, no invented formulas)
  const [revenue, setRevenue] = useState<string>('');
  const [truckingContract, setTruckingContract] = useState<string>('');
  const [variableCost, setVariableCost] = useState<string>('');
  const [driverCost, setDriverCost] = useState<string>('');
  const [shipmentCost, setShipmentCost] = useState<string>('');
  const [directMargin, setDirectMargin] = useState<string>('');
  const [targetDirectMargin, setTargetDirectMargin] = useState<string>('');
  const [ar, setAr] = useState<string>('');
  const [unbill, setUnbill] = useState<string>('');

  const [dataSource, setDataSource] = useState<string>('Manual Commercial Entry');
  const [externalId, setExternalId] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize or reset form state when opened or recordToEdit changes
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      if (recordToEdit) {
        setYear(recordToEdit.year);
        setMonth(recordToEdit.month);
        setEntity(recordToEdit.entity);
        setSegment(recordToEdit.segment || customer.businessSegment || '');
        setProjectLocation(recordToEdit.projectLocation || '');
        setRevenue(recordToEdit.revenue ? String(recordToEdit.revenue) : '');
        setTruckingContract(recordToEdit.truckingContract ? String(recordToEdit.truckingContract) : '');
        setVariableCost(recordToEdit.variableCost ? String(recordToEdit.variableCost) : '');
        setDriverCost(recordToEdit.driverCost ? String(recordToEdit.driverCost) : '');
        setShipmentCost(recordToEdit.shipmentCost ? String(recordToEdit.shipmentCost) : '');
        setDirectMargin(recordToEdit.directMargin ? String(recordToEdit.directMargin) : '');
        setTargetDirectMargin(recordToEdit.targetDirectMargin ? String(recordToEdit.targetDirectMargin) : '');
        setAr(recordToEdit.ar ? String(recordToEdit.ar) : '');
        setUnbill(recordToEdit.unbill ? String(recordToEdit.unbill) : '');
        setDataSource(recordToEdit.dataSource || 'Manual Commercial Entry');
        setExternalId(recordToEdit.externalId || '');
      } else {
        setYear(defaultYear || 2026);
        setMonth(defaultMonth || 9);
        setEntity(customer.operatingEntities?.[0] || 'PDT');
        setSegment(customer.businessSegment || customer.industry || 'Logistics & Distribution');
        setProjectLocation(customerProjects[0] || `${customer.city || 'Regional'} Logistics Hub`);
        setRevenue('');
        setTruckingContract('');
        setVariableCost('');
        setDriverCost('');
        setShipmentCost('');
        setDirectMargin('');
        setTargetDirectMargin('');
        setAr('');
        setUnbill('');
        setDataSource('Manual Commercial Entry');
        setExternalId('');
      }
    }
  }, [isOpen, recordToEdit, customer, defaultMonth, defaultYear, customerProjects]);

  const parseNumber = (str: string): number => {
    const clean = str.replace(/[^0-9.-]/g, '');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!segment.trim()) {
      setErrorMsg('Please specify business segment.');
      return;
    }
    if (!projectLocation.trim()) {
      setErrorMsg('Please enter project or location reference.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode && recordToEdit) {
        const result = updateFinancialRecord(recordToEdit.id, {
          year,
          month,
          entity,
          segment: segment.trim(),
          projectLocation: projectLocation.trim(),
          revenue: parseNumber(revenue),
          truckingContract: parseNumber(truckingContract),
          variableCost: parseNumber(variableCost),
          driverCost: parseNumber(driverCost),
          shipmentCost: parseNumber(shipmentCost),
          directMargin: parseNumber(directMargin),
          targetDirectMargin: parseNumber(targetDirectMargin),
          ar: parseNumber(ar),
          unbill: parseNumber(unbill),
          dataSource,
          externalId: externalId.trim() || undefined,
        });

        if (!result.success) {
          setErrorMsg(result.error || 'Failed to update financial record.');
          setIsSubmitting(false);
          return;
        }

        showToast('Monthly financial record updated successfully.', 'success', 'Financial Saved');
        onClose();
      } else {
        const result = addFinancialRecord({
          customerId: customer.id,
          year,
          month,
          entity,
          segment: segment.trim(),
          projectLocation: projectLocation.trim(),
          revenue: parseNumber(revenue),
          truckingContract: parseNumber(truckingContract),
          variableCost: parseNumber(variableCost),
          driverCost: parseNumber(driverCost),
          shipmentCost: parseNumber(shipmentCost),
          directMargin: parseNumber(directMargin),
          targetDirectMargin: parseNumber(targetDirectMargin),
          ar: parseNumber(ar),
          unbill: parseNumber(unbill),
          dataSource,
          externalId: externalId.trim() || undefined,
          lastSyncDate: new Date().toISOString().split('T')[0],
          createdBy: currentUser.name,
          updatedBy: currentUser.name,
        });

        if (!result.success) {
          setErrorMsg(result.error || 'Failed to create financial record.');
          setIsSubmitting(false);
          return;
        }

        showToast('Monthly financial record logged successfully.', 'success', 'Record Created');
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Monthly Financial Data' : 'Add Monthly Financial Data'}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div className="leading-relaxed">{errorMsg}</div>
          </div>
        )}

        {/* Customer Header Context */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Customer Account</span>
            <span className="font-bold text-slate-800">{customer.name}</span>
            <span className="text-slate-500 ml-1.5 font-mono">({customer.code})</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block text-[11px]">Commercial Mode</span>
            <span className="font-semibold text-[#0070C0]">Monthly Commercial Monitoring</span>
          </div>
        </div>

        {/* Section 1: Period & Commercial Scope */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Calendar className="w-3.5 h-3.5 text-[#0070C0]" />
            <span>1. Period & Operating Scope</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Year <span className="text-rose-500">*</span>
              </label>
              <Select
                value={String(year)}
                onChange={(e) => setYear(Number(e.target.value))}
                options={[
                  { value: '2024', label: '2024' },
                  { value: '2025', label: '2025' },
                  { value: '2026', label: '2026 (Current)' },
                  { value: '2027', label: '2027' }
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Month <span className="text-rose-500">*</span>
              </label>
              <Select
                value={String(month)}
                onChange={(e) => setMonth(Number(e.target.value))}
                options={MONTH_OPTIONS}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Operating Entity <span className="text-rose-500">*</span>
              </label>
              <Select
                value={entity}
                onChange={(e) => setEntity(e.target.value as EntityId)}
                options={[
                  { value: 'PDT', label: 'PDT - PT Pancaran Darat Transport' },
                  { value: 'PETRA', label: 'PETRA - PT Pancaran Energi Transport' },
                  { value: 'PLI', label: 'PLI - PT Pancaran Logistik Indonesia' }
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Business Segment <span className="text-rose-500">*</span>
              </label>
              <Input
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                placeholder="e.g. Automotive EV, FMCG, Bulk Mining"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Project / Location <span className="text-rose-500">*</span>
              </label>
              <Input
                value={projectLocation}
                onChange={(e) => setProjectLocation(e.target.value)}
                placeholder="e.g. Cikarang Carrier Hub, Karawang - Sunter"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 2: Commercial Financial Metrics */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              <span>2. Commercial Financial Realization (IDR)</span>
            </div>
            <span className="text-[11px] text-slate-400">Values as entered or imported</span>
          </div>

          {/* Revenue & Contract */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Revenue (IDR)
              </label>
              <Input
                type="number"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                placeholder="e.g. 1850000000"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Total realized commercial revenue</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Trucking Contract (IDR)
              </label>
              <Input
                type="number"
                value={truckingContract}
                onChange={(e) => setTruckingContract(e.target.value)}
                placeholder="e.g. 1600000000"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Trucking contract commitment basis</span>
            </div>
          </div>

          {/* Operational Cost Elements */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Variable Cost (IDR)
              </label>
              <Input
                type="number"
                value={variableCost}
                onChange={(e) => setVariableCost(e.target.value)}
                placeholder="e.g. 620000000"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Driver Cost (IDR)
              </label>
              <Input
                type="number"
                value={driverCost}
                onChange={(e) => setDriverCost(e.target.value)}
                placeholder="e.g. 210000000"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Shipment Cost (IDR)
              </label>
              <Input
                type="number"
                value={shipmentCost}
                onChange={(e) => setShipmentCost(e.target.value)}
                placeholder="e.g. 480000000"
              />
            </div>
          </div>

          {/* Direct Margin & Target DM */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-emerald-800 mb-1">
                Direct Margin (DM in IDR)
              </label>
              <Input
                type="number"
                value={directMargin}
                onChange={(e) => setDirectMargin(e.target.value)}
                placeholder="e.g. 540000000"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Entered / imported realized direct margin</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Target Direct Margin (IDR)
              </label>
              <Input
                type="number"
                value={targetDirectMargin}
                onChange={(e) => setTargetDirectMargin(e.target.value)}
                placeholder="e.g. 500000000"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Commercial budget / contract target</span>
            </div>
          </div>

          {/* AR & Unbill */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-medium text-amber-800 mb-1">
                Accounts Receivable (AR in IDR)
              </label>
              <Input
                type="number"
                value={ar}
                onChange={(e) => setAr(e.target.value)}
                placeholder="e.g. 420000000"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Outstanding customer invoiced balance</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-blue-800 mb-1">
                Unbilled Revenue (Unbill in IDR)
              </label>
              <Input
                type="number"
                value={unbill}
                onChange={(e) => setUnbill(e.target.value)}
                placeholder="e.g. 150000000"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Trips completed but pending invoice generation</span>
            </div>
          </div>
        </div>

        {/* Section 3: Data Source & External ID */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Database className="w-3.5 h-3.5 text-slate-600" />
            <span>3. Data Source & Traceability</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Data Source <span className="text-rose-500">*</span>
              </label>
              <Select
                value={dataSource}
                onChange={(e) => setDataSource(e.target.value)}
                options={DATA_SOURCES.map(s => ({ value: s, label: s }))}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                External ID / Sync Reference (Optional)
              </label>
              <Input
                value={externalId}
                onChange={(e) => setExternalId(e.target.value)}
                placeholder="e.g. SAP-INV-2026-09-082 or TMS-BATCH-99"
              />
            </div>
          </div>
        </div>

        {/* Informational Notice */}
        <div className="p-3 bg-blue-50/60 border border-blue-200/70 rounded-xl flex items-start gap-2 text-xs text-blue-800">
          <Info className="w-4 h-4 text-[#0070C0] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            Unique records are scoped by <strong>Customer, Year, Month, Entity, Segment, and Project</strong>. Duplicate prevention will safeguard against overwriting another project's monthly figures.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#0070C0] hover:bg-[#005a9c] text-white"
          >
            {isSubmitting ? 'Saving...' : (isEditMode ? 'Update Financial Data' : 'Save Monthly Financial Data')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
