import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer, CustomerType, CustomerStatus, EntityId } from '../../types';
import { ENTITIES } from '../../data/mockData';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { EntityBadge } from '../common/EntityBadge';
import { AlertTriangle, Building2, ArrowRight } from 'lucide-react';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerToEdit?: Customer | null;
  onSuccess?: (customerId: string) => void;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  customerToEdit,
  onSuccess
}) => {
  const {
    currentUser,
    users,
    masterData,
    entitiesMap,
    checkDuplicateCustomer,
    addCustomer,
    updateCustomer,
    openCustomer360,
    showToast
  } = useApp();

  const isEditMode = Boolean(customerToEdit);

  // Form State
  const [name, setName] = useState('');
  const [legalEntityName, setLegalEntityName] = useState('');
  const [customerType, setCustomerType] = useState<CustomerType>('Prospect');
  const [industry, setIndustry] = useState('Automotive');
  const [businessSegment, setBusinessSegment] = useState('Strategic Account');
  const [website, setWebsite] = useState('');
  const [phone, setPhone] = useState('');

  // Legal Information
  const [npwp, setNpwp] = useState('');
  const [nib, setNib] = useState('');

  // Location
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('Jawa Barat');
  const [country, setCountry] = useState('Indonesia');

  // Commercial Information
  const [currentService, setCurrentService] = useState('');
  const [potentialService, setPotentialService] = useState('');
  const [potentialRevenue, setPotentialRevenue] = useState<number>(1000000000);
  const [estimatedVolume, setEstimatedVolume] = useState('');
  const [competitor, setCompetitor] = useState('');
  const [paymentTerm, setPaymentTerm] = useState('TOP 30 Days');
  const [status, setStatus] = useState<CustomerStatus>('Prospect');

  // Operating Entities (Pancaran Group)
  const [operatingEntities, setOperatingEntities] = useState<EntityId[]>(['PETRA', 'PDT', 'PLI']);

  // Ownership
  const [ownerId, setOwnerId] = useState(currentUser.id);

  // Duplicate Check Result
  const [duplicateWarning, setDuplicateWarning] = useState<{
    found: boolean;
    customer?: Customer;
    message?: string;
  } | null>(null);

  // Reset or Populate Form
  useEffect(() => {
    if (customerToEdit) {
      setName(customerToEdit.name || '');
      setLegalEntityName(customerToEdit.legalEntityName || '');
      setCustomerType(customerToEdit.customerType || 'Prospect');
      setIndustry(customerToEdit.industry || 'Automotive');
      setBusinessSegment(customerToEdit.businessSegment || 'Strategic Account');
      setWebsite(customerToEdit.website || '');
      setPhone(customerToEdit.phone || '');
      setNpwp(customerToEdit.npwp || '');
      setNib(customerToEdit.nib || '');
      setAddress(customerToEdit.address || '');
      setCity(customerToEdit.city || '');
      setProvince(customerToEdit.province || 'Jawa Barat');
      setCountry(customerToEdit.country || 'Indonesia');
      setCurrentService(customerToEdit.currentService || '');
      setPotentialService(customerToEdit.potentialService || '');
      setPotentialRevenue(customerToEdit.potentialRevenue || 0);
      setEstimatedVolume(customerToEdit.estimatedVolume || '');
      setCompetitor(customerToEdit.competitor || '');
      setPaymentTerm(customerToEdit.paymentTerm || 'TOP 30 Days');
      setStatus(customerToEdit.status || 'Prospect');
      setOperatingEntities(customerToEdit.operatingEntities && customerToEdit.operatingEntities.length > 0 ? customerToEdit.operatingEntities : ['PETRA', 'PDT', 'PLI']);
      setOwnerId(customerToEdit.ownerId || currentUser.id);
      setDuplicateWarning(null);
    } else {
      setName('');
      setLegalEntityName('');
      setCustomerType('Prospect');
      setIndustry('Automotive');
      setBusinessSegment('Strategic Account');
      setWebsite('');
      setPhone('');
      setNpwp('');
      setNib('');
      setAddress('');
      setCity('');
      setProvince('Jawa Barat');
      setCountry('Indonesia');
      setCurrentService('');
      setPotentialService('');
      setPotentialRevenue(1000000000);
      setEstimatedVolume('');
      setCompetitor('');
      setPaymentTerm('TOP 30 Days');
      setStatus('Prospect');
      setOperatingEntities(['PETRA', 'PDT', 'PLI']);
      setOwnerId(currentUser.id);
      setDuplicateWarning(null);
    }
  }, [customerToEdit, isOpen, currentUser.id]);

  if (!isOpen) return null;

  const industries = masterData.filter(m => m.category === 'Industry' && m.isActive).map(m => m.name);
  const segments = masterData.filter(m => m.category === 'Business Segment' && m.isActive).map(m => m.name);
  const eligibleOwners = users.filter(u => u.status === 'Active' && (u.role === 'Business Development' || u.role === 'Key Account Management' || u.role === 'Super Admin'));

  // Live duplicate check when typing key fields
  const handleCheckDuplicates = () => {
    // Only check duplicates if creating or if values changed in edit mode
    const res = checkDuplicateCustomer(
      {
        name,
        legalEntityName,
        npwp,
        nib,
        website,
        phone
      },
      customerToEdit?.id
    );

    if (res.isDuplicate) {
      setDuplicateWarning({
        found: true,
        customer: res.duplicateCustomer,
        message: res.message
      });
      return true;
    } else {
      setDuplicateWarning(null);
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('Please enter Customer Name', 'warning');
      return;
    }

    // Check duplicate
    const isDup = handleCheckDuplicates();
    if (isDup) {
      showToast('Potential duplicate customer found. Please review existing record.', 'warning');
      return;
    }

    const assignedOwner = users.find(u => u.id === ownerId) || currentUser;

    if (isEditMode && customerToEdit) {
      // Permission check: BD and KAM can primarily edit customers they own
      const isSuperAdmin = currentUser.role === 'Super Admin';
      const isOwner = customerToEdit.ownerId === currentUser.id;
      if (!isSuperAdmin && !isOwner) {
        showToast('You do not have permission to edit customers owned by another representative.', 'error', 'Permission Denied');
        return;
      }

      updateCustomer(customerToEdit.id, {
        name: name.trim(),
        legalEntityName: legalEntityName.trim() || name.trim(),
        customerType,
        industry,
        businessSegment,
        address,
        city,
        province,
        country,
        website,
        npwp,
        nib,
        phone,
        status,
        operatingEntities,
        ownerId: assignedOwner.id,
        ownerName: assignedOwner.name,
        ownerRole: assignedOwner.role,
        potentialRevenue: Number(potentialRevenue) || 0,
        currentService,
        potentialService,
        estimatedVolume,
        competitor,
        paymentTerm,
      });

      showToast(`Customer "${name}" updated successfully.`, 'success');
      onClose();
      if (onSuccess) onSuccess(customerToEdit.id);
    } else {
      // Add Customer
      const result = addCustomer({
        name: name.trim(),
        legalEntityName: legalEntityName.trim() || name.trim(),
        customerType,
        industry,
        businessSegment,
        address,
        city,
        province,
        country,
        website,
        npwp,
        nib,
        phone,
        status,
        operatingEntities,
        ownerId: assignedOwner.id,
        ownerName: assignedOwner.name,
        ownerRole: assignedOwner.role,
        potentialRevenue: Number(potentialRevenue) || 0,
        currentService,
        potentialService,
        estimatedVolume,
        competitor,
        paymentTerm,
      });

      if (result.success && result.customer) {
        showToast(`Customer "${result.customer.name}" created successfully.`, 'success');
        onClose();
        if (onSuccess) {
          onSuccess(result.customer.id);
        } else {
          openCustomer360(result.customer.id);
        }
      } else {
        setDuplicateWarning({
          found: true,
          message: result.error
        });
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? `Edit Customer: ${customerToEdit?.name}` : 'Add New Customer'}
      description="Central source of customer data divided into corporate, legal, location, and commercial profiles."
      maxWidth="3xl"
    >
      <div className="space-y-5">
        {/* Duplicate Warning Banner */}
        {duplicateWarning && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <h4 className="font-bold text-amber-900">
                Potential duplicate customer found.
              </h4>
              <p className="text-amber-800 mt-0.5">
                {duplicateWarning.message || 'Please review existing customer before creating a new record.'}
              </p>
              {duplicateWarning.customer && (
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      openCustomer360(duplicateWarning.customer!.id);
                    }}
                    className="px-3 py-1 bg-amber-600 text-white font-semibold rounded-md hover:bg-amber-700 text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <span>Review Existing: {duplicateWarning.customer.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDuplicateWarning(null)}
                    className="px-2.5 py-1 text-slate-600 hover:text-slate-800 text-xs cursor-pointer"
                  >
                    Dismiss Warning
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-1">
          {/* Section 1: Basic Information */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
                1. Basic Information
              </h3>
              {isEditMode && (
                <span className="text-[11px] font-mono text-slate-400">
                  ID: {customerToEdit?.code}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Customer Name *"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (duplicateWarning) setDuplicateWarning(null);
                }}
                onBlur={handleCheckDuplicates}
                placeholder="e.g. PT Nusantara Logistik"
              />

              <Input
                label="Legal Entity Name"
                value={legalEntityName}
                onChange={(e) => setLegalEntityName(e.target.value)}
                onBlur={handleCheckDuplicates}
                placeholder="e.g. PT Nusantara Logistik Indonesia Tbk"
              />

              <Select
                label="Customer Type *"
                value={customerType}
                onChange={(e) => setCustomerType(e.target.value as CustomerType)}
              >
                <option value="Prospect">Prospect</option>
                <option value="Existing Customer">Existing Customer</option>
              </Select>

              <Select
                label="Industry *"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
              >
                {industries.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </Select>

              <Select
                label="Business Segment"
                value={businessSegment}
                onChange={(e) => setBusinessSegment(e.target.value)}
              >
                {segments.map(seg => (
                  <option key={seg} value={seg}>{seg}</option>
                ))}
              </Select>

              <Input
                label="Official Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={handleCheckDuplicates}
                placeholder="+62 21 8900 1234"
              />

              <div className="sm:col-span-2">
                <Input
                  label="Website URL"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  onBlur={handleCheckDuplicates}
                  placeholder="https://company.co.id"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Legal Information */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider border-b border-slate-100 pb-2">
              2. Legal Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="NPWP (Tax Identification Number)"
                value={npwp}
                onChange={(e) => setNpwp(e.target.value)}
                onBlur={handleCheckDuplicates}
                placeholder="01.234.567.8-901.000"
              />

              <Input
                label="NIB (Nomor Induk Berusaha)"
                value={nib}
                onChange={(e) => setNib(e.target.value)}
                onBlur={handleCheckDuplicates}
                placeholder="9120001234567"
              />
            </div>
          </div>

          {/* Section 3: Location */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider border-b border-slate-100 pb-2">
              3. Location
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <Input
                label="City / Regency"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Cikarang, Karawang"
              />

              <Input
                label="Province"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                placeholder="e.g. Jawa Barat"
              />

              <Input
                label="Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Indonesia"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#172B4D] mb-1.5">
                Full Registered Address
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address, Industrial Estate, Kav/Lot number"
                className="w-full text-xs text-[#172B4D] bg-white border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#0070C0]/20 focus:border-[#0070C0]"
              />
            </div>
          </div>

          {/* Section 4: Commercial Information */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider border-b border-slate-100 pb-2">
              4. Commercial Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <Input
                label="Current Service (if any)"
                value={currentService}
                onChange={(e) => setCurrentService(e.target.value)}
                placeholder="e.g. FTL Wingbox, Cross-docking"
              />

              <Input
                label="Potential Logistics Service"
                value={potentialService}
                onChange={(e) => setPotentialService(e.target.value)}
                placeholder="e.g. Dedicated Fleet, Cold Storage DC"
              />

              <Input
                label="Estimated Potential Revenue (IDR)"
                type="number"
                value={potentialRevenue}
                onChange={(e) => setPotentialRevenue(Number(e.target.value))}
                placeholder="e.g. 5000000000"
              />

              <Input
                label="Estimated Logistics Volume"
                value={estimatedVolume}
                onChange={(e) => setEstimatedVolume(e.target.value)}
                placeholder="e.g. 120 trips / month or 5,000 pallets"
              />

              <Input
                label="Incumbent Competitor"
                value={competitor}
                onChange={(e) => setCompetitor(e.target.value)}
                placeholder="e.g. PT Puninar, PT Ceva Logistics"
              />

              <Input
                label="Payment Term"
                value={paymentTerm}
                onChange={(e) => setPaymentTerm(e.target.value)}
                placeholder="e.g. TOP 30 Days, TOP 45 Days"
              />

              <Select
                label="Status *"
                value={status}
                onChange={(e) => setStatus(e.target.value as CustomerStatus)}
              >
                <option value="Prospect">Prospect</option>
                <option value="Qualified">Qualified</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Select>
            </div>
          </div>

          {/* Section 5: Operating Entities */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider border-b border-slate-100 pb-2">
              5. Operating Entities (Pancaran Group)
            </h3>
            <p className="text-xs text-slate-500">
              Select which operating entities in Pancaran Group service or have commercial relations with this customer.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(Object.keys(entitiesMap) as EntityId[]).map(eId => {
                const ent = entitiesMap[eId];
                const isChecked = operatingEntities.includes(eId);
                return (
                  <label
                    key={eId}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border transition-colors cursor-pointer ${
                      isChecked ? 'bg-blue-50/50 border-blue-200' : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setOperatingEntities(prev => [...prev, eId]);
                        } else {
                          // Prevent unchecking all if at least one is required
                          if (operatingEntities.length === 1) {
                            showToast('Customer must be associated with at least one operating entity.', 'warning');
                            return;
                          }
                          setOperatingEntities(prev => prev.filter(id => id !== eId));
                        }
                      }}
                      className="w-4 h-4 text-[#0070C0] rounded border-slate-300 focus:ring-[#0070C0]"
                    />
                    <div>
                      <div className="font-semibold text-xs text-[#172B4D]">{ent.code}</div>
                      <div className="text-[11px] text-slate-500">{ent.name}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Section 6: Ownership */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider border-b border-slate-100 pb-2">
              6. Ownership
            </h3>

            <div>
              <Select
                label="Account Owner (BD / KAM) *"
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                disabled={currentUser.role === 'Business Development' || currentUser.role === 'Key Account Management'}
                helperText={
                  currentUser.role === 'Business Development' || currentUser.role === 'Key Account Management'
                    ? 'Automatically assigned to your account.'
                    : 'Super Admin / Head Department can assign ownership to any commercial representative.'
                }
              >
                {eligibleOwners.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              {isEditMode ? 'Save Customer Changes' : 'Create Customer Record'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
