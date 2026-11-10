import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import {
  User,
  UserRole,
  EntityId,
  EntityInfo,
  Customer,
  ContactPerson,
  Opportunity,
  OpportunityStage,
  LostReason,
  Activity,
  FollowUp,
  FollowUpStatus,
  Pica,
  PicaProgressEntry,
  NotificationItem,
  MasterDataItem,
  Contract,
  OperationalProfile,
  UnitCategoryMetric,
  AvailabilityValidationResult,
  validateOperationalAvailability,
  CustomerFinancialMonthly,
  FinancialCompositeKey,
  FinancialDuplicateCheckResult,
  checkDuplicateFinancialRecord
} from '../types';
import { ToastMessage } from '../components/ui/Toast';
import {
  ENTITIES,
  INITIAL_USERS,
  INITIAL_CUSTOMERS,
  INITIAL_CONTACTS,
  INITIAL_OPPORTUNITIES,
  INITIAL_ACTIVITIES,
  INITIAL_FOLLOW_UPS,
  INITIAL_PICAS,
  INITIAL_NOTIFICATIONS,
  INITIAL_MASTER_DATA,
  INITIAL_CONTRACTS,
  INITIAL_OPERATIONAL_PROFILES,
  INITIAL_CUSTOMER_FINANCIALS
} from '../data/mockData';

export type NavigationMenu = 
  | 'dashboard'
  | 'customer-list'
  | 'add-customer'
  | 'customer-360'
  | 'pipeline'
  | 'activity'
  | 'followup'
  | 'pica'
  | 'monitoring'
  | 'user-management'
  | 'role-permission'
  | 'master-data'
  | 'customer-data-control';

interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicateCustomer?: Customer;
  matchedField?: string;
  message?: string;
}

interface AppContextType {
  // Multi-Entity Scope (PETRA, PDT, PLI)
  selectedEntity: 'ALL' | EntityId;
  setSelectedEntity: (entity: 'ALL' | EntityId) => void;
  availableEntities: EntityInfo[];
  entitiesMap: Record<EntityId, EntityInfo>;

  // Authentication & Session
  isAuthenticated: boolean;
  login: (email: string, password?: string, remember?: boolean) => { success: boolean; user?: User; error?: string };
  logout: () => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];
  switchUser: (userId: string) => void;
  hasPermission: (requiredRoles: UserRole[]) => boolean;
  canAccessMenu: (menu: NavigationMenu, role?: UserRole) => boolean;
  canVerifyPica: (role?: UserRole) => boolean;
  financialEditRoles: UserRole[];
  setFinancialEditRoles: (roles: UserRole[]) => void;
  canViewFinancial: (customer?: Customer) => boolean;
  canEditFinancial: (customer?: Customer) => boolean;

  // Sidebar collapsed state
  isSidebarCollapsed: boolean;
  toggleSidebarCollapsed: () => void;

  // Toast notifications
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'warning' | 'error' | 'info', title?: string) => void;
  dismissToast: (id: string) => void;

  // Navigation
  activeMenu: NavigationMenu;
  setActiveMenu: (menu: NavigationMenu) => void;
  selectedCustomerId: string | null;
  setSelectedCustomerId: (id: string | null) => void;
  customer360Tab: 'overview' | 'contacts' | 'contracts' | 'operations' | 'financial' | 'activity' | 'pipeline' | 'pica' | 'documents';
  setCustomer360Tab: (tab: 'overview' | 'contacts' | 'contracts' | 'operations' | 'financial' | 'activity' | 'pipeline' | 'pica' | 'documents') => void;
  openCustomer360: (customerId: string, tab?: 'overview' | 'contacts' | 'contracts' | 'operations' | 'financial' | 'activity' | 'pipeline' | 'pica' | 'documents') => void;

  selectedContractId: string | null;
  setSelectedContractId: (id: string | null) => void;
  openContractDetail: (contractId: string) => void;

  selectedOpportunityId: string | null;
  setSelectedOpportunityId: (id: string | null) => void;
  openOpportunityDetail: (oppId: string) => void;

  selectedPicaId: string | null;
  setSelectedPicaId: (id: string | null) => void;
  picaSubTab: 'all' | 'create' | 'progress' | 'verification' | 'history';
  setPicaSubTab: (tab: 'all' | 'create' | 'progress' | 'verification' | 'history') => void;
  openPicaDetail: (picaId: string) => void;

  monitoringSubTab: 'activity' | 'pipeline' | 'pica';
  setMonitoringSubTab: (tab: 'activity' | 'pipeline' | 'pica') => void;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Mobile Drawer
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;

  // Notifications
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  isNotificationOpen: boolean;
  setIsNotificationOpen: (open: boolean) => void;

  // Entities Data & Operations
  customers: Customer[];
  checkDuplicateCustomer: (data: Partial<Customer>, excludeId?: string) => DuplicateCheckResult;
  addCustomer: (data: Omit<Customer, 'id' | 'code' | 'createdDate' | 'lastUpdated' | 'createdBy'>) => { success: boolean; customer?: Customer; error?: string };
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  mergeCustomers: (primaryId: string, duplicateId: string) => void;

  contacts: ContactPerson[];
  addContact: (data: Omit<ContactPerson, 'id' | 'createdDate'>) => void;
  updateContact: (id: string, data: Partial<ContactPerson>) => void;
  deleteContact: (id: string) => void;

  opportunities: Opportunity[];
  addOpportunity: (data: Omit<Opportunity, 'id' | 'code' | 'createdDate' | 'lastActivityDate' | 'status'>) => Opportunity;
  updateOpportunityStage: (id: string, stage: OpportunityStage, lostDetails?: { reason: LostReason; notes?: string }) => void;
  updateOpportunity: (id: string, data: Partial<Opportunity>) => void;
  completeOpportunityNextAction: (id: string, notes?: string) => void;

  activities: Activity[];
  addActivity: (data: Omit<Activity, 'id' | 'code' | 'createdDate' | 'createdBy'>) => Activity;

  followUps: FollowUp[];
  addFollowUp: (data: Omit<FollowUp, 'id' | 'createdDate'>) => void;
  completeFollowUp: (id: string, notes?: string) => void;

  picas: Pica[];
  addPica: (data: Omit<Pica, 'id' | 'picaNumber' | 'createdDate' | 'progressHistory' | 'status'>) => Pica;
  updatePica: (id: string, data: Partial<Pica>) => void;
  startPicaProgress: (picaId: string) => void;
  addPicaProgress: (picaId: string, progressPercent: number, notes: string, attachment?: string) => void;
  submitPicaForVerification: (picaId: string) => void;
  verifyPica: (picaId: string, approved: boolean, notes: string) => void;
  closePica: (picaId: string) => void;

  contracts: Contract[];
  addContract: (data: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>) => Contract;
  updateContract: (id: string, data: Partial<Contract>) => void;
  deleteContract: (id: string) => void;

  operationalProfiles: OperationalProfile[];
  addOperationalProfile: (data: Omit<OperationalProfile, 'id' | 'createdAt' | 'updatedAt'>) => OperationalProfile;
  updateOperationalProfile: (id: string, data: Partial<OperationalProfile>) => void;
  deleteOperationalProfile: (id: string) => void;
  validateAvailabilityBreakdown: (pa?: number, dt?: number, additional?: UnitCategoryMetric[]) => AvailabilityValidationResult;

  // Customer Financial Monthly (Commercial Monitoring)
  financialRecords: CustomerFinancialMonthly[];
  addFinancialRecord: (data: Omit<CustomerFinancialMonthly, 'id' | 'createdAt' | 'updatedAt'>) => { success: boolean; record?: CustomerFinancialMonthly; error?: string };
  updateFinancialRecord: (id: string, data: Partial<CustomerFinancialMonthly>) => { success: boolean; error?: string };
  deleteFinancialRecord: (id: string) => void;
  checkDuplicateFinancialRecord: (candidate: FinancialCompositeKey, excludeId?: string) => FinancialDuplicateCheckResult;

  masterData: MasterDataItem[];
  addMasterDataItem: (data: Omit<MasterDataItem, 'id'>) => void;
  updateMasterDataItem: (id: string, data: Partial<MasterDataItem>) => void;
  toggleMasterDataStatus: (id: string) => void;

  addUser: (data: Omit<User, 'id' | 'createdDate' | 'lastLogin'>) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  toggleUserStatus: (id: string) => void;

  // Quick Action Modal states
  isAddActivityOpen: boolean;
  setIsAddActivityOpen: (open: boolean) => void;
  activityPreselectedCustomerId: string | null;
  setActivityPreselectedCustomerId: (id: string | null) => void;
  activityPreselectedOpportunityId: string | null;
  setActivityPreselectedOpportunityId: (id: string | null) => void;

  isAddOpportunityOpen: boolean;
  setIsAddOpportunityOpen: (open: boolean) => void;
  opportunityPreselectedCustomerId: string | null;
  setOpportunityPreselectedCustomerId: (id: string | null) => void;

  isAddPicaOpen: boolean;
  setIsAddPicaOpen: (open: boolean) => void;
  picaPreselectedCustomerId: string | null;
  setPicaPreselectedCustomerId: (id: string | null) => void;

  // 3-Tier Data Scoping Hierarchy (Ownership for BD/KAM, Department for HOD, All for Super Admin)
  scopedCustomers: Customer[];
  scopedOpportunities: Opportunity[];
  scopedActivities: Activity[];
  scopedFollowUps: FollowUp[];
  scopedPicas: Pica[];
  managedDepartments: string[];
  clearAllTransactionData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Synchronously purge persisted transaction data so user gets a 100% clean-slate empty state
