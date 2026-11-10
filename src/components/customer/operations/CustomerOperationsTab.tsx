import React, { useState, useMemo } from 'react';
import { Customer, OperationalProfile, OperationalProfileStatus } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { StatusBadge } from '../../layout/StatusBadge';
import { EntityBadge } from '../../common/EntityBadge';
import { AddOperationalProfileModal } from './AddOperationalProfileModal';
import { OperationalProfileDetailModal } from './OperationalProfileDetailModal';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import {
  Truck,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  MapPin,
  ArrowRight,
  Layers,
  Activity,
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface CustomerOperationsTabProps {
  customer: Customer;
}

export const CustomerOperationsTab: React.FC<CustomerOperationsTabProps> = ({ customer }) => {
  const {
    operationalProfiles,
    deleteOperationalProfile,
    showToast,
  } = useApp();

  // Operational profiles belonging to this customer
  const customerProfiles = useMemo(() => {
    return operationalProfiles.filter(p => p.customerId === customer.id);
  }, [operationalProfiles, customer.id]);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [profileToEdit, setProfileToEdit] = useState<OperationalProfile | null>(null);
  const [selectedDetailProfile, setSelectedDetailProfile] = useState<OperationalProfile | null>(null);

  // Delete Confirm Dialog State
  const [profileToDelete, setProfileToDelete] = useState<OperationalProfile | null>(null);

  // Search & Filter state
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [entityFilter, setEntityFilter] = useState<string>('ALL');

  // KPI Calculations based on ACTIVE operational profiles (avoid double counting)
  const kpis = useMemo(() => {
    const activeProfiles = customerProfiles.filter(p => p.status === 'Active');

    // Total Units: sum of totalUnit across active operational profiles
    const totalUnits = activeProfiles.reduce((sum, p) => sum + (p.totalUnit || 0), 0);

    // Active Projects: unique active projectLocation names
    const uniqueProjects = new Set(activeProfiles.map(p => p.projectLocation.trim().toLowerCase()));
    const activeProjects = uniqueProjects.size;

    // Active Routes: unique active origin -> destination routes
    const uniqueRoutes = new Set(activeProfiles.map(p => `${p.origin.trim().toLowerCase()}->${p.destination.trim().toLowerCase()}`));
    const activeRoutes = uniqueRoutes.size;

    // Active Services: unique active services
    const uniqueServices = new Set(activeProfiles.map(p => p.service.trim().toLowerCase()));
    const activeServices = uniqueServices.size;

    return {
      totalUnits,
      activeProjects,
      activeRoutes,
      activeServices,
    };
  }, [customerProfiles]);

  // Filtered profiles list for table
  const filteredProfiles = useMemo(() => {
    return customerProfiles.filter(p => {
      const q = searchFilter.toLowerCase();
      const matchesSearch =
        p.projectLocation.toLowerCase().includes(q) ||
        p.service.toLowerCase().includes(q) ||
        p.origin.toLowerCase().includes(q) ||
        p.destination.toLowerCase().includes(q) ||
        p.unitType.toLowerCase().includes(q) ||
        p.operationalRegion.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
      const matchesEntity = entityFilter === 'ALL' || p.entity === entityFilter;

      return matchesSearch && matchesStatus && matchesEntity;
    });
  }, [customerProfiles, searchFilter, statusFilter, entityFilter]);

  // Handlers
  const handleOpenAdd = () => {
    setProfileToEdit(null);
    setIsAddModalOpen(true);
  };

  const handleEdit = (profile: OperationalProfile) => {
    setProfileToEdit(profile);
    setIsAddModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!profileToDelete) return;
    deleteOperationalProfile(profileToDelete.id);
    showToast(`Operational Profile for "${profileToDelete.projectLocation}" removed.`, 'info', 'Profile Deleted');
    setProfileToDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* HEADER: Title & + Add Operational Profile Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#172B4D]">Operational Profile</h2>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
              {customerProfiles.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational fleet, service logistics routing, availability targets, and SLAs for {customer.name}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-3.5 py-2 bg-[#0070C0] hover:bg-[#005a9c] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Operational Profile</span>
        </button>
      </div>

      {/* TOP SUMMARY / KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Total Units */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Units
            </span>
            <span className="p-1.5 bg-blue-50 text-[#0070C0] rounded-lg">
              <Truck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-[#172B4D] mt-2 tabular-nums">
            {kpis.totalUnits}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Active committed fleet
          </div>
        </div>

        {/* Active Projects */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Active Projects
            </span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2 tabular-nums">
            {kpis.activeProjects}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Live project sites
          </div>
        </div>

        {/* Active Routes */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Active Routes
            </span>
            <span className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
              <MapPin className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-purple-700 mt-2 tabular-nums">
            {kpis.activeRoutes}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Unique origin-destination pairs
          </div>
        </div>

        {/* Active Services */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Active Services
            </span>
            <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-2 tabular-nums">
            {kpis.activeServices}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Service categories running
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search by project, service, origin, destination, unit type..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0070C0] focus:border-[#0070C0]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#0070C0]"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Planned">Planned</option>
              <option value="Inactive">Inactive</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Entity Filter */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#0070C0]"
            >
              <option value="ALL">All Entities</option>
              <option value="PETRA">PETRA</option>
              <option value="PDT">PDT</option>
              <option value="PLI">PLI</option>
            </select>
          </div>
        </div>
      </div>

      {/* OPERATIONAL TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Project / Location</th>
                <th className="py-3 px-3">Service</th>
                <th className="py-3 px-3">Route</th>
                <th className="py-3 px-3 text-right">Total Unit</th>
                <th className="py-3 px-3">Unit Type</th>
                <th className="py-3 px-3">Entity</th>
                <th className="py-3 px-3">Effective Date</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProfiles.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <Truck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-600 text-xs">No Operational Profiles Found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {customerProfiles.length === 0
                        ? 'Click "+ Add Operational Profile" to establish fleet allocation and routes.'
                        : 'No profiles match the active search/filter criteria.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProfiles.map((p) => {
                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => setSelectedDetailProfile(p)}
                    >
                      {/* Project / Location */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#172B4D] group-hover:text-[#0070C0] transition-colors">
                          {p.projectLocation}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{p.operationalRegion}</span>
                        </div>
                      </td>

                      {/* Service */}
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-700 block">
                          {p.service}
                        </span>
                        {p.sla && (
                          <span className="text-[10px] text-slate-400 truncate max-w-[140px] block" title={p.sla}>
                            SLA: {p.sla}
                          </span>
                        )}
                      </td>

                      {/* Route */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <span className="text-slate-800">{p.origin}</span>
                          <ArrowRight className="w-3 h-3 text-[#0070C0] shrink-0" />
                          <span className="text-slate-800">{p.destination}</span>
                        </div>
                        {p.estimatedTrips && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {p.estimatedTrips} trips/mo · {p.estimatedVolume || 'Standard vol'}
                          </div>
                        )}
                      </td>

                      {/* Total Unit */}
                      <td className="py-3 px-3 text-right">
                        <div className="font-bold text-sm text-[#172B4D] tabular-nums">
                          {p.totalUnit}
                        </div>
                        {p.paPercentage !== undefined && (
                          <div className="text-[10px] text-emerald-600 font-mono">
                            PA {p.paPercentage}%
                          </div>
                        )}
                      </td>

                      {/* Unit Type */}
                      <td className="py-3 px-3">
                        <span className="font-medium text-slate-700 block">
                          {p.unitType}
                        </span>
                        {p.dtPercentage !== undefined && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            DT {p.dtPercentage}%
                          </span>
                        )}
                      </td>

                      {/* Entity */}
                      <td className="py-3 px-3">
                        <EntityBadge entity={p.entity} size="sm" />
                      </td>

                      {/* Effective Date */}
                      <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">
                        <div>{p.effectiveDate}</div>
                        <div className="text-[10px] text-slate-400">to {p.endDate}</div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <StatusBadge status={p.status} size="sm" />
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3 px-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedDetailProfile(p)}
                            title="View Details"
                            className="p-1.5 text-slate-500 hover:text-[#0070C0] hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleEdit(p)}
                            title="Edit Profile"
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setProfileToDelete(p)}
                            title="Delete Profile"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* Add / Edit Operational Profile Modal */}
      <AddOperationalProfileModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setProfileToEdit(null);
        }}
        customer={customer}
        profileToEdit={profileToEdit}
      />

      {/* Operational Profile Detail View Modal */}
      <OperationalProfileDetailModal
        isOpen={!!selectedDetailProfile}
        onClose={() => setSelectedDetailProfile(null)}
        profile={selectedDetailProfile}
        customer={customer}
        onEdit={(profile) => {
          setSelectedDetailProfile(null);
          handleEdit(profile);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!profileToDelete}
        onClose={() => setProfileToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Operational Profile"
        message={`Are you sure you want to delete the operational profile for "${profileToDelete?.projectLocation}"? This action will remove the route and unit records.`}
        confirmText="Delete Profile"
        variant="danger"
      />
    </div>
  );
};
