import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MasterDataItem } from '../../types';
import { Database, Plus, Search, Edit2, Check, X, ShieldAlert, Tag, Filter, ShieldCheck } from 'lucide-react';
import { StatusBadge } from '../layout/StatusBadge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';

export const MasterDataView: React.FC = () => {
  const {
    masterData,
    addMasterDataItem,
    updateMasterDataItem,
    toggleMasterDataStatus,
    users,
    currentUser,
    showToast
  } = useApp();

  const isSuperAdmin = currentUser.role === 'Super Admin';

  const categories = [
    'Entity',
    'Industry',
    'Business Segment',
    'Service',
    'Activity Type',
    'Customer Type',
    'Customer Status',
    'Lost Reason',
    'PICA Priority',
    'PICA Status',
    'Department',
    'Position Title'
  ] as const;

  type CategoryType = typeof categories[number];

  const [activeCategory, setActiveCategory] = useState<CategoryType>('Entity');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');

  // Add Item Modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addCode, setAddCode] = useState('');
  const [addName, setAddName] = useState('');
  const [addDesc, setAddDesc] = useState('');
  const [addHeadUserId, setAddHeadUserId] = useState('');

  // Edit Item Modal
  const [editingItem, setEditingItem] = useState<MasterDataItem | null>(null);
  const [editCode, setEditCode] = useState('');
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editHeadUserId, setEditHeadUserId] = useState('');

  const filteredItems = masterData.filter(m => {
    if (m.category !== activeCategory) return false;

    if (statusFilter === 'Active' && !m.isActive) return false;
    if (statusFilter === 'Inactive' && m.isActive) return false;

    if (search) {
      const q = search.toLowerCase().trim();
      const match = m.name.toLowerCase().includes(q) || m.code.toLowerCase().includes(q) || (m.description && m.description.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) {
      showToast('Item name is required.', 'warning');
      return;
    }

    const generatedCode = addCode.trim() || addName.trim().slice(0, 4).toUpperCase();

    // Check duplicate code in same category
    const exists = masterData.some(m => m.category === activeCategory && m.code.toLowerCase() === generatedCode.toLowerCase());
    if (exists) {
      showToast(`Code "${generatedCode}" already exists for category ${activeCategory}.`, 'warning');
      return;
    }

    const headUser = activeCategory === 'Department' ? users.find(u => u.id === addHeadUserId) : undefined;

    addMasterDataItem({
      category: activeCategory,
      code: generatedCode,
      name: addName.trim(),
      description: addDesc.trim() || undefined,
      isActive: true,
      createdDate: '2026-10-05',
      headUserId: headUser?.id,
      headUserName: headUser?.name,
    });

    showToast(`Master record "${addName}" added to ${activeCategory}.`, 'success');
    setIsAddOpen(false);
    setAddCode('');
    setAddName('');
    setAddDesc('');
    setAddHeadUserId('');
  };

  const handleOpenEdit = (item: MasterDataItem) => {
    setEditingItem(item);
    setEditCode(item.code);
    setEditName(item.name);
    setEditDesc(item.description || '');
    setEditHeadUserId(item.headUserId || '');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    if (!editName.trim()) {
      showToast('Item name is required.', 'warning');
      return;
    }

    const headUser = editingItem.category === 'Department' ? users.find(u => u.id === editHeadUserId) : undefined;

    updateMasterDataItem(editingItem.id, {
      code: editCode.trim() || editingItem.code,
      name: editName.trim(),
      description: editDesc.trim() || undefined,
      headUserId: headUser?.id,
      headUserName: headUser?.name,
    });

    showToast(`Master record "${editName}" updated successfully.`, 'success');
    setEditingItem(null);
  };

  const handleToggleStatus = (item: MasterDataItem) => {
    toggleMasterDataStatus(item.id);
    showToast(`"${item.name}" status set to ${item.isActive ? 'Inactive' : 'Active'}.`, 'info');
  };

  if (!isSuperAdmin) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-xl mx-auto my-12 space-y-4 shadow-sm">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-[#172B4D]">Super Admin Access Required</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Master Data configuration, reference code maintenance, and drop-down dictionaries are restricted to Super Administrators.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-[#172B4D] tracking-tight">
              Master Data Registry
            </h1>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              10 Reference Dictionaries
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configure dropdown reference dictionaries with soft activation/deactivation to safeguard referential data integrity.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => {
            setAddCode('');
            setAddName('');
            setAddDesc('');
            setIsAddOpen(true);
          }}
          className="bg-[#0070C0] hover:bg-[#005a9c] shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add {activeCategory}</span>
        </Button>
      </div>

      {/* 10 Category Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-xs overflow-x-auto text-xs font-medium">
        {categories.map(cat => {
          const count = masterData.filter(m => m.category === cat).length;
          const isActive = activeCategory === cat;

          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? 'bg-[#0070C0] text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <span>{cat}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search and Status Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:border-[#0070C0] cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${activeCategory} name or code...`}
            className="w-full pl-9 pr-4 py-1.5 text-xs text-[#172B4D] bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#0070C0]"
          />
        </div>
      </div>

      {/* Master Data Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-28">Code</th>
                <th className="py-3 px-4">Reference Value / Name</th>
                {activeCategory === 'Department' && (
                  <th className="py-3 px-4">Lead Approver (Head of Dept)</th>
                )}
                <th className="py-3 px-4">Description / Guidance</th>
                <th className="py-3 px-3">Created Date</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={activeCategory === 'Department' ? 7 : 6} className="py-12 text-center text-slate-400">
                    <Tag className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    No reference items found in {activeCategory}.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-normal text-slate-700 whitespace-nowrap">
                      {item.code}
                    </td>
                    <td className="py-3.5 px-4 font-normal text-[#172B4D]">
                      {item.name}
                    </td>
                    {activeCategory === 'Department' && (
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {item.headUserName ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-normal bg-purple-50 text-purple-700 border border-purple-200">
                            <ShieldCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                            <span>{item.headUserName}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic font-normal">Not Assigned</span>
                        )}
                      </td>
                    )}
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {item.description || 'Standard system reference'}
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 tabular-nums font-mono whitespace-nowrap">
                      {item.createdDate || '2026-09-01'}
                    </td>
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <StatusBadge status={item.isActive ? 'Active' : 'Inactive'} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-slate-500 hover:text-[#0070C0] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Item"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(item)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                            item.isActive
                              ? 'text-rose-600 hover:bg-rose-50 border border-rose-200'
                              : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                          }`}
                        >
                          {item.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Item Modal */}
      {isAddOpen && (
        <Modal
          isOpen={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          title={`Add ${activeCategory} Reference Item`}
          description={`Register a new standardized value for the ${activeCategory} dropdown selection.`}
          maxWidth="md"
        >
          <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
            <Input
              label="Reference Name *"
              required
              value={addName}
              onChange={(e) => setAddName(e.target.value)}
              placeholder={`e.g. Fast Moving Consumer Goods`}
            />

            <Input
              label="Reference Code (Optional, Auto-generated if empty)"
              value={addCode}
              onChange={(e) => setAddCode(e.target.value.toUpperCase())}
              placeholder="e.g. FMCG"
            />

            {activeCategory === 'Department' && (
              <div>
                <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                  Lead Approver (Head of Department)
                </label>
                <select
                  value={addHeadUserId}
                  onChange={(e) => setAddHeadUserId(e.target.value)}
                  className="w-full text-xs text-[#172B4D] bg-white border border-slate-200 rounded-lg px-3 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0070C0]/20 focus:border-[#0070C0]"
                >
                  <option value="">-- Pilih Approver / Head of Dept --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.position} ({u.role})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Pimpinan yang berhak memverifikasi dan menyetujui tiket untuk departemen ini.
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                Description / Usage Guidance (Optional)
              </label>
              <textarea
                rows={2}
                value={addDesc}
                onChange={(e) => setAddDesc(e.target.value)}
                placeholder="Scope of this category..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0070C0]/20 focus:border-[#0070C0] bg-white"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Add Reference Record
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Item Modal */}
      {editingItem && (
        <Modal
          isOpen={true}
          onClose={() => setEditingItem(null)}
          title={`Edit ${activeCategory} — ${editingItem.name}`}
          description="Update reference code, naming, or usage description."
          maxWidth="md"
        >
          <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
            <Input
              label="Reference Name *"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />

            <Input
              label="Reference Code *"
              required
              value={editCode}
              onChange={(e) => setEditCode(e.target.value.toUpperCase())}
            />

            {editingItem.category === 'Department' && (
              <div>
                <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                  Lead Approver (Head of Department)
                </label>
                <select
                  value={editHeadUserId}
                  onChange={(e) => setEditHeadUserId(e.target.value)}
                  className="w-full text-xs text-[#172B4D] bg-white border border-slate-200 rounded-lg px-3 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0070C0]/20 focus:border-[#0070C0]"
                >
                  <option value="">-- Pilih Approver / Head of Dept --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.position} ({u.role})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Pimpinan yang berhak memverifikasi dan menyetujui tiket untuk departemen ini.
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#172B4D] mb-1">
                Description / Guidance
              </label>
              <textarea
                rows={2}
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0070C0]/20 focus:border-[#0070C0] bg-white"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingItem(null)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
