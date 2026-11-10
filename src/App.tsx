import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginPage } from './components/auth/LoginPage';
import { Sidebar } from './components/layout/Sidebar';
import { TopNav } from './components/layout/TopNav';
import { BdKamDashboard } from './components/dashboard/BdKamDashboard';
import { HeadDeptDashboard } from './components/dashboard/HeadDeptDashboard';
import { CustomerList } from './components/customer/CustomerList';
import { Customer360 } from './components/customer/Customer360';
import { AddCustomerModal } from './components/customer/AddCustomerModal';
import { PipelineBoard } from './components/pipeline/PipelineBoard';
import { DailyActivityView } from './components/activity/DailyActivityView';
import { FollowUpView } from './components/followup/FollowUpView';
import { PicaListView } from './components/pica/PicaListView';
import { MonitoringView } from './components/monitoring/MonitoringView';
import { UserManagementView } from './components/admin/UserManagementView';
import { RolePermissionView } from './components/admin/RolePermissionView';
import { MasterDataView } from './components/admin/MasterDataView';
import { CustomerDataControlView } from './components/admin/CustomerDataControlView';
import { ToastContainer } from './components/ui/Toast';
import { AddOpportunityModal } from './components/pipeline/AddOpportunityModal';
import { OpportunityDetailModal } from './components/pipeline/OpportunityDetailModal';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    isAuthenticated,
    activeMenu,
    setActiveMenu,
    currentUser,
    canAccessMenu,
    openCustomer360,
    toasts,
    dismissToast,
    isAddOpportunityOpen,
    setIsAddOpportunityOpen,
    selectedOpportunityId,
  } = useApp();

  const [dashboardToggleView, setDashboardToggleView] = useState<'auto' | 'rep' | 'management'>('auto');

  // If user is not authenticated, show the corporate Login Page
  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  // Permission Checks
  const isSuperAdmin = currentUser.role === 'Super Admin';
  const isHeadOfDept = currentUser.role === 'Head of Department';

  // Render main screen content based on activeMenu & permissions
  const renderContent = () => {
    // Reusable permission validation
    if (!canAccessMenu(activeMenu)) {
      let required = 'Super Admin';
      if (activeMenu === 'monitoring') {
        required = 'Head of Department or Super Admin';
      }
      return <PermissionDenied requiredRole={required} />;
    }

    switch (activeMenu) {
      case 'dashboard': {
        // Super Admin and Head of Dept can view Control Tower or switch to Rep Workspace
        const showManagementView =
          dashboardToggleView === 'management' ||
          (dashboardToggleView === 'auto' && (isHeadOfDept || isSuperAdmin));

        return (
          <div className="space-y-4">
            {(isSuperAdmin || isHeadOfDept) && (
              <div className="flex items-center justify-end gap-2 text-xs">
                <span className="text-slate-400 font-medium">Dashboard View:</span>
                <div className="inline-flex p-1 bg-white border border-slate-200 rounded-lg shadow-xs">
                  <button
                    onClick={() => setDashboardToggleView('management')}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      showManagementView ? 'bg-[#0070C0] text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Control Tower (Management)
                  </button>
                  <button
                    onClick={() => setDashboardToggleView('rep')}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      !showManagementView ? 'bg-[#0070C0] text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    My Action Workspace (BD/KAM)
                  </button>
                </div>
              </div>
            )}
            {showManagementView ? <HeadDeptDashboard /> : <BdKamDashboard />}
          </div>
        );
      }

      case 'customer-list':
        return <CustomerList />;

      case 'add-customer':
        return (
          <>
            <CustomerList />
            <AddCustomerModal
              isOpen={true}
              onClose={() => setActiveMenu('customer-list')}
              onSuccess={(id) => openCustomer360(id)}
            />
          </>
        );

      case 'customer-360':
        return <Customer360 />;

      case 'pipeline':
        return <PipelineBoard />;

      case 'activity':
        return <DailyActivityView />;

      case 'followup':
        return <FollowUpView />;

      case 'pica':
        return <PicaListView />;

      case 'monitoring':
        return <MonitoringView />;

      case 'user-management':
        return <UserManagementView />;

      case 'role-permission':
        return <RolePermissionView />;

      case 'master-data':
        return <MasterDataView />;

      case 'customer-data-control':
        return <CustomerDataControlView />;

      default:
        return <BdKamDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F8FB] flex">
      {/* Collapsible / Responsive Enterprise Sidebar */}
      <Sidebar />

      {/* Main Viewport Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in-50 duration-200">
          {renderContent()}
        </main>
      </div>

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Global Opportunity Modals when not on Pipeline page (where PipelineBoard mounts them locally) */}
      {activeMenu !== 'pipeline' && selectedOpportunityId && <OpportunityDetailModal />}
      {activeMenu !== 'pipeline' && isAddOpportunityOpen && (
        <AddOpportunityModal
          isOpen={isAddOpportunityOpen}
          onClose={() => setIsAddOpportunityOpen(false)}
        />
      )}
    </div>
  );
};

// Access Denied Guard Banner
const PermissionDenied: React.FC<{ requiredRole: string }> = ({ requiredRole }) => {
  const { setActiveMenu, currentUser } = useApp();

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-xs space-y-4">
      <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
        <ShieldAlert className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-base font-bold text-[#172B4D]">Access Restricted</h3>
        <p className="text-xs text-slate-500 mt-1">
          This section requires <strong>{requiredRole}</strong> privileges. Your current role is <strong>{currentUser.role}</strong>.
        </p>
      </div>
      <div>
        <button
          onClick={() => setActiveMenu('dashboard')}
          className="px-4 py-2 bg-[#0070C0] text-white text-xs font-semibold rounded-lg hover:bg-[#005a9c] transition-colors inline-flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
