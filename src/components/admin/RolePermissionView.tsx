import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Check, X, KeyRound, ShieldAlert, Layers, Info } from 'lucide-react';

interface ModulePermission {
  module: string;
  description: string;
  capabilities: {
    name: string;
    action: 'View' | 'Create' | 'Edit' | 'Delete / Deactivate' | 'Verify' | 'Monitor';
    sa: boolean;
    hod: boolean;
    bd: boolean;
    kam: boolean;
  }[];
}

export const RolePermissionView: React.FC = () => {
  const { currentUser } = useApp();
  const isSuperAdmin = currentUser.role === 'Super Admin';

  const [selectedModule, setSelectedModule] = useState<string>('All');

  const modulePermissions: ModulePermission[] = [
    {
      module: 'Customer',
      description: 'Account profiles, multi-contacts, duplicate prevention, and Customer 360 overview.',
      capabilities: [
        { name: 'View All Customers', action: 'View', sa: true, hod: true, bd: false, kam: false },
        { name: 'View & Manage Owned Accounts', action: 'View', sa: true, hod: true, bd: true, kam: true },
        { name: 'Register New Customer Account', action: 'Create', sa: true, hod: false, bd: true, kam: true },
        { name: 'Edit Customer Information & Contacts', action: 'Edit', sa: true, hod: true, bd: true, kam: true },
        { name: 'Deactivate / Soft-Delete Account', action: 'Delete / Deactivate', sa: true, hod: false, bd: false, kam: false },
        { name: 'Merge Duplicate Customer Entities', action: 'Delete / Deactivate', sa: true, hod: false, bd: false, kam: false },
      ]
    },
    {
      module: 'Opportunity',
      description: 'Commercial deal pipeline, 4-stage Kanban, probability weighting, and win/loss tracking.',
      capabilities: [
        { name: 'View All Deals & Opportunities', action: 'View', sa: true, hod: true, bd: false, kam: false },
        { name: 'View & Advance Owned Deals', action: 'View', sa: true, hod: true, bd: true, kam: true },
        { name: 'Create Commercial Opportunity', action: 'Create', sa: true, hod: false, bd: true, kam: true },
        { name: 'Advance Stages (Qualification → Award)', action: 'Edit', sa: true, hod: false, bd: true, kam: true },
        { name: 'Mark Opportunity as Closed Lost', action: 'Edit', sa: true, hod: false, bd: true, kam: true },
      ]
    },
    {
      module: 'Activity',
      description: 'Daily operational customer visits, client meetings, calls, and presentations.',
      capabilities: [
        { name: 'View Cross-Team Activity Timelines', action: 'View', sa: true, hod: true, bd: false, kam: false },
        { name: 'Log Daily Activity (10 Types)', action: 'Create', sa: true, hod: false, bd: true, kam: true },
        { name: 'Edit Activity & Follow-up Commitment', action: 'Edit', sa: true, hod: false, bd: true, kam: true },
      ]
    },
    {
      module: 'Follow-up',
      description: 'Automated commitments, milestone alerts, and dynamic overdue tracking.',
      capabilities: [
        { name: 'View Cross-Team Follow-up Workflows', action: 'View', sa: true, hod: true, bd: false, kam: false },
        { name: 'View & Action Owned Follow-ups', action: 'View', sa: true, hod: true, bd: true, kam: true },
        { name: 'Complete & Resolve Action Item', action: 'Edit', sa: true, hod: false, bd: true, kam: true },
      ]
    },
    {
      module: 'PICA',
      description: 'Quality containment, root cause 5-Why analysis, and management verification.',
      capabilities: [
        { name: 'View All PICA Exceptions', action: 'View', sa: true, hod: true, bd: false, kam: false },
        { name: 'Create PICA Incident Case', action: 'Create', sa: true, hod: false, bd: true, kam: true },
        { name: 'Update Execution Progress & Evidence', action: 'Edit', sa: true, hod: false, bd: true, kam: true },
        { name: 'Submit for Quality Verification', action: 'Edit', sa: true, hod: false, bd: true, kam: true },
        { name: 'Managerial Verification (Approve/Return)', action: 'Verify', sa: true, hod: true, bd: false, kam: false },
        { name: 'Close & Archive PICA Case', action: 'Delete / Deactivate', sa: true, hod: true, bd: false, kam: false },
      ]
    },
    {
      module: 'Monitoring',
      description: 'Executive visibility into activities, pipeline velocity, and service issues.',
      capabilities: [
        { name: 'Access Activity Monitoring Console', action: 'Monitor', sa: true, hod: true, bd: false, kam: false },
        { name: 'Access Pipeline Monitoring Console', action: 'Monitor', sa: true, hod: true, bd: false, kam: false },
        { name: 'Access PICA Monitoring Console', action: 'Monitor', sa: true, hod: true, bd: false, kam: false },
        { name: 'Access Commercial Control Tower', action: 'Monitor', sa: true, hod: true, bd: false, kam: false },
      ]
    },
    {
      module: 'Administration',
      description: 'System-wide governance, user credentials, reference dictionaries, and data deduplication.',
      capabilities: [
        { name: 'User Management & Role Assignment', action: 'Edit', sa: true, hod: false, bd: false, kam: false },
        { name: 'Role & Permission Configuration', action: 'Edit', sa: true, hod: false, bd: false, kam: false },
        { name: 'Master Data Reference Control', action: 'Edit', sa: true, hod: false, bd: false, kam: false },
        { name: 'Customer Ownership & Reassignment', action: 'Edit', sa: true, hod: false, bd: false, kam: false },
      ]
    }
  ];

  if (!isSuperAdmin) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-xl mx-auto my-12 space-y-4 shadow-sm">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-100">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-[#172B4D]">Super Admin Access Required</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Role definitions, access control policies, and permission matrix administration are restricted to Super Administrators.
          </p>
        </div>
      </div>
    );
  }

  const filteredModules = modulePermissions.filter(m => selectedModule === 'All' || m.module === selectedModule);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-[#172B4D] tracking-tight">
              Role & Permission Architecture
            </h1>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Role-Based Access Control (RBAC)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Granular access policy defining View, Create, Edit, Delete/Deactivate, Verify, and Monitor capabilities across 4 user roles.
          </p>
        </div>
      </div>

      {/* 3-Tier Data Scoping Policy Summary */}
      <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50 border border-blue-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center gap-2 font-bold text-xs text-[#0070C0] uppercase tracking-wider mb-2">
          <Info className="w-4 h-4 text-[#0070C0]" />
          <span>Aturan Visibilitas & Approval Data Per Role:</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-white/90 p-3 rounded-lg border border-blue-100 space-y-1">
            <div className="font-bold text-[#172B4D] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>1. KAM & BD (Data Ownership)</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Hanya melihat dan mengelola data milik sendiri (customer accounts, deals pipeline, daily activity, follow-up, & PICA pribadi).
            </p>
          </div>

          <div className="bg-white/90 p-3 rounded-lg border border-purple-100 space-y-1">
            <div className="font-bold text-[#172B4D] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <span>2. Head Dept (Department Level)</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Melihat seluruh data anggota tim di departemennya & memproses <strong>Antrian Approval / Verifikasi</strong>. (Catatan: KAM & BD memiliki Head Dept yang sama).
            </p>
          </div>

          <div className="bg-white/90 p-3 rounded-lg border border-emerald-100 space-y-1">
            <div className="font-bold text-[#172B4D] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>3. Super Admin (Global Scope)</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Akses penuh ke seluruh data perusahaan lintas departemen, konfigurasi Master Data, penetapan Head per Department, dan User Management.
            </p>
          </div>
        </div>
      </div>

      {/* Module Filter Chips */}
      <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-xs overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setSelectedModule('All')}
          className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
            selectedModule === 'All'
              ? 'bg-[#0070C0] text-white font-bold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          All Modules ({modulePermissions.length})
        </button>
        {modulePermissions.map(m => (
          <button
            key={m.module}
            onClick={() => setSelectedModule(m.module)}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              selectedModule === m.module
                ? 'bg-[#0070C0] text-white font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {m.module}
          </button>
        ))}
      </div>

      {/* Permission Matrix Cards */}
      <div className="space-y-4">
        {filteredModules.map(mod => (
          <div key={mod.module} className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <span className="font-bold text-xs text-[#172B4D] uppercase tracking-wider">
                  Module: {mod.module}
                </span>
                <p className="text-[11px] text-slate-500">{mod.description}</p>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">
                {mod.capabilities.length} Capabilities
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/40 text-slate-500 font-semibold border-b border-slate-100">
                  <tr>
                    <th className="py-2.5 px-4 w-2/5">Capability Description</th>
                    <th className="py-2.5 px-3">Action Type</th>
                    <th className="py-2.5 px-3 text-center">Super Admin</th>
                    <th className="py-2.5 px-3 text-center">Head Dept</th>
                    <th className="py-2.5 px-3 text-center">Business Dev (BD)</th>
                    <th className="py-2.5 px-3 text-center">Key Account (KAM)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mod.capabilities.map((cap, i) => (
                    <tr key={i} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-medium text-[#172B4D]">
                        {cap.name}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${
                          cap.action === 'View' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                          cap.action === 'Create' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          cap.action === 'Edit' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          cap.action === 'Verify' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          cap.action === 'Monitor' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                          'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {cap.action}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {cap.sa ? (
                          <span className="inline-flex p-1 bg-emerald-50 text-emerald-600 rounded">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        ) : (
                          <span className="inline-flex p-1 text-slate-300">
                            <X className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {cap.hod ? (
                          <span className="inline-flex p-1 bg-emerald-50 text-emerald-600 rounded">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        ) : (
                          <span className="inline-flex p-1 text-slate-300">
                            <X className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {cap.bd ? (
                          <span className="inline-flex p-1 bg-emerald-50 text-emerald-600 rounded">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        ) : (
                          <span className="inline-flex p-1 text-slate-300">
                            <X className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {cap.kam ? (
                          <span className="inline-flex p-1 bg-emerald-50 text-emerald-600 rounded">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        ) : (
                          <span className="inline-flex p-1 text-slate-300">
                            <X className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