if (typeof window !== 'undefined') {
  const PURGE_KEY = 'cms_clean_slate_active_v11';
  if (localStorage.getItem(PURGE_KEY) !== 'true') {
    const keysToPurge = [
      'cms_customers',
      'cms_contacts',
      'cms_opportunities',
      'cms_activities',
      'cms_follow_ups',
      'cms_picas',
      'cms_contracts',
      'cms_operational_profiles',
      'cms_customer_financial_monthly',
      'cms_notifications',
      'cms_users'
    ];
    keysToPurge.forEach(k => {
      try {
        localStorage.removeItem(k);
      } catch {
        // ignore
      }
    });
    try {
      localStorage.setItem(PURGE_KEY, 'true');
    } catch {
      // ignore
    }
  }
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Persistence helper
  const loadStored = <T,>(key: string, fallback: T): T => {
    try {
      const item = localStorage.getItem(`cms_${key}`);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  };

  const [users, setUsers] = useState<User[]>(() => loadStored('users', INITIAL_USERS));
  const [currentUserId, setCurrentUserId] = useState<string>(() => loadStored('current_user_id', 'usr-3')); // Budi Santoso (BD) by default
  const currentUser = useMemo(() => users.find(u => u.id === currentUserId) || users[0], [users, currentUserId]);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => loadStored('is_authenticated', true));
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => loadStored('sidebar_collapsed', false));
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [activeMenu, setActiveMenu] = useState<NavigationMenu>('dashboard');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [customer360Tab, setCustomer360Tab] = useState<'overview' | 'contacts' | 'contracts' | 'operations' | 'financial' | 'activity' | 'pipeline' | 'pica' | 'documents'>('overview');
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const [selectedPicaId, setSelectedPicaId] = useState<string | null>(null);
  const [picaSubTab, setPicaSubTab] = useState<'all' | 'create' | 'progress' | 'verification' | 'history'>('all');
  const [monitoringSubTab, setMonitoringSubTab] = useState<'activity' | 'pipeline' | 'pica'>('activity');

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);

  const [masterData, setMasterData] = useState<MasterDataItem[]>(() => loadStored('master_data', INITIAL_MASTER_DATA));

  // Multi-Entity state (PETRA, PDT, PLI)
  const [selectedEntity, setSelectedEntity] = useState<'ALL' | EntityId>(() => {
    return loadStored<'ALL' | EntityId>('selected_entity', 'ALL');
  });

  const entitiesMap: Record<EntityId, EntityInfo> = useMemo(() => {
    const entityItems = masterData.filter(m => m.category === 'Entity' && m.isActive);
    const map: Record<string, EntityInfo> = {};
    const colors = [
      'bg-amber-100 text-amber-800 border-amber-300',
      'bg-blue-100 text-blue-800 border-blue-300',
      'bg-emerald-100 text-emerald-800 border-emerald-300',
      'bg-purple-100 text-purple-800 border-purple-300',
      'bg-rose-100 text-rose-800 border-rose-300',
      'bg-cyan-100 text-cyan-800 border-cyan-300'
    ];
    entityItems.forEach((item, idx) => {
      const color = colors[idx % colors.length];
      const parts = color.split(' ');
      map[item.code as EntityId] = {
        id: item.code as EntityId,
        code: item.code as EntityId,
        name: item.code,
        fullName: item.name,
        color,
        badgeBg: parts[0] || 'bg-slate-100',
        badgeText: parts[1] || 'text-slate-800',
        badgeBorder: parts[2] || 'border-slate-300',
        description: item.description || ''
      };
    });
    return Object.keys(map).length > 0 ? (map as Record<EntityId, EntityInfo>) : ENTITIES;
  }, [masterData]);

  const availableEntities: EntityInfo[] = useMemo(() => {
    const codes = Object.keys(entitiesMap) as EntityId[];
    return codes.map(code => entitiesMap[code]).filter(Boolean);
  }, [entitiesMap]);

  // If active selectedEntity is not in master entities, reset to 'ALL'
  useEffect(() => {
    if (selectedEntity !== 'ALL') {
      const activeCodes = masterData.filter(m => m.category === 'Entity' && m.isActive).map(m => m.code);
      if (activeCodes.length > 0 && !activeCodes.includes(selectedEntity)) {
        setSelectedEntity('ALL');
      }
    }
  }, [masterData, selectedEntity]);

  useEffect(() => {
    localStorage.setItem('cms_selected_entity', JSON.stringify(selectedEntity));
  }, [selectedEntity]);

  // Transaction Data Collections (Initialized to empty arrays for clean testing)
  const [customers, setCustomers] = useState<Customer[]>(() => loadStored('customers', INITIAL_CUSTOMERS));
  const [contacts, setContacts] = useState<ContactPerson[]>(() => loadStored('contacts', INITIAL_CONTACTS));
  const [opportunities, setOpportunities] = useState<Opportunity[]>(() => loadStored('opportunities', INITIAL_OPPORTUNITIES));
  const [activities, setActivities] = useState<Activity[]>(() => loadStored('activities', INITIAL_ACTIVITIES));
  const [followUps, setFollowUps] = useState<FollowUp[]>(() => loadStored('follow_ups', INITIAL_FOLLOW_UPS));
  const [picas, setPicas] = useState<Pica[]>(() => loadStored('picas', INITIAL_PICAS));
  const [contracts, setContracts] = useState<Contract[]>(() => loadStored('contracts', INITIAL_CONTRACTS));
  const [operationalProfiles, setOperationalProfiles] = useState<OperationalProfile[]>(() => loadStored('operational_profiles', INITIAL_OPERATIONAL_PROFILES));
  const [financialRecords, setFinancialRecords] = useState<CustomerFinancialMonthly[]>(() => loadStored('customer_financial_monthly', INITIAL_CUSTOMER_FINANCIALS));
  const [financialEditRoles, setFinancialEditRoles] = useState<UserRole[]>(() => loadStored('financial_edit_roles', ['Super Admin']));
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => loadStored('notifications', INITIAL_NOTIFICATIONS));

  useEffect(() => {
    localStorage.setItem('cms_contracts', JSON.stringify(contracts));
  }, [contracts]);

  useEffect(() => {
    localStorage.setItem('cms_operational_profiles', JSON.stringify(operationalProfiles));
  }, [operationalProfiles]);

  useEffect(() => {
    localStorage.setItem('cms_customer_financial_monthly', JSON.stringify(financialRecords));
  }, [financialRecords]);

  useEffect(() => {
    localStorage.setItem('cms_financial_edit_roles', JSON.stringify(financialEditRoles));
  }, [financialEditRoles]);

  // Contract status auto-evaluation & Contract Alert Rules (90 days, 60 days, 30 days, Expired)
  useEffect(() => {
    const today = '2026-10-05';
    // 1. Evaluate contract statuses
    setContracts(prev => {
      let hasChanges = false;
      const updated = prev.map(c => {
        if (c.contractStatus === 'Draft' || c.contractStatus === 'Terminated') return c;
        let newStatus: Contract['contractStatus'] = 'Active';
        if (c.expiryDate < today) {
          newStatus = 'Expired';
        } else {
          const expDate = new Date(c.expiryDate);
          const currDate = new Date(today);
          const diffTime = expDate.getTime() - currDate.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays >= 0 && diffDays <= 90) {
            newStatus = 'Expiring Soon';
          }
        }
        if (c.contractStatus !== newStatus) {
          hasChanges = true;
          return { ...c, contractStatus: newStatus };
        }
        return c;
      });
      return hasChanges ? updated : prev;
    });

    // 2. Generate/Sync Contract Alert Notifications in Notification Center
    setNotifications(prev => {
      const nonContractNotifs = prev.filter(n => n.relatedEntity !== 'contract');
      const contractAlerts: NotificationItem[] = [];

      contracts.forEach(c => {
        if (c.contractStatus === 'Draft' || c.contractStatus === 'Terminated') return;
        const cust = customers.find(custItem => custItem.id === c.customerId);
        const expDate = new Date(c.expiryDate);
        const currDate = new Date(today);
        const diffTime = expDate.getTime() - currDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const existingNotif = prev.find(n => n.relatedEntity === 'contract' && n.relatedId === c.id);
        const isRead = existingNotif ? existingNotif.isRead : false;

        if (c.expiryDate < today || diffDays < 0) {
          contractAlerts.push({
            id: existingNotif ? existingNotif.id : `notif-cont-exp-${c.id}`,
            type: 'contract_expired',
            title: 'Contract Expired',
            message: `${c.contractTitle} has expired on ${c.expiryDate}. Please review and initiate contract renewal.`,
            customerName: cust?.name || 'Customer',
            contractTitle: c.contractTitle,
            expiryDate: c.expiryDate,
            daysRemaining: 0,
            relatedId: c.id,
            relatedEntity: 'contract',
            date: '2026-10-05 08:00',
            isRead,
            isUrgent: true,
          });
        } else if (diffDays <= 90) {
          const isUrgent = diffDays <= 30;
          let stageLabel = '90 Days';
          if (diffDays <= 30) stageLabel = '30 Days';
          else if (diffDays <= 60) stageLabel = '60 Days';

          contractAlerts.push({
            id: existingNotif ? existingNotif.id : `notif-cont-soon-${c.id}`,
            type: 'contract_expiring_soon',
            title: `Contract Expiring Soon (${stageLabel})`,
            message: `${c.contractTitle} expires in ${diffDays} days (${c.expiryDate}). Action required.`,
            customerName: cust?.name || 'Customer',
            contractTitle: c.contractTitle,
            expiryDate: c.expiryDate,
            daysRemaining: diffDays,
            relatedId: c.id,
            relatedEntity: 'contract',
            date: '2026-10-05 08:00',
            isRead,
            isUrgent,
          });
        }
      });

      return [...contractAlerts, ...nonContractNotifs];
    });
  }, [contracts, customers]);

  // Global modals state
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [activityPreselectedCustomerId, setActivityPreselectedCustomerId] = useState<string | null>(null);
  const [activityPreselectedOpportunityId, setActivityPreselectedOpportunityId] = useState<string | null>(null);

  const [isAddOpportunityOpen, setIsAddOpportunityOpen] = useState(false);
  const [opportunityPreselectedCustomerId, setOpportunityPreselectedCustomerId] = useState<string | null>(null);

  const [isAddPicaOpen, setIsAddPicaOpen] = useState(false);
  const [picaPreselectedCustomerId, setPicaPreselectedCustomerId] = useState<string | null>(null);

  // Save auth state
  useEffect(() => {
    localStorage.setItem('cms_is_authenticated', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('cms_sidebar_collapsed', JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem('cms_current_user_id', JSON.stringify(currentUserId));
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem('cms_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('cms_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('cms_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('cms_opportunities', JSON.stringify(opportunities));
  }, [opportunities]);

  useEffect(() => {
    localStorage.setItem('cms_activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('cms_follow_ups', JSON.stringify(followUps));
  }, [followUps]);

  useEffect(() => {
    localStorage.setItem('cms_picas', JSON.stringify(picas));
  }, [picas]);

  useEffect(() => {
    localStorage.setItem('cms_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('cms_master_data', JSON.stringify(masterData));
  }, [masterData]);

  // Toast Helpers
  const showToast = (message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info', title?: string) => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      title,
      message
    };
    setToasts(prev => [...prev, newToast]);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Auth operations
  const login = (email: string, password?: string, remember?: boolean) => {
    const cleanEmail = email.trim().toLowerCase();
    const matchedUser = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!matchedUser) {
      return { success: false, error: 'User account not found with this email address.' };
    }

    if (matchedUser.status === 'Inactive') {
      return { success: false, error: 'Your account is deactivated. Contact Super Admin.' };
    }

    setCurrentUserId(matchedUser.id);
    setIsAuthenticated(true);
    setActiveMenu('dashboard');
    showToast(`Welcome back, ${matchedUser.name}!`, 'success', 'Login Successful');
    return { success: true, user: matchedUser };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setActiveMenu('dashboard');
    showToast('You have been logged out.', 'info', 'Session Ended');
  };

  const toggleSidebarCollapsed = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
    const u = users.find(x => x.id === userId);
    if (u) {
      showToast(`Switched active session to ${u.name} (${u.role})`, 'info', 'Role Switched');
    }
  };

  const hasPermission = (requiredRoles: UserRole[]): boolean => {
    return requiredRoles.includes(currentUser.role);
  };

  // Permission rules per spec
  const canAccessMenu = (menu: NavigationMenu, role: UserRole = currentUser.role): boolean => {
    if (role === 'Super Admin') return true;

    const isAdminMenu = menu === 'user-management' || menu === 'role-permission' || menu === 'master-data' || menu === 'customer-data-control';
    if (isAdminMenu) return false;

    if (role === 'Head of Department') {
      // Head Dept sees Dashboard, Customer, Commercial, PICA, Monitoring
      return true;
    }

    if (role === 'Business Development' || role === 'Key Account Management') {
      // BD & KAM see Dashboard, Customer, Commercial, PICA. Do not show Monitoring or Administration.
      if (menu === 'monitoring') return false;
      return true;
    }

    return false;
  };

  const canVerifyPica = (role: UserRole = currentUser.role): boolean => {
    return role === 'Head of Department' || role === 'Super Admin';
  };

  const canViewFinancial = (targetCustomer?: Customer): boolean => {
    if (currentUser.role === 'Super Admin') return true;
    if (currentUser.role === 'Head of Department') return true;
    if (currentUser.role === 'Business Development' || currentUser.role === 'Key Account Management') {
      if (!targetCustomer) return true;
      return targetCustomer.ownerId === currentUser.id || targetCustomer.createdBy === currentUser.name;
    }
    return false;
  };

  const canEditFinancial = (targetCustomer?: Customer): boolean => {
    if (!canViewFinancial(targetCustomer)) return false;
    if (currentUser.role === 'Super Admin') return true;
    return financialEditRoles.includes(currentUser.role);
  };

  // Check overdue follow-ups dynamically on load
  useEffect(() => {
    const todayStr = '2026-10-05';
    setFollowUps(prev => prev.map(f => {
      if (f.status === 'Open' && f.dueDate < todayStr) {
        return { ...f, status: 'Overdue' };
      }
      return f;
    }));
  }, []);

  const openCustomer360 = (customerId: string, tab: 'overview' | 'contacts' | 'contracts' | 'operations' | 'financial' | 'activity' | 'pipeline' | 'pica' | 'documents' = 'overview') => {
    setSelectedCustomerId(customerId);
    setCustomer360Tab(tab);
    if (tab !== 'contracts') {
      setSelectedContractId(null);
    }
    setActiveMenu('customer-360');
  };

  const openContractDetail = (contractId: string) => {
    const target = contracts.find(c => c.id === contractId);
    if (target) {
      setSelectedCustomerId(target.customerId);
      setSelectedContractId(contractId);
      setCustomer360Tab('contracts');
      setActiveMenu('customer-360');
    }
  };

  const openOpportunityDetail = (oppId: string) => {
    setSelectedOpportunityId(oppId);
  };

  const openPicaDetail = (picaId: string) => {
    setSelectedPicaId(picaId);
  };

  // Duplicate Check logic: Customer Name, Legal Entity Name, NPWP, NIB, Website domain, Phone number
  const checkDuplicateCustomer = (data: Partial<Customer>, excludeId?: string): DuplicateCheckResult => {
    const normalize = (s?: string) => (s ? s.toLowerCase().replace(/[^a-z0-9]/g, '') : '');
    const cleanWeb = (url?: string) => {
      if (!url) return '';
      return url.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0].trim();
    };

    const targetName = normalize(data.name);
    const targetLegal = normalize(data.legalEntityName);
    const targetNpwp = normalize(data.npwp);
    const targetNib = normalize(data.nib);
    const targetPhone = normalize(data.phone);
    const targetWeb = cleanWeb(data.website);

    for (const c of customers) {
      if (excludeId && c.id === excludeId) continue;

      if (targetNpwp && normalize(c.npwp) === targetNpwp) {
        return { isDuplicate: true, duplicateCustomer: c, matchedField: 'NPWP', message: `Customer with identical NPWP (${c.npwp}) already exists: ${c.name}` };
      }
      if (targetNib && normalize(c.nib) === targetNib) {
        return { isDuplicate: true, duplicateCustomer: c, matchedField: 'NIB', message: `Customer with identical NIB (${c.nib}) already exists: ${c.name}` };
      }
      if (targetName && normalize(c.name) === targetName) {
        return { isDuplicate: true, duplicateCustomer: c, matchedField: 'Customer Name', message: `Customer with exact name "${c.name}" already exists` };
      }
      if (targetLegal && normalize(c.legalEntityName) === targetLegal) {
        return { isDuplicate: true, duplicateCustomer: c, matchedField: 'Legal Entity Name', message: `Customer with legal name "${c.legalEntityName}" already exists` };
      }
      if (targetWeb && cleanWeb(c.website) && cleanWeb(c.website) === targetWeb) {
        return { isDuplicate: true, duplicateCustomer: c, matchedField: 'Website Domain', message: `Customer with website domain "${targetWeb}" already exists: ${c.name}` };
      }
      if (targetPhone && targetPhone.length > 7 && normalize(c.phone) === targetPhone) {
        return { isDuplicate: true, duplicateCustomer: c, matchedField: 'Phone Number', message: `Customer with matching phone number already exists: ${c.name}` };
      }
    }

    return { isDuplicate: false };
  };

  const addCustomer = (data: Omit<Customer, 'id' | 'code' | 'createdDate' | 'lastUpdated' | 'createdBy'>) => {
    const dupCheck = checkDuplicateCustomer(data);
    if (dupCheck.isDuplicate) {
      return { success: false, error: dupCheck.message || 'Potential duplicate customer found. Please review existing customer before creating a new record.' };
    }

    const nextId = `cust-${customers.length + 1}`;
    const nextCode = `CUST-${String(customers.length + 1).padStart(3, '0')}`;
    const newCust: Customer = {
      ...data,
      id: nextId,
      code: nextCode,
      createdBy: currentUser.name,
      createdDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    setCustomers(prev => [newCust, ...prev]);
    return { success: true, customer: newCust };
  };

  const updateCustomer = (id: string, data: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          ...data,
          lastUpdated: new Date().toISOString().split('T')[0],
        };
      }
      return c;
    }));
  };

  const mergeCustomers = (primaryId: string, duplicateId: string) => {
    const primary = customers.find(c => c.id === primaryId);
    const duplicate = customers.find(c => c.id === duplicateId);
    if (!primary || !duplicate) return;

    // Migrate contacts, opps, activities, picas, contracts, operational profiles to primary
    setContacts(prev => prev.map(cnt => cnt.customerId === duplicateId ? { ...cnt, customerId: primaryId, customerName: primary.name } : cnt));
    setOpportunities(prev => prev.map(o => o.customerId === duplicateId ? { ...o, customerId: primaryId, customerName: primary.name } : o));
    setActivities(prev => prev.map(a => a.customerId === duplicateId ? { ...a, customerId: primaryId, customerName: primary.name } : a));
    setFollowUps(prev => prev.map(f => f.customerId === duplicateId ? { ...f, customerId: primaryId, customerName: primary.name } : f));
    setPicas(prev => prev.map(p => p.customerId === duplicateId ? { ...p, customerId: primaryId, customerName: primary.name } : p));
    setContracts(prev => prev.map(con => con.customerId === duplicateId ? { ...con, customerId: primaryId } : con));
    setOperationalProfiles(prev => prev.map(op => op.customerId === duplicateId ? { ...op, customerId: primaryId } : op));
    setFinancialRecords(prev => prev.map(fin => fin.customerId === duplicateId ? { ...fin, customerId: primaryId } : fin));

    // Remove duplicate customer
    setCustomers(prev => prev.filter(c => c.id !== duplicateId));
  };

  // Contacts
  const addContact = (data: Omit<ContactPerson, 'id' | 'createdDate'>) => {
    const newContact: ContactPerson = {
      ...data,
      id: `cnt-${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
    };
    setContacts(prev => [...prev, newContact]);
  };

  const updateContact = (id: string, data: Partial<ContactPerson>) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const deleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  // Pipeline / Opportunity
  const addOpportunity = (data: Omit<Opportunity, 'id' | 'code' | 'createdDate' | 'lastActivityDate' | 'status'>): Opportunity => {
    const today = new Date().toISOString().split('T')[0];
    const nextCode = `OPP-${String(opportunities.length + 1).padStart(3, '0')}`;
    const newOpp: Opportunity = {
      ...data,
      id: `opp-${Date.now()}`,
      code: nextCode,
      createdBy: currentUser.name,
      createdDate: today,
      updatedDate: today,
      lastActivityDate: today,
      status: data.stage === 'Award' ? 'Won' : data.stage === 'Lost' ? 'Lost' : 'Open',
    };

    setOpportunities(prev => [newOpp, ...prev]);

    // Update customer lastUpdated
    updateCustomer(data.customerId, { lastUpdated: today });

    return newOpp;
  };

  const updateOpportunityStage = (
    id: string,
    stage: OpportunityStage,
    lostDetails?: { reason: LostReason; notes?: string }
  ) => {
    const today = new Date().toISOString().split('T')[0];
    setOpportunities(prev => prev.map(opp => {
      if (opp.id === id) {
        let prob = opp.probability;
        if (stage === 'Qualification') prob = 25;
        if (stage === 'Proposal') prob = 50;
        if (stage === 'Negotiation') prob = 75;
        if (stage === 'Award') prob = 100;
        if (stage === 'Lost') prob = 0;

        return {
          ...opp,
          stage,
          probability: prob,
          status: stage === 'Award' ? 'Won' : stage === 'Lost' ? 'Lost' : 'Open',
          lostReason: stage === 'Lost' ? (lostDetails?.reason || opp.lostReason || 'Other') : undefined,
          lostNotes: stage === 'Lost' ? (lostDetails?.notes || opp.lostNotes) : undefined,
          updatedDate: today,
          lastActivityDate: today,
        };
      }
      return opp;
    }));
  };

  const updateOpportunity = (id: string, data: Partial<Opportunity>) => {
    const today = new Date().toISOString().split('T')[0];
    setOpportunities(prev => prev.map(o => {
      if (o.id === id) {
        const nextStage = data.stage || o.stage;
        let nextStatus = o.status;
        if (nextStage === 'Award') nextStatus = 'Won';
        else if (nextStage === 'Lost') nextStatus = 'Lost';
        else if (data.stage && data.stage !== o.stage) nextStatus = 'Open';

        return {
          ...o,
          ...data,
          status: nextStatus,
          updatedDate: today,
        };
      }
      return o;
    }));
  };

  const completeOpportunityNextAction = (id: string, notes?: string) => {
    setOpportunities(prev => prev.map(o => {
      if (o.id === id) {
        return {
          ...o,
          nextAction: notes ? `Action completed: ${notes}` : 'Completed',
          nextFollowUpDate: undefined,
          lastActivityDate: new Date().toISOString().split('T')[0],
        };
      }
      return o;
    }));
  };

  // Activity
  const addActivity = (data: Omit<Activity, 'id' | 'code' | 'createdDate' | 'createdBy'>): Activity => {
    const today = new Date().toISOString().split('T')[0];
    const nextCode = `ACT-2026-${String(activities.length + 1).padStart(3, '0')}`;
    const newActivity: Activity = {
      ...data,
      id: `act-${Date.now()}`,
      code: nextCode,
      createdBy: currentUser.name,
      createdDate: today,
    };

    setActivities(prev => [newActivity, ...prev]);

    // Update customer last activity & update date
    updateCustomer(data.customerId, { lastUpdated: data.date || today });

    // Update opportunity last activity date if linked
    if (data.opportunityId) {
      setOpportunities(prev => prev.map(o => o.id === data.opportunityId ? {
        ...o,
        lastActivityDate: data.date || today,
        nextAction: data.nextAction || o.nextAction,
        nextFollowUpDate: data.nextFollowUpDate || o.nextFollowUpDate,
      } : o));
    }

    // Automatically create Follow-up if nextAction and nextFollowUpDate provided
    if (data.nextAction && data.nextFollowUpDate) {
      const todayStr = '2026-10-05';
      const isOverdue = data.nextFollowUpDate < todayStr;
      const newFollowUp: FollowUp = {
        id: `fol-${Date.now()}`,
        activityId: newActivity.id,
        customerId: data.customerId,
        customerName: data.customerName,
        opportunityId: data.opportunityId,
        opportunityName: data.opportunityName,
        entity: data.entity || 'PDT',
        actionText: data.nextAction,
        dueDate: data.nextFollowUpDate,
        dueTime: data.nextFollowUpTime,
        ownerId: data.userId,
        ownerName: data.userName,
        status: isOverdue ? 'Overdue' : 'Open',
        createdDate: data.date || today,
      };
      setFollowUps(prev => [newFollowUp, ...prev]);
    }

    return newActivity;
  };

  // Follow-up
  const addFollowUp = (data: Omit<FollowUp, 'id' | 'createdDate'>) => {
    const todayStr = '2026-10-05';
    const isOverdue = data.dueDate < todayStr;
    const newFollowUp: FollowUp = {
      ...data,
      id: `fol-${Date.now()}`,
      status: isOverdue ? 'Overdue' : data.status,
      createdDate: new Date().toISOString().split('T')[0],
    };
    setFollowUps(prev => [newFollowUp, ...prev]);
  };

  const completeFollowUp = (id: string, notes?: string) => {
    const todayStr = '2026-10-05';
    setFollowUps(prev => prev.map(f => {
      if (f.id === id) {
        return {
          ...f,
          status: 'Completed',
          completedDate: todayStr,
          completedBy: currentUser.name,
          completionNotes: notes || 'Follow-up action completed successfully.',
        };
      }
      return f;
    }));
  };

  // PICA
  const addPica = (data: Omit<Pica, 'id' | 'picaNumber' | 'createdDate' | 'progressHistory' | 'status'>): Pica => {
    const picaNumber = `PICA-2026-${String(picas.length + 1).padStart(4, '0')}`;
    const newPica: Pica = {
      ...data,
      id: `pica-${Date.now()}`,
      picaNumber,
      status: 'Open',
      createdDate: new Date().toISOString().split('T')[0],
      progressHistory: [
        {
          id: `prg-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          userId: currentUser.id,
          userName: currentUser.name,
          progressPercent: 0,
          notes: 'PICA created and logged into system.',
        }
      ],
      verificationHistory: [],
    };

    setPicas(prev => [newPica, ...prev]);

    // Add notification for PIC
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      type: 'pica_assigned',
      title: 'PICA Assigned',
      message: `${newPica.picaNumber} (${newPica.customerName}): ${newPica.issueTitle}`,
      customerName: newPica.customerName,
      relatedId: newPica.id,
      relatedEntity: 'pica',
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      isRead: false,
    };
    setNotifications(prev => [notif, ...prev]);

    return newPica;
  };

  const updatePica = (id: string, data: Partial<Pica>) => {
    setPicas(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          ...data,
        };
      }
      return p;
    }));
  };

  const startPicaProgress = (picaId: string) => {
    setPicas(prev => prev.map(p => {
      if (p.id === picaId) {
        return {
          ...p,
          status: 'In Progress',
        };
      }
      return p;
    }));
  };

  const addPicaProgress = (picaId: string, progressPercent: number, notes: string, attachment?: string) => {
    const entry: PicaProgressEntry = {
      id: `prg-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      userId: currentUser.id,
      userName: currentUser.name,
      progressPercent,
      notes,
      attachment,
    };

    setPicas(prev => prev.map(p => {
      if (p.id === picaId) {
        return {
          ...p,
          status: p.status === 'Open' ? 'In Progress' : p.status,
          progressHistory: [entry, ...p.progressHistory],
        };
      }
      return p;
    }));
  };

  const submitPicaForVerification = (picaId: string) => {
    setPicas(prev => prev.map(p => {
      if (p.id === picaId) {
        return {
          ...p,
          status: 'Waiting Verification',
        };
      }
      return p;
    }));

    const pica = picas.find(p => p.id === picaId);
    if (pica) {
      const notif: NotificationItem = {
        id: `notif-${Date.now()}`,
        type: 'pica_waiting_verification',
        title: 'PICA Waiting Verification',
        message: `${pica.picaNumber} submitted for verification by ${currentUser.name}`,
        customerName: pica.customerName,
        relatedId: pica.id,
        relatedEntity: 'pica',
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
        isRead: false,
      };
      setNotifications(prev => [notif, ...prev]);
    }
  };

  const verifyPica = (picaId: string, approved: boolean, notes: string) => {
    const todayStr = '2026-10-05';
    setPicas(prev => prev.map(p => {
      if (p.id === picaId) {
        const verifEntry = {
          id: `ver-${Date.now()}`,
          verifierId: currentUser.id,
          verifierName: currentUser.name,
          date: todayStr,
          decision: (approved ? 'Approved' : 'Revision Required') as 'Approved' | 'Revision Required',
          notes,
        };

        return {
          ...p,
          status: approved ? 'Verified' : 'In Progress',
          verifiedBy: approved ? currentUser.name : p.verifiedBy,
          verifiedDate: approved ? todayStr : p.verifiedDate,
          verificationNotes: notes,
          verificationDecision: approved ? 'Approved' : 'Revision Required',
          verificationHistory: [verifEntry, ...(p.verificationHistory || [])],
          progressHistory: [
            {
              id: `prg-${Date.now()}`,
              date: todayStr,
              userId: currentUser.id,
              userName: currentUser.name,
              progressPercent: approved ? 100 : 75,
              notes: approved ? `Verified by Head of Dept: ${notes}` : `Returned for revision: ${notes}`,
            },
            ...p.progressHistory
          ]
        };
      }
      return p;
    }));
  };

  const closePica = (picaId: string) => {
    const todayStr = '2026-10-05';
    setPicas(prev => prev.map(p => {
      if (p.id === picaId) {
        return {
          ...p,
          status: 'Closed',
          closedDate: todayStr,
          progressHistory: [
            {
              id: `prg-${Date.now()}`,
              date: todayStr,
              userId: currentUser.id,
              userName: currentUser.name,
              progressPercent: 100,
              notes: `PICA closed and marked resolved.`,
            },
            ...p.progressHistory
          ]
        };
      }
      return p;
    }));
  };

  // Contracts
  const addContract = (data: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>): Contract => {
    const today = new Date().toISOString().split('T')[0];
    const newContract: Contract = {
      ...data,
      id: `cont-${Date.now()}`,
      createdAt: today,
      updatedAt: today,
    };
    setContracts(prev => [newContract, ...prev]);
    return newContract;
  };

  const updateContract = (id: string, data: Partial<Contract>) => {
    const today = new Date().toISOString().split('T')[0];
    setContracts(prev => prev.map(c => c.id === id ? { ...c, ...data, updatedAt: today } : c));
  };

  const deleteContract = (id: string) => {
    setContracts(prev => prev.filter(c => c.id !== id));
  };

  // Operational Profiles
  const addOperationalProfile = (data: Omit<OperationalProfile, 'id' | 'createdAt' | 'updatedAt'>): OperationalProfile => {
    const today = new Date().toISOString().split('T')[0];
    const newProfile: OperationalProfile = {
      ...data,
      id: `op-${Date.now()}`,
      createdAt: today,
      updatedAt: today,
    };
    setOperationalProfiles(prev => [newProfile, ...prev]);
    return newProfile;
  };

  const updateOperationalProfile = (id: string, data: Partial<OperationalProfile>) => {
    const today = new Date().toISOString().split('T')[0];
    setOperationalProfiles(prev => prev.map(p => p.id === id ? { ...p, ...data, updatedAt: today } : p));
  };

  const deleteOperationalProfile = (id: string) => {
    setOperationalProfiles(prev => prev.filter(p => p.id !== id));
  };

  const validateAvailabilityBreakdown = (
    pa?: number,
    dt?: number,
    additional?: UnitCategoryMetric[]
  ): AvailabilityValidationResult => {
    return validateOperationalAvailability(pa, dt, additional);
  };

  // Customer Financial Monthly (Commercial Monitoring)
  const checkDuplicateFinancialRecordHandler = (
    candidate: FinancialCompositeKey,
    excludeId?: string
  ): FinancialDuplicateCheckResult => {
    return checkDuplicateFinancialRecord(financialRecords, candidate, excludeId);
  };

  const addFinancialRecord = (
    data: Omit<CustomerFinancialMonthly, 'id' | 'createdAt' | 'updatedAt'>
  ): { success: boolean; record?: CustomerFinancialMonthly; error?: string } => {
    // Check composite uniqueness: Customer + Year + Month + Entity + Segment + Project
    const dupCheck = checkDuplicateFinancialRecord(financialRecords, {
      customerId: data.customerId,
      year: data.year,
      month: data.month,
      entity: data.entity,
      segment: data.segment,
      projectLocation: data.projectLocation,
    });

    if (dupCheck.isDuplicate) {
      return {
        success: false,
        error: dupCheck.message || 'Duplicate financial record detected for this customer, period, entity, and project.'
      };
    }

    const today = new Date().toISOString().split('T')[0];
    const newRecord: CustomerFinancialMonthly = {
      ...data,
      id: `fin-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: today,
      updatedAt: today,
      createdBy: data.createdBy || currentUser.name,
      updatedBy: currentUser.name
    };

    setFinancialRecords(prev => [newRecord, ...prev]);
    return { success: true, record: newRecord };
  };

  const updateFinancialRecord = (
    id: string,
    data: Partial<CustomerFinancialMonthly>
  ): { success: boolean; error?: string } => {
    const existing = financialRecords.find(r => r.id === id);
    if (!existing) {
      return { success: false, error: 'Financial record not found.' };
    }

    // Verify uniqueness if any composite key field is changed
    const candidate: FinancialCompositeKey = {
      customerId: data.customerId ?? existing.customerId,
      year: data.year ?? existing.year,
      month: data.month ?? existing.month,
      entity: data.entity ?? existing.entity,
      segment: data.segment ?? existing.segment,
      projectLocation: data.projectLocation ?? existing.projectLocation,
    };

    const dupCheck = checkDuplicateFinancialRecord(financialRecords, candidate, id);
    if (dupCheck.isDuplicate) {
      return {
        success: false,
        error: dupCheck.message || 'Update would result in a duplicate financial record.'
      };
    }

    const today = new Date().toISOString().split('T')[0];
    setFinancialRecords(prev => prev.map(r => r.id === id ? {
      ...r,
      ...data,
      updatedAt: today,
      updatedBy: currentUser.name
    } : r));

    return { success: true };
  };

  const deleteFinancialRecord = (id: string) => {
    setFinancialRecords(prev => prev.filter(r => r.id !== id));
  };

  // Master Data
  const addMasterDataItem = (data: Omit<MasterDataItem, 'id'>) => {
    const newItem: MasterDataItem = {
      ...data,
      id: `md-${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
    };
    setMasterData(prev => [...prev, newItem]);
  };

  const updateMasterDataItem = (id: string, data: Partial<MasterDataItem>) => {
    setMasterData(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
  };

  const toggleMasterDataStatus = (id: string) => {
    setMasterData(prev => prev.map(m => m.id === id ? { ...m, isActive: !m.isActive } : m));
  };

  // Users
  const addUser = (data: Omit<User, 'id' | 'createdDate' | 'lastLogin'>) => {
    const newUser: User = {
      ...data,
      id: `usr-${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
      lastLogin: '-',
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, data: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...data } : u));
  };

  const toggleUserStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u));
  };

  // Notifications
  const unreadNotificationCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  // -------------------------------------------------------------
  // 3-TIER DATA SCOPING HIERARCHY
  // Tier 1: BD / KAM -> Ownership Data (only their own records)
  // Tier 2: Head of Dept -> Department Data (records in led departments)
  // Tier 3: Super Admin -> All Data (global company-wide visibility)
  // -------------------------------------------------------------

  // Departments led by currentUser
  const managedDepartments = useMemo(() => {
    if (currentUser.role === 'Super Admin') {
      return masterData
        .filter(m => m.category === 'Department' && m.isActive)
        .map(m => m.name);
    }
    if (currentUser.role === 'Head of Department') {
      const depts = masterData
        .filter(m => m.category === 'Department' && (
          m.headUserId === currentUser.id ||
          m.name.toLowerCase() === (currentUser.department || '').toLowerCase() ||
          (currentUser.name.toLowerCase().includes('bambang') && (
            m.name.toLowerCase().includes('commercial') ||
            m.name.toLowerCase().includes('business development') ||
            m.name.toLowerCase().includes('key account management')
          ))
        ))
        .map(m => m.name);

      if (depts.length === 0 && currentUser.department) {
        depts.push(currentUser.department);
      }
      return Array.from(new Set(depts));
    }
    return currentUser.department ? [currentUser.department] : [];
  }, [masterData, currentUser]);

  // User IDs belonging to managed departments
  const managedUserIds = useMemo(() => {
    if (currentUser.role === 'Super Admin') {
      return users.map(u => u.id);
    }
    if (currentUser.role === 'Head of Department') {
      const team = users.filter(u => {
        if (u.id === currentUser.id) return true;
        const uDept = (u.department || '').toLowerCase().trim();
        const matchesManagedDept = managedDepartments.some(d => {
          const dLower = d.toLowerCase().trim();
          return dLower === uDept || uDept.includes(dLower) || dLower.includes(uDept);
        });
        if (matchesManagedDept) return true;

        // Note: KAM and BD have the same Head Dept
        if (currentUser.role === 'Head of Department' && (
          currentUser.name.toLowerCase().includes('bambang') ||
          (currentUser.department && currentUser.department.toLowerCase().includes('commercial'))
        )) {
          if (u.role === 'Business Development' || u.role === 'Key Account Management') return true;
        }

        return false;
      });
      return team.map(u => u.id);
    }
    return [currentUser.id];
  }, [users, managedDepartments, currentUser]);

  // Active Master Data entities
  const userPermittedEntities: EntityId[] = useMemo(() => {
    const activeEntities = masterData
      .filter(m => m.category === 'Entity' && m.isActive)
      .map(m => m.code as EntityId);
    return activeEntities.length > 0 ? activeEntities : (['PETRA', 'PDT', 'PLI'] as EntityId[]);
  }, [masterData]);

  // Helper filter function for multi-entity
  const matchesEntityFilter = (itemEntity?: EntityId) => {
    if (!itemEntity) return true;
    // If specific entity selected, must match it
    if (selectedEntity !== 'ALL') {
      return itemEntity === selectedEntity;
    }
    return true;
  };

  // 1. Scoped Customers (Shared KYC Master, optionally filtered if entity specified and customer defines operatingEntities)
  const scopedCustomers = useMemo(() => {
    let list = customers;
    if (currentUser.role === 'Head of Department') {
      list = customers.filter(c => managedUserIds.includes(c.ownerId) || !c.ownerId);
    } else if (currentUser.role !== 'Super Admin') {
      list = customers.filter(c => c.ownerId === currentUser.id);
    }

    if (selectedEntity !== 'ALL') {
      return list.filter(c => !c.operatingEntities || c.operatingEntities.length === 0 || c.operatingEntities.includes(selectedEntity));
    }
    return list;
  }, [customers, currentUser.role, currentUser.id, managedUserIds, selectedEntity]);

  // 2. Scoped Opportunities
  const scopedOpportunities = useMemo(() => {
    let list = opportunities;
    if (currentUser.role === 'Head of Department') {
      list = opportunities.filter(o => managedUserIds.includes(o.ownerId) || !o.ownerId);
    } else if (currentUser.role !== 'Super Admin') {
      list = opportunities.filter(o => o.ownerId === currentUser.id);
    }
    return list.filter(o => matchesEntityFilter(o.entity));
  }, [opportunities, currentUser.role, currentUser.id, managedUserIds, selectedEntity, userPermittedEntities]);

  // 4. Scoped Activities
  const scopedActivities = useMemo(() => {
    let list = activities;
    if (currentUser.role === 'Head of Department') {
      list = activities.filter(a => managedUserIds.includes(a.userId) || a.createdBy === currentUser.name);
    } else if (currentUser.role !== 'Super Admin') {
      list = activities.filter(a => a.userId === currentUser.id || a.createdBy === currentUser.name);
    }
    return list.filter(a => matchesEntityFilter(a.entity));
  }, [activities, currentUser.role, currentUser.id, currentUser.name, managedUserIds, selectedEntity, userPermittedEntities]);

  // 5. Scoped Follow-ups
  const scopedFollowUps = useMemo(() => {
    let list = followUps;
    if (currentUser.role === 'Head of Department') {
      list = followUps.filter(f => (f.assignedToId ? managedUserIds.includes(f.assignedToId) : false) || managedUserIds.includes(f.ownerId) || (!f.assignedToId && !f.ownerId));
    } else if (currentUser.role !== 'Super Admin') {
      list = followUps.filter(f => (f.assignedToId ? f.assignedToId === currentUser.id : false) || f.ownerId === currentUser.id);
    }
    return list.filter(f => matchesEntityFilter(f.entity));
  }, [followUps, currentUser.role, currentUser.id, managedUserIds, selectedEntity, userPermittedEntities]);

  // 6. Scoped PICAs
  const scopedPicas = useMemo(() => {
    let list = picas;
    if (currentUser.role === 'Head of Department') {
      list = picas.filter(p => {
        const pDept = p.department || users.find(u => u.id === p.picId)?.department;
        const matchesDept = pDept && managedDepartments.some(d => d.toLowerCase() === pDept.toLowerCase());
        const matchesPic = managedUserIds.includes(p.picId);
        return matchesDept || matchesPic;
      });
    } else if (currentUser.role !== 'Super Admin') {
      list = picas.filter(p => p.picId === currentUser.id || p.createdBy === currentUser.name);
    }
    return list.filter(p => matchesEntityFilter(p.entity));
  }, [picas, currentUser.role, currentUser.id, currentUser.name, managedDepartments, managedUserIds, users, selectedEntity, userPermittedEntities]);

  // Clean slate helper: Clears all transactional mock data while keeping accounts and master data
  const clearAllTransactionData = () => {
    setCustomers([]);
    setContacts([]);
    setOpportunities([]);
    setActivities([]);
    setFollowUps([]);
    setPicas([]);
    setContracts([]);
    setOperationalProfiles([]);
    setFinancialRecords([]);
    setNotifications([]);
    [
      'cms_customers',
      'cms_contacts',
      'cms_opportunities',
      'cms_activities',
      'cms_follow_ups',
      'cms_picas',
      'cms_contracts',
      'cms_operational_profiles',
      'cms_customer_financial_monthly',
      'cms_notifications'
    ].forEach(k => {
      try {
        localStorage.removeItem(k);
      } catch {
        // ignore
      }
    });
    showToast('Semua data transaksi telah berhasil dikosongkan.', 'success', 'Clean Slate');
  };

  return (
    <AppContext.Provider
      value={{
        // Multi-Entity Scope
        selectedEntity,
        setSelectedEntity,
        availableEntities,
        entitiesMap,

        isAuthenticated,
        login,
        logout,
        currentUser,
        setCurrentUser: (u) => setCurrentUserId(u.id),
        users,
        switchUser,
        hasPermission,
        canAccessMenu,
        canVerifyPica,
        financialEditRoles,
        setFinancialEditRoles,
        canViewFinancial,
        canEditFinancial,

        isSidebarCollapsed,
        toggleSidebarCollapsed,

        toasts,
        showToast,
        dismissToast,

        activeMenu,
        setActiveMenu,
        selectedCustomerId,
        setSelectedCustomerId,
        customer360Tab,
        setCustomer360Tab,
        openCustomer360,

        selectedContractId,
        setSelectedContractId,
        openContractDetail,

        selectedOpportunityId,
        setSelectedOpportunityId,
        openOpportunityDetail,

        selectedPicaId,
        setSelectedPicaId,
        picaSubTab,
        setPicaSubTab,
        openPicaDetail,

        monitoringSubTab,
        setMonitoringSubTab,

        searchQuery,
        setSearchQuery,

        isMobileSidebarOpen,
        setIsMobileSidebarOpen,

        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsRead,
        isNotificationOpen,
        setIsNotificationOpen,

        customers,
        checkDuplicateCustomer,
        addCustomer,
        updateCustomer,
        mergeCustomers,

        contacts,
        addContact,
        updateContact,
        deleteContact,

        opportunities,
        addOpportunity,
        updateOpportunityStage,
        updateOpportunity,
        completeOpportunityNextAction,

        activities,
        addActivity,

        followUps,
        addFollowUp,
        completeFollowUp,

        picas,
        addPica,
        updatePica,
        startPicaProgress,
        addPicaProgress,
        submitPicaForVerification,
        verifyPica,
        closePica,

        contracts,
        addContract,
        updateContract,
        deleteContract,

        operationalProfiles,
        addOperationalProfile,
        updateOperationalProfile,
        deleteOperationalProfile,
        validateAvailabilityBreakdown,

        financialRecords,
        addFinancialRecord,
        updateFinancialRecord,
        deleteFinancialRecord,
        checkDuplicateFinancialRecord: checkDuplicateFinancialRecordHandler,

        masterData,
        addMasterDataItem,
        updateMasterDataItem,
        toggleMasterDataStatus,

        addUser,
        updateUser,
        toggleUserStatus,

        isAddActivityOpen,
        setIsAddActivityOpen,
        activityPreselectedCustomerId,
        setActivityPreselectedCustomerId,
        activityPreselectedOpportunityId,
        setActivityPreselectedOpportunityId,

        isAddOpportunityOpen,
        setIsAddOpportunityOpen,
        opportunityPreselectedCustomerId,
        setOpportunityPreselectedCustomerId,

        isAddPicaOpen,
        setIsAddPicaOpen,
        picaPreselectedCustomerId,
        setPicaPreselectedCustomerId,

        // 3-Tier Scoped Data Collections
        scopedCustomers,
        scopedOpportunities,
        scopedActivities,
        scopedFollowUps,
        scopedPicas,
        managedDepartments,
        clearAllTransactionData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
