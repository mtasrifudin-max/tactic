import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole, EntityId } from '../../types';
import { ENTITIES } from '../../data/mockData';
import {
  ShieldCheck,
  Plus,
  Search,
  UserCheck,
  UserX,
  Edit2,
  X,
  ShieldAlert,
  AlertTriangle,
  Lock,
  Mail,
  Building,
  Briefcase,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { StatusBadge } from '../layout/StatusBadge';
import { EntityBadge } from '../common/EntityBadge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { CreatableSelect } from '../ui/CreatableSelect';

export const UserManagementView: React.FC = () => {
  const {
    users,
    addUser,
    updateUser,
    toggleUserStatus,
    currentUser,
    customers,
    opportunities,
    activities,
    picas,
    masterData,
    entitiesMap,
    addMasterDataItem,
    showToast
  } = useApp();

  const isSuperAdmin = currentUser.role === 'Super Admin';

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Add User Modal State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Business Development');
  const [department, setDepartment] = useState('Commercial & Business Development');
  const [position, setPosition] = useState('Commercial Specialist');
  const [assignedEntities, setAssignedEntities] = useState<EntityId[]>(['PDT', 'PLI']);

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('Business Development');
  const [editDepartment, setEditDepartment] = useState('');
  const [editPosition, setEditPosition] = useState('');
  const [editAssignedEntities, setEditAssignedEntities] = useState<EntityId[]>([]);

  // Deactivation Safeguard Modal State
  const [deactivatingUser, setDeactivatingUser] = useState<User | null>(null);

  // Department options from Master Data + existing users
  const departmentOptions = useMemo(() => {
    const mdDepts: { value: string; label: string; code?: string }[] = masterData
      .filter(m => m.category === 'Department' && m.isActive)
      .map(m => ({ value: m.name, label: m.name, code: m.code }));

    const userDepts = Array.from(new Set(users.map(u => u.department).filter(Boolean)));
    const allDepts = [...mdDepts];
    userDepts.forEach(d => {
      if (!allDepts.some(item => item.value.toLowerCase() === d.toLowerCase())) {
        allDepts.push({ value: d, label: d });
      }
    });
    return allDepts;
  }, [masterData, users]);

  // Position Title options from Master Data + existing users
  const positionOptions = useMemo(() => {
    const mdPositions: { value: string; label: string; code?: string }[] = masterData
      .filter(m => m.category === 'Position Title' && m.isActive)
      .map(m => ({ value: m.name, label: m.name, code: m.code }));

    const userPositions = Array.from(new Set(users.map(u => u.position).filter(Boolean)));
    const allPositions = [...mdPositions];
    userPositions.forEach(p => {
      if (!allPositions.some(item => item.value.toLowerCase() === p.toLowerCase())) {
        allPositions.push({ value: p, label: p });
      }
    });
    return allPositions;
  }, [masterData, users]);

  // Inline Add Handlers that save directly to Master Data
  const handleCreateDepartment = (newDept: string) => {
    const trimmed = newDept.trim();
    if (!trimmed) return;
    const exists = masterData.some(
      m => m.category === 'Department' && m.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (!exists) {
      const code = 'DEPT-' + trimmed.slice(0, 4).toUpperCase();
      addMasterDataItem({
        category: 'Department',
        code,
        name: trimmed,
        isActive: true,
        createdDate: new Date().toISOString().split('T')[0],
      });
      showToast(`Departemen baru "${trimmed}" ditambahkan ke Master Data.`, 'success');
    }
  };

  const handleCreatePosition = (newPos: string) => {
    const trimmed = newPos.trim();
    if (!trimmed) return;
    const exists = masterData.some(
      m => m.category === 'Position Title' && m.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (!exists) {
      const code = 'POS-' + trimmed.slice(0, 4).toUpperCase();
      addMasterDataItem({
        category: 'Position Title',
        code,
        name: trimmed,
        isActive: true,
        createdDate: new Date().toISOString().split('T')[0],
      });
      showToast(`Jabatan baru "${trimmed}" ditambahkan ke Master Data.`, 'success');
    }
  };

  const filteredUsers = users.filter(u => {
    const q = search.toLowerCase().trim();
    const match =
      !search ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.position.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q);

    if (!match) return false;
    if (roleFilter !== 'All' && u.role !== roleFilter) return false;
    if (statusFilter !== 'All' && u.status !== statusFilter) return false;
    return true;
  });

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      showToast('Name and email are required.', 'warning');
      return;
    }

    // Email format validation
    if (!email.includes('@')) {
      showToast('Please enter a valid email address.', 'warning');
      return;
    }

    addUser({
      name: name.trim(),
      email: email.trim(),
      role,
      department: department.trim(),
      position: position.trim(),
      status: 'Active',
      assignedEntities: assignedEntities.length > 0 ? assignedEntities : ['PDT'],
    });

    showToast(`User ${name} registered successfully.`, 'success');
    setIsAddUserOpen(false);
    setName('');
    setEmail('');
    setAssignedEntities(['PDT', 'PLI']);
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditRole(u.role);
    setEditDepartment(u.department);
    setEditPosition(u.position);
    setEditAssignedEntities(u.assignedEntities && u.assignedEntities.length > 0 ? u.assignedEntities : ['PETRA', 'PDT', 'PLI']);
  };

  const handleEditUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!editName.trim() || !editEmail.trim()) {
      showToast('Name and email are required.', 'warning');
      return;
    }

    updateUser(editingUser.id, {
      name: editName.trim(),
      email: editEmail.trim(),
      role: editRole,
      department: editDepartment.trim(),
      position: editPosition.trim(),
      assignedEntities: editAssignedEntities.length > 0 ? editAssignedEntities : ['PDT'],
    });

    showToast(`User ${editName} updated successfully.`, 'success');
    setEditingUser(null);
  };

  const handleToggleStatus = (u: User) => {
    if (u.id === currentUser.id) {
      showToast('You cannot deactivate your own active session.', 'error');
      return;
    }

    if (u.status === 'Active') {
      // Check related records
      const ownedCustomers = customers.filter(c => c.ownerId === u.id);
      const ownedOpps = opportunities.filter(o => o.ownerId === u.id && o.stage !== 'Award' && o.stage !== 'Lost');
      const picPicas = picas.filter(p => p.picId === u.id && p.status !== 'Closed');

      if (ownedCustomers.length > 0 || ownedOpps.length > 0 || picPicas.length > 0) {
        setDeactivatingUser(u);
        return;
      }
    }

    toggleUserStatus(u.id);
    showToast(`User status updated to ${u.status === 'Active' ? 'Inactive' : 'Active'}.`, 'info');
  };

  const handleConfirmDeactivation = () => {
    if (!deactivatingUser) return;
    toggleUserStatus(deactivatingUser.id);
    showToast(`User ${deactivatingUser.name} deactivated. Related records are preserved safely.`, 'warning');
    setDeactivatingUser(null);
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
            User administration, authentication governance, and credential assignment are strictly restricted to Super Administrators.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-[#172B4D] tracking-tight">
              User Management
            </h1>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              {filteredUsers.length} Accounts
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage commercial team accounts, roles, departmental assignments, and authentication status.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsAddUserOpen(true)}
          className="bg-[#0070C0] hover:bg-[#005a9c] shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add User</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <span className="font-semibold text-slate-500">Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:border-[#0070C0] cursor-pointer"
          >
            <option value="All">All Roles</option>
            <option value="Super Admin">Super Admin</option>
            <option value="Head of Department">Head of Department</option>
            <option value="Business Development">Business Development</option>
            <option value="Key Account Management">Key Account Management</option>
          </select>

          <span className="font-semibold text-slate-500 ml-2">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1 text-xs border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:border-[#0070C0] cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          {(roleFilter !== 'All' || statusFilter !== 'All' || search) && (
            <button
              onClick={() => {
                setRoleFilter('All');
                setStatusFilter('All');
                setSearch('');
              }}
              className="text-xs text-rose-600 hover:underline font-medium ml-2 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, role, title..."
            className="w-full pl-9 pr-4 py-1.5 text-xs text-[#172B4D] bg-slate-50 focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#0070C0]"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Operating Entities</th>
                <th className="py-3 px-3">Department & Position</th>
                <th className="py-3 px-3">Created Date</th>
                <th className="py-3 px-3">Last Login</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No users found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-normal">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#172B4D] text-white flex items-center justify-center font-normal text-xs shrink-0">
                          {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-normal text-[#172B4D] flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {u.id === currentUser.id && (
                              <span className="text-[10px] bg-blue-50 text-[#0070C0] px-1.5 py-0.2 rounded font-normal border border-blue-100">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono font-normal">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="font-normal text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px] border border-slate-200 whitespace-nowrap">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-normal">
                      <div className="flex flex-wrap gap-1">
                        {(u.assignedEntities && u.assignedEntities.length > 0 ? u.assignedEntities : (['PETRA', 'PDT', 'PLI'] as EntityId[])).map(eid => (
                          <EntityBadge key={eid} entity={eid} size="xs" />
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-normal text-slate-800">{u.position}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{u.department}</div>
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 tabular-nums font-mono font-normal">
                      {u.createdDate}
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 tabular-nums font-mono font-normal">
                      {u.lastLogin || '-'}
                    </td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={u.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 text-slate-500 hover:text-[#0070C0] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit User"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={u.id === currentUser.id}
                          className={`px-2.5 py-1 text-xs font-normal rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                            u.status === 'Active'
                              ? 'text-rose-600 hover:bg-rose-50 border border-rose-200'
                              : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                          }`}
                        >
                          {u.status === 'Active' ? 'Deactivate' : 'Activate'}
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

      {/* Add User Modal */}
      {isAddUserOpen && (
        <Modal
          isOpen={isAddUserOpen}
          onClose={() => setIsAddUserOpen(false)}
          title="Create Commercial User Account"
          description="Register a new employee account with departmental role, permissions, and email access."
          maxWidth="md"
        >
          <form onSubmit={handleAddUserSubmit} className="space-y-3.5 text-xs">
            <Input
              label="Full Name *"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aris Setiawan"
            />

            <Input
              label="Email Address *"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@pancaran.co.id"
            />

            <Select
              label="Commercial Role *"
              required
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
            >
              <option value="Business Development">Business Development (New Business Hunting)</option>
              <option value="Key Account Management">Key Account Management (Existing Account Farming)</option>
              <option value="Head of Department">Head of Department (Control & Verification)</option>
              <option value="Super Admin">Super Admin (System Administration)</option>
            </Select>

            {/* Operating Entity Assignment */}
            <div>
              <label className="text-xs font-semibold text-[#172B4D] block mb-1.5">
                Operating Entity Assignment * (Can handle 1 or more entities)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(entitiesMap) as EntityId[]).map(eid => {
                  const ent = entitiesMap[eid];
                  const isChecked = assignedEntities.includes(eid);
                  return (
                    <label
                      key={eid}
                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-blue-50/70 border-[#0070C0] text-[#0070C0]'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            if (assignedEntities.length > 1) {
                              setAssignedEntities(assignedEntities.filter(x => x !== eid));
                            } else {
                              showToast('User must be assigned to at least 1 entity.', 'warning');
                            }
                          } else {
                            setAssignedEntities([...assignedEntities, eid]);
                          }
                        }}
                        className="rounded text-[#0070C0] focus:ring-[#0070C0] w-3.5 h-3.5 cursor-pointer"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-xs">{ent.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{ent.fullName}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <CreatableSelect
                label="Department"
                value={department}
                onChange={setDepartment}
                onCreateOption={handleCreateDepartment}
                options={departmentOptions}
                placeholder="Pilih departemen..."
              />
              <CreatableSelect
                label="Position Title"
                value={position}
                onChange={setPosition}
                onCreateOption={handleCreatePosition}
                options={positionOptions}
                placeholder="Pilih jabatan..."
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddUserOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Create User
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <Modal
          isOpen={true}
          onClose={() => setEditingUser(null)}
          title={`Edit User Account — ${editingUser.name}`}
          description="Update employee details, role designation, and departmental assignment."
          maxWidth="md"
        >
          <form onSubmit={handleEditUserSubmit} className="space-y-3.5 text-xs">
            <Input
              label="Full Name *"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />

            <Input
              label="Email Address *"
              type="email"
              required
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
            />

            <Select
              label="Commercial Role *"
              required
              value={editRole}
              onChange={(e) => setEditRole(e.target.value as UserRole)}
            >
              <option value="Business Development">Business Development</option>
              <option value="Key Account Management">Key Account Management</option>
              <option value="Head of Department">Head of Department</option>
              <option value="Super Admin">Super Admin</option>
            </Select>

            {/* Operating Entity Assignment */}
            <div>
              <label className="text-xs font-semibold text-[#172B4D] block mb-1.5">
                Operating Entity Assignment * (Can handle 1 or more entities)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(entitiesMap) as EntityId[]).map(eid => {
                  const ent = entitiesMap[eid];
                  const isChecked = editAssignedEntities.includes(eid);
                  return (
                    <label
                      key={eid}
                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-blue-50/70 border-[#0070C0] text-[#0070C0]'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          if (isChecked) {
                            if (editAssignedEntities.length > 1) {
                              setEditAssignedEntities(editAssignedEntities.filter(x => x !== eid));
                            } else {
                              showToast('User must be assigned to at least 1 entity.', 'warning');
                            }
                          } else {
                            setEditAssignedEntities([...editAssignedEntities, eid]);
                          }
                        }}
                        className="rounded text-[#0070C0] focus:ring-[#0070C0] w-3.5 h-3.5 cursor-pointer"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-xs">{ent.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{ent.fullName}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <CreatableSelect
                label="Department"
                value={editDepartment}
                onChange={setEditDepartment}
                onCreateOption={handleCreateDepartment}
                options={departmentOptions}
                placeholder="Pilih departemen..."
              />
              <CreatableSelect
                label="Position Title"
                value={editPosition}
                onChange={setEditPosition}
                onCreateOption={handleCreatePosition}
                options={positionOptions}
                placeholder="Pilih jabatan..."
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingUser(null)}
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

      {/* Deactivation Safeguard Modal */}
      {deactivatingUser && (
        <Modal
          isOpen={true}
          onClose={() => setDeactivatingUser(null)}
          title="Confirm User Account Deactivation"
          description={`Safeguard Notice for ${deactivatingUser.name}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Active Commercial Records Associated</span>
              </div>
              <p className="leading-relaxed">
                This user currently owns active customer accounts, opportunities, or PICA assignments. Deactivation will disable login access without deleting any associated audit logs or historical transactions.
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 text-slate-700">
              <div className="flex justify-between">
                <span>Owned Customers:</span>
                <strong className="text-[#172B4D]">{customers.filter(c => c.ownerId === deactivatingUser.id).length}</strong>
              </div>
              <div className="flex justify-between">
                <span>Active Opportunities:</span>
                <strong className="text-[#172B4D]">{opportunities.filter(o => o.ownerId === deactivatingUser.id && o.stage !== 'Award' && o.stage !== 'Lost').length}</strong>
              </div>
              <div className="flex justify-between">
                <span>Open PICA Cases:</span>
                <strong className="text-[#172B4D]">{picas.filter(p => p.picId === deactivatingUser.id && p.status !== 'Closed').length}</strong>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDeactivatingUser(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleConfirmDeactivation}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Confirm Deactivation
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
