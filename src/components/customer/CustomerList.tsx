import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Customer, EntityId } from '../../types';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  MoreVertical,
  Edit,
  Eye,
  UserX,
  UserCheck,
  ChevronLeft,
  Users
} from 'lucide-react';
import { StatusBadge } from '../layout/StatusBadge';
import { EntityBadge } from '../common/EntityBadge';
import { CustomerModal } from './CustomerModal';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Button } from '../ui/Button';

export const CustomerList: React.FC = () => {
  const {
    customers,
    scopedCustomers,
    currentUser,
    users,
    openCustomer360,
    updateCustomer,
    showToast
  } = useApp();

  // Search and Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Prospect' | 'Existing Customer'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [industryFilter, setIndustryFilter] = useState<string>('All');
  const [ownerFilter, setOwnerFilter] = useState<string>('All');
  const [ownershipScope, setOwnershipScope] = useState<'all' | 'mine'>('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Modals & Action Menus
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [activeMenuCustomerId, setActiveMenuCustomerId] = useState<string | null>(null);

  // Deactivate confirmation state
  const [deactivatingCustomer, setDeactivatingCustomer] = useState<Customer | null>(null);

  // Distinct industries from scoped customer data
  const industries = useMemo(() => {
    return Array.from(new Set(scopedCustomers.map(c => c.industry))).filter(Boolean);
  }, [scopedCustomers]);

  // Format currency
  const formatIDR = (val: number) => {
    if (val >= 1_000_000_000) {
      return `IDR ${(val / 1_000_000_000).toFixed(1)} B`;
    }
    if (val >= 1_000_000) {
      return `IDR ${(val / 1_000_000).toFixed(0)} M`;
    }
    return `IDR ${val.toLocaleString('id-ID')}`;
  };

  // Filtered customers based on 3-tier scoping
  const filteredCustomers = useMemo(() => {
    return scopedCustomers.filter(c => {
      // Ownership scope toggle (if user is Head Dept / Super Admin)
      if (ownershipScope === 'mine' && c.ownerId !== currentUser.id) {
        return false;
      }

      // Search
      const q = search.toLowerCase().trim();
      const matchSearch = !q || 
        c.name.toLowerCase().includes(q) || 
        c.legalEntityName.toLowerCase().includes(q) || 
        c.code.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q);

      if (!matchSearch) return false;

      // Customer Type
      if (typeFilter !== 'All' && c.customerType !== typeFilter) return false;

      // Status
      if (statusFilter !== 'All' && c.status !== statusFilter) return false;

      // Industry
      if (industryFilter !== 'All' && c.industry !== industryFilter) return false;

      // Owner
      if (ownerFilter !== 'All' && c.ownerId !== ownerFilter) return false;

      return true;
    });
  }, [scopedCustomers, ownershipScope, currentUser.id, search, typeFilter, statusFilter, industryFilter, ownerFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredCustomers.length / pageSize) || 1;
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage, pageSize]);

  // Reset to page 1 on filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter, statusFilter, industryFilter, ownerFilter, ownershipScope]);

  // Authorization helper
  const canEditCustomer = (cust: Customer) => {
    if (currentUser.role === 'Super Admin') return true;
    if (cust.ownerId === currentUser.id) return true;
    return false;
  };

  const handleEditClick = (cust: Customer, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveMenuCustomerId(null);

    if (!canEditCustomer(cust)) {
      showToast(
        `Only the owner (${cust.ownerName}) or Super Admin can edit this customer record.`,
        'warning',
        'Permission Restricted'
      );
      return;
    }

    setEditingCustomer(cust);
  };

  const handleDeactivateConfirm = () => {
    if (!deactivatingCustomer) return;

    const newStatus = deactivatingCustomer.status === 'Inactive' ? 'Active' : 'Inactive';
    updateCustomer(deactivatingCustomer.id, { status: newStatus });
    showToast(
      `Customer "${deactivatingCustomer.name}" is now marked as ${newStatus}.`,
      newStatus === 'Active' ? 'success' : 'warning'
    );
    setDeactivatingCustomer(null);
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-[#172B4D] tracking-tight">
              Customer
            </h1>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200 tabular-nums">
              {filteredCustomers.length} Records
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Central source of customer accounts, legal profiles, commercial potential, and stakeholder contacts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Ownership Scope Toggle for BD / KAM */}
          {(currentUser.role === 'Business Development' || currentUser.role === 'Key Account Management') && (
            <div className="inline-flex p-1 bg-white border border-slate-200 rounded-lg text-xs shadow-xs">
              <button
                onClick={() => setOwnershipScope('mine')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  ownershipScope === 'mine'
                    ? 'bg-[#0070C0] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                My Customers
              </button>
              <button
                onClick={() => setOwnershipScope('all')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  ownershipScope === 'all'
                    ? 'bg-[#0070C0] text-white font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Customers
              </button>
            </div>
          )}

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsAddModalOpen(true)}
            className="shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Customer</span>
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        {/* Search & Main Segmented Tabs */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Quick Segmented Type Filter */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium shrink-0">
            {(['All', 'Prospect', 'Existing Customer'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setTypeFilter(tab)}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  typeFilter === tab
                    ? 'bg-white text-[#172B4D] font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab === 'Existing Customer' ? 'Existing' : tab}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer..."
              className="w-full pl-9 pr-4 py-1.5 text-xs text-[#172B4D] bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0070C0]/20 focus:border-[#0070C0] transition-all"
            />
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-semibold text-[11px] uppercase tracking-wider">Filters:</span>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:border-[#0070C0] cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          {/* Industry Filter */}
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:border-[#0070C0] cursor-pointer"
          >
            <option value="All">All Industries</option>
            {industries.map(ind => (
              <option key={ind} value={ind}>{ind}</option>
            ))}
          </select>

          {/* Owner Filter */}
          <select
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:border-[#0070C0] cursor-pointer"
          >
            <option value="All">All Owners</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role.includes('BD') || u.role.includes('Development') ? 'BD' : u.role.includes('Key') ? 'KAM' : 'Admin'})
              </option>
            ))}
          </select>

          {(typeFilter !== 'All' || statusFilter !== 'All' || industryFilter !== 'All' || ownerFilter !== 'All' || search || ownershipScope !== 'all') && (
            <button
              onClick={() => {
                setTypeFilter('All');
                setStatusFilter('All');
                setIndustryFilter('All');
                setOwnerFilter('All');
                setOwnershipScope('all');
                setSearch('');
              }}
              className="text-xs text-rose-600 hover:underline ml-auto font-medium cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Customer Modern Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-3">Customer Type</th>
                <th className="py-3 px-3">Operating Entities</th>
                <th className="py-3 px-3">Industry</th>
                <th className="py-3 px-3">Owner</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Potential Revenue</th>
                <th className="py-3 px-3 text-right">Last Activity</th>
                <th className="py-3 px-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-400">
                      <Building2 className="w-5 h-5 opacity-40" />
                    </div>
                    <p className="font-semibold text-slate-700 text-xs">No customers found.</p>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-0.5">Try adjusting your filters or register a new customer account.</p>
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map(c => (
                  <tr
                    key={c.id}
                    onClick={() => openCustomer360(c.id)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors group relative"
                  >
                    {/* Customer */}
                    <td className="py-3.5 px-4 font-normal">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0070C0] border border-blue-100 flex items-center justify-center font-normal text-xs shrink-0 mt-0.5 group-hover:bg-[#0070C0] group-hover:text-white transition-colors">
                          {c.name.slice(3, 5).trim() || 'PT'}
                        </div>
                        <div>
                          <div className="font-normal text-[#172B4D] group-hover:text-[#0070C0] transition-colors flex items-center gap-1.5">
                            <span>{c.name}</span>
                            <span className="font-mono text-[10px] text-slate-400 font-normal">{c.code}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Customer Type */}
                    <td className="py-3.5 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-normal ${
                        c.customerType === 'Existing Customer' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : 'bg-blue-50 text-[#0070C0] border border-blue-100'
                      }`}>
                        {c.customerType}
                      </span>
                    </td>

                    {/* Operating Entities */}
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        {(c.operatingEntities && c.operatingEntities.length > 0 ? c.operatingEntities : ['PETRA', 'PDT', 'PLI'] as EntityId[]).map(eId => (
                          <EntityBadge key={eId} entity={eId} size="sm" />
                        ))}
                      </div>
                    </td>

                    {/* Industry */}
                    <td className="py-3.5 px-3 text-slate-600 font-normal">
                      <div>{c.industry}</div>
                    </td>

                    {/* Owner */}
                    <td className="py-3.5 px-3 text-slate-700 font-normal">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-normal">
                          {c.ownerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <span>{c.ownerName}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3">
                      <StatusBadge status={c.status} size="sm" />
                    </td>

                    {/* Potential Revenue */}
                    <td className="py-3.5 px-3 text-right font-normal text-[#172B4D] tabular-nums">
                      {formatIDR(c.potentialRevenue)}
                    </td>

                    {/* Last Activity */}
                    <td className="py-3.5 px-3 text-right text-slate-500 tabular-nums">
                      {c.lastUpdated}
                    </td>

                    {/* Row Action Menu */}
                    <td className="py-3.5 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="relative inline-block text-left">
                        <button
                          type="button"
                          onClick={() => setActiveMenuCustomerId(activeMenuCustomerId === c.id ? null : c.id)}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          aria-label="Row actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuCustomerId === c.id && (
                          <div
                            className="absolute right-0 mt-1 w-36 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-30 animate-in fade-in-50 duration-150 text-left"
                            onMouseLeave={() => setActiveMenuCustomerId(null)}
                          >
                            <button
                              onClick={() => {
                                setActiveMenuCustomerId(null);
                                openCustomer360(c.id);
                              }}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#0070C0]" />
                              <span>View 360°</span>
                            </button>

                            <button
                              onClick={(e) => handleEditClick(c, e)}
                              className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                            >
                              <Edit className="w-3.5 h-3.5 text-amber-600" />
                              <span>Edit Customer</span>
                            </button>

                            <button
                              onClick={() => {
                                setActiveMenuCustomerId(null);
                                if (!canEditCustomer(c)) {
                                  showToast(
                                    `Only the owner (${c.ownerName}) or Super Admin can deactivate this customer.`,
                                    'warning',
                                    'Permission Restricted'
                                  );
                                  return;
                                }
                                setDeactivatingCustomer(c);
                              }}
                              className={`w-full px-3 py-1.5 text-xs flex items-center gap-2 cursor-pointer font-medium ${
                                c.status === 'Inactive'
                                  ? 'text-emerald-700 hover:bg-emerald-50'
                                  : 'text-rose-600 hover:bg-rose-50'
                              }`}
                            >
                              {c.status === 'Inactive' ? (
                                <>
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>Activate</span>
                                </>
                              ) : (
                                <>
                                  <UserX className="w-3.5 h-3.5" />
                                  <span>Deactivate</span>
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="px-4 py-3 bg-slate-50/60 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <strong className="text-[#172B4D]">{filteredCustomers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to{' '}
            <strong className="text-[#172B4D]">{Math.min(currentPage * pageSize, filteredCustomers.length)}</strong> of{' '}
            <strong className="text-[#172B4D]">{filteredCustomers.length}</strong> customers
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Previous page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const pageNum = i + 1;
                const isCurrent = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-[#0070C0] text-white shadow-xs'
                        : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Next page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      <CustomerModal
        isOpen={isAddModalOpen || Boolean(editingCustomer)}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingCustomer(null);
        }}
        customerToEdit={editingCustomer}
      />

      {/* Deactivate Confirmation Dialog */}
      {deactivatingCustomer && (
        <ConfirmDialog
          isOpen={Boolean(deactivatingCustomer)}
          onClose={() => setDeactivatingCustomer(null)}
          onConfirm={handleDeactivateConfirm}
          title={deactivatingCustomer.status === 'Inactive' ? 'Activate Customer' : 'Deactivate Customer'}
          message={`Are you sure you want to ${
            deactivatingCustomer.status === 'Inactive' ? 'reactivate' : 'deactivate'
          } "${deactivatingCustomer.name}"? ${
            deactivatingCustomer.status === 'Inactive'
              ? 'This account will become active for commercial pipeline tracking.'
              : 'This account will be marked inactive in the registry.'
          }`}
          confirmText={deactivatingCustomer.status === 'Inactive' ? 'Activate' : 'Deactivate'}
          variant={deactivatingCustomer.status === 'Inactive' ? 'primary' : 'warning'}
        />
      )}
    </div>
  );
};
