import React, { useState } from 'react';
import { useApp, NavigationMenu } from '../../context/AppContext';
import { SidebarBranding } from './SidebarBranding';
import {
  LayoutDashboard,
  Building2,
  GitBranch,
  CalendarCheck,
  CheckSquare,
  AlertOctagon,
  BarChart3,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  PlusCircle,
  FileCheck2,
  Clock,
  History,
  KeyRound,
  Database,
  GitMerge,
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft,
  X
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const {
    currentUser,
    activeMenu,
    setActiveMenu,
    picaSubTab,
    setPicaSubTab,
    monitoringSubTab,
    setMonitoringSubTab,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    isSidebarCollapsed,
    toggleSidebarCollapsed,
    canAccessMenu,
    canVerifyPica
  } = useApp();

  // Collapsible groups in expanded mode
  const [customerOpen, setCustomerOpen] = useState(true);
  const [commercialOpen, setCommercialOpen] = useState(true);
  const [picaOpen, setPicaOpen] = useState(true);
  const [monitoringOpen, setMonitoringOpen] = useState(true);
  const [adminOpen, setAdminOpen] = useState(true);

  // Role permissions
  const canSeeMonitoring = canAccessMenu('monitoring');
  const canSeeAdmin = canAccessMenu('user-management');
  const allowPicaVerification = canVerifyPica();

  const navigateTo = (menu: NavigationMenu, callback?: () => void) => {
    setActiveMenu(menu);
    if (callback) callback();
    setIsMobileSidebarOpen(false);
  };

  const navItemClass = (isActive: boolean) => `
    flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all select-none cursor-pointer
    ${isSidebarCollapsed ? 'justify-center px-2 py-2.5' : ''}
    ${isActive 
      ? 'bg-[#0070C0] text-white shadow-xs font-semibold' 
      : 'text-slate-600 hover:text-[#172B4D] hover:bg-slate-100/80'
    }
  `;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white select-none">
      {/* Brand Header */}
      <div className={`h-16 border-b border-slate-200 flex items-center justify-between ${isSidebarCollapsed ? 'px-2 justify-center' : 'px-3 sm:px-4'}`}>
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          <SidebarBranding
            isCollapsed={isSidebarCollapsed}
            onClick={() => navigateTo('dashboard')}
          />
        </div>

        {/* Mobile close button */}
        {isMobileSidebarOpen && (
          <button
            onClick={() => setIsMobileSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 shrink-0 ml-1"
            title="Close sidebar"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Menus List */}
      <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-4">
        {/* 1. Dashboard */}
        <div>
          <button
            onClick={() => navigateTo('dashboard')}
            title="Dashboard"
            className={`w-full ${navItemClass(activeMenu === 'dashboard')}`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            {!isSidebarCollapsed && <span>Dashboard</span>}
          </button>
        </div>

        {/* 2. Customer / KYC Group */}
        <div>
          {!isSidebarCollapsed ? (
            <button
              onClick={() => setCustomerOpen(!customerOpen)}
              className="w-full flex items-center justify-between px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600"
            >
              <span>KYC</span>
              {customerOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <div className="h-px bg-slate-100 my-1 mx-2" />
          )}

          {(customerOpen || isSidebarCollapsed) && (
            <div className="mt-1 space-y-1">
              <button
                onClick={() => navigateTo('customer-list')}
                title="Customer"
                className={`w-full ${navItemClass(activeMenu === 'customer-list' || activeMenu === 'customer-360')}`}
              >
                <Building2 className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Customer</span>}
              </button>
              <button
                onClick={() => navigateTo('add-customer')}
                title="Add Customer"
                className={`w-full ${navItemClass(activeMenu === 'add-customer')}`}
              >
                <PlusCircle className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Add Customer</span>}
              </button>
            </div>
          )}
        </div>

        {/* 3. CRM Group */}
        <div>
          {!isSidebarCollapsed ? (
            <button
              onClick={() => setCommercialOpen(!commercialOpen)}
              className="w-full flex items-center justify-between px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600"
            >
              <span>CRM</span>
              {commercialOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <div className="h-px bg-slate-100 my-1 mx-2" />
          )}

          {(commercialOpen || isSidebarCollapsed) && (
            <div className="mt-1 space-y-1">
              <button
                onClick={() => navigateTo('pipeline')}
                title="Pipeline"
                className={`w-full ${navItemClass(activeMenu === 'pipeline')}`}
              >
                <GitBranch className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Pipeline</span>}
              </button>
              <button
                onClick={() => navigateTo('activity')}
                title="Daily Activity"
                className={`w-full ${navItemClass(activeMenu === 'activity')}`}
              >
                <CalendarCheck className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Daily Activity</span>}
              </button>
              <button
                onClick={() => navigateTo('followup')}
                title="Follow-up"
                className={`w-full ${navItemClass(activeMenu === 'followup')}`}
              >
                <CheckSquare className="w-4 h-4 shrink-0" />
                {!isSidebarCollapsed && <span>Follow-up</span>}
              </button>
            </div>
          )}
        </div>

        {/* 4. PICA Group */}
        <div>
          {!isSidebarCollapsed ? (
            <button
              onClick={() => setPicaOpen(!picaOpen)}
              className="w-full flex items-center justify-between px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600"
            >
              <span>PICA</span>
              {picaOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <div className="h-px bg-slate-100 my-1 mx-2" />
          )}

          {(picaOpen || isSidebarCollapsed) && (
            <div className="mt-1 space-y-1">
              <button
                onClick={() => navigateTo('pica', () => setPicaSubTab('create'))}
                title="Create PICA"
                className={`w-full ${navItemClass(activeMenu === 'pica' && picaSubTab === 'create')}`}
              >
                <PlusCircle className="w-4 h-4 shrink-0 text-[#0070C0]" />
                {!isSidebarCollapsed && <span>Create PICA</span>}
              </button>

              <button
                onClick={() => navigateTo('pica', () => setPicaSubTab('progress'))}
                title="Progress PICA"
                className={`w-full ${navItemClass(activeMenu === 'pica' && picaSubTab === 'progress')}`}
              >
                <Clock className="w-4 h-4 shrink-0 text-amber-500" />
                {!isSidebarCollapsed && <span>Progress PICA</span>}
              </button>

              {allowPicaVerification && (
                <button
                  onClick={() => navigateTo('pica', () => setPicaSubTab('verification'))}
                  title="Approval & Verification"
                  className={`w-full ${navItemClass(activeMenu === 'pica' && picaSubTab === 'verification')}`}
                >
                  <FileCheck2 className="w-4 h-4 shrink-0 text-purple-600" />
                  {!isSidebarCollapsed && <span>Approval & Verification</span>}
                </button>
              )}

              <button
                onClick={() => navigateTo('pica', () => setPicaSubTab('history'))}
                title="History"
                className={`w-full ${navItemClass(activeMenu === 'pica' && picaSubTab === 'history')}`}
              >
                <History className="w-4 h-4 shrink-0 text-slate-400" />
                {!isSidebarCollapsed && <span>History</span>}
              </button>
            </div>
          )}
        </div>

        {/* 5. Monitoring Group (Super Admin & Head Department) */}
        {canSeeMonitoring && (
          <div>
            {!isSidebarCollapsed ? (
              <button
                onClick={() => setMonitoringOpen(!monitoringOpen)}
                className="w-full flex items-center justify-between px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600"
              >
                <span>Monitoring</span>
                {monitoringOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <div className="h-px bg-slate-100 my-1 mx-2" />
            )}

            {(monitoringOpen || isSidebarCollapsed) && (
              <div className="mt-1 space-y-1">
                <button
                  onClick={() => navigateTo('monitoring', () => setMonitoringSubTab('activity'))}
                  title="Activity Monitoring"
                  className={`w-full ${navItemClass(activeMenu === 'monitoring' && monitoringSubTab === 'activity')}`}
                >
                  <CalendarCheck className="w-4 h-4 shrink-0" />
                  {!isSidebarCollapsed && <span>Activity Monitoring</span>}
                </button>
                <button
                  onClick={() => navigateTo('monitoring', () => setMonitoringSubTab('pipeline'))}
                  title="Pipeline Monitoring"
                  className={`w-full ${navItemClass(activeMenu === 'monitoring' && monitoringSubTab === 'pipeline')}`}
                >
                  <GitBranch className="w-4 h-4 shrink-0" />
                  {!isSidebarCollapsed && <span>Pipeline Monitoring</span>}
                </button>
                <button
                  onClick={() => navigateTo('monitoring', () => setMonitoringSubTab('pica'))}
                  title="PICA Monitoring"
                  className={`w-full ${navItemClass(activeMenu === 'monitoring' && monitoringSubTab === 'pica')}`}
                >
                  <AlertOctagon className="w-4 h-4 shrink-0" />
                  {!isSidebarCollapsed && <span>PICA Monitoring</span>}
                </button>
              </div>
            )}
          </div>
        )}

        {/* 6. Administration Group (Super Admin Only) */}
        {canSeeAdmin && (
          <div>
            {!isSidebarCollapsed ? (
              <button
                onClick={() => setAdminOpen(!adminOpen)}
                className="w-full flex items-center justify-between px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-600"
              >
                <span>Administration</span>
                {adminOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <div className="h-px bg-slate-100 my-1 mx-2" />
            )}

            {(adminOpen || isSidebarCollapsed) && (
              <div className="mt-1 space-y-1">
                <button
                  onClick={() => navigateTo('user-management')}
                  title="User Management"
                  className={`w-full ${navItemClass(activeMenu === 'user-management')}`}
                >
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  {!isSidebarCollapsed && <span>User Management</span>}
                </button>
                <button
                  onClick={() => navigateTo('role-permission')}
                  title="Role & Permission"
                  className={`w-full ${navItemClass(activeMenu === 'role-permission')}`}
                >
                  <KeyRound className="w-4 h-4 shrink-0" />
                  {!isSidebarCollapsed && <span>Role & Permission</span>}
                </button>
                <button
                  onClick={() => navigateTo('master-data')}
                  title="Master Data"
                  className={`w-full ${navItemClass(activeMenu === 'master-data')}`}
                >
                  <Database className="w-4 h-4 shrink-0" />
                  {!isSidebarCollapsed && <span>Master Data</span>}
                </button>
                <button
                  onClick={() => navigateTo('customer-data-control')}
                  title="Customer Data Control"
                  className={`w-full ${navItemClass(activeMenu === 'customer-data-control')}`}
                >
                  <GitMerge className="w-4 h-4 shrink-0" />
                  {!isSidebarCollapsed && <span>Customer Data Control</span>}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sidebar Footer with Collapse Toggle & Current Role */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/60">
        {!isSidebarCollapsed ? (
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[10px] text-slate-400 font-medium">Active Session</div>
              <div className="text-xs font-bold text-[#172B4D] truncate">{currentUser.name}</div>
              <div className="text-[10px] font-semibold text-[#0070C0] truncate">{currentUser.role}</div>
            </div>
            <button
              onClick={toggleSidebarCollapsed}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer hidden lg:block"
              title="Collapse sidebar"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#172B4D] text-white flex items-center justify-center text-[10px] font-bold">
              {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <button
              onClick={toggleSidebarCollapsed}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer hidden lg:block"
              title="Expand sidebar"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Collapsible width: 64px or 230px) */}
      <aside
        className={`hidden lg:block shrink-0 border-r border-slate-200 h-screen sticky top-0 z-40 bg-white transition-all duration-200 ${
          isSidebarCollapsed ? 'w-16' : 'w-[230px]'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
