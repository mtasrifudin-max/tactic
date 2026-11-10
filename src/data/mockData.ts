import {
  User,
  EntityId,
  EntityInfo,
  Customer,
  ContactPerson,
  Opportunity,
  Activity,
  FollowUp,
  Pica,
  NotificationItem,
  MasterDataItem,
  Contract,
  OperationalProfile,
  CustomerFinancialMonthly
} from '../types';

export const ENTITIES: Record<EntityId, EntityInfo> = {
  PETRA: {
    id: 'PETRA',
    code: 'PETRA',
    name: 'PETRA',
    fullName: 'PT Pancaran Energi Transport',
    color: '#0070C0',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
    description: 'Energy, Marine & Bulk Transportation Logistics'
  },
  PDT: {
    id: 'PDT',
    code: 'PDT',
    name: 'PDT',
    fullName: 'PT Pancaran Darat Transport',
    color: '#D97706',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
    description: 'Land Transportation, Fleet Hauling & Trucking Services'
  },
  PLI: {
    id: 'PLI',
    code: 'PLI',
    name: 'PLI',
    fullName: 'PT Pancaran Logistik Indonesia',
    color: '#059669',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-200',
    description: 'Freight Forwarding, Contract Logistics & Warehousing'
  }
};

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-1',
    name: 'Hendra Kusuma',
    email: 'admin@commercial.local',
    role: 'Super Admin',
    department: 'Commercial & IT',
    position: 'Chief Commercial Technology Officer',
    assignedEntities: ['PETRA', 'PDT', 'PLI'],
    status: 'Active',
    createdDate: '2025-01-10',
    lastLogin: '2026-10-05 08:15',
  },
  {
    id: 'usr-2',
    name: 'Bambang Wijaya',
    email: 'head@commercial.local',
    role: 'Head of Department',
    department: 'Commercial Management',
    position: 'Head of Commercial Department',
    assignedEntities: ['PETRA', 'PDT', 'PLI'],
    status: 'Active',
    createdDate: '2025-01-15',
    lastLogin: '2026-10-05 08:30',
  },
  {
    id: 'usr-3',
    name: 'Budi Santoso',
    email: 'bd@commercial.local',
    role: 'Business Development',
    department: 'Commercial & Business Development',
    position: 'Senior BD Executive',
    assignedEntities: ['PETRA', 'PDT', 'PLI'],
    status: 'Active',
    createdDate: '2025-02-01',
    lastLogin: '2026-10-05 09:00',
  },
  {
    id: 'usr-4',
    name: 'Siti Rahma',
    email: 'kam@commercial.local',
    role: 'Key Account Management',
    department: 'Key Account Management',
    position: 'Senior Key Account Manager',
    assignedEntities: ['PETRA', 'PDT', 'PLI'],
    status: 'Active',
    createdDate: '2025-02-15',
    lastLogin: '2026-10-05 08:45',
  },
];

// Clean-slate empty transaction records for end-to-end testing
export const INITIAL_CUSTOMERS: Customer[] = [];

export const INITIAL_CONTACTS: ContactPerson[] = [];

export const INITIAL_OPPORTUNITIES: Opportunity[] = [];

export const INITIAL_ACTIVITIES: Activity[] = [];

export const INITIAL_FOLLOW_UPS: FollowUp[] = [];

export const INITIAL_PICAS: Pica[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const INITIAL_MASTER_DATA: MasterDataItem[] = [
  { id: 'md-ent-1', category: 'Entity', code: 'PETRA', name: 'PT Pancaran Energi Transport', description: 'Energy, Marine & Bulk Transportation Logistics', isActive: true },
  { id: 'md-ent-2', category: 'Entity', code: 'PDT', name: 'PT Pancaran Darat Transport', description: 'Land Transportation, Fleet Hauling & Trucking Services', isActive: true },
  { id: 'md-ent-3', category: 'Entity', code: 'PLI', name: 'PT Pancaran Logistik Indonesia', description: 'Freight Forwarding, Contract Logistics & Warehousing', isActive: true },
  { id: 'md-1', category: 'Industry', code: 'AUTO', name: 'Automotive', isActive: true },
  { id: 'md-2', category: 'Industry', code: 'MFG', name: 'Manufacturing', isActive: true },
  { id: 'md-3', category: 'Industry', code: 'FMCG', name: 'FMCG', isActive: true },
  { id: 'md-4', category: 'Industry', code: 'MINE', name: 'Mining & Bulk', isActive: true },
  { id: 'md-5', category: 'Industry', code: 'OGAS', name: 'Oil & Gas', isActive: true },
  { id: 'md-6', category: 'Industry', code: 'CHEM', name: 'Chemicals', isActive: true },
  { id: 'md-7', category: 'Business Segment', code: 'STRAT', name: 'Strategic Account', isActive: true },
  { id: 'md-8', category: 'Business Segment', code: 'ENT', name: 'Enterprise', isActive: true },
  { id: 'md-9', category: 'Business Segment', code: 'MID', name: 'Mid-Market', isActive: true },
  { id: 'md-10', category: 'Service', code: 'TRK-DED', name: 'Dedicated FTL Trucking', isActive: true },
  { id: 'md-11', category: 'Service', code: 'CAR-CARR', name: 'Automotive Car Carrier', isActive: true },
  { id: 'md-12', category: 'Service', code: 'WH-DIST', name: 'Warehousing & Distribution', isActive: true },
  { id: 'md-13', category: 'Service', code: 'MIN-BULK', name: 'Mining Bulk Haulage', isActive: true },
  { id: 'md-14', category: 'Service', code: 'ISO-TANK', name: 'ISO Tank & Drayage', isActive: true },
  { id: 'md-15', category: 'Activity Type', code: 'VISIT', name: 'Customer Visit', isActive: true },
  { id: 'md-16', category: 'Activity Type', code: 'MEET', name: 'Meeting', isActive: true },
  { id: 'md-17', category: 'Activity Type', code: 'CALL', name: 'Call', isActive: true },
  { id: 'md-18', category: 'Activity Type', code: 'EMAIL', name: 'Email', isActive: true },
  { id: 'md-19', category: 'Activity Type', code: 'WA', name: 'WhatsApp', isActive: true },
  { id: 'md-20', category: 'Activity Type', code: 'PRES', name: 'Presentation', isActive: true },
  { id: 'md-21', category: 'Activity Type', code: 'FOL', name: 'Follow-up', isActive: true },
  { id: 'md-22', category: 'Activity Type', code: 'NEG', name: 'Negotiation', isActive: true },
  { id: 'md-23', category: 'Activity Type', code: 'INT-DISC', name: 'Internal Discussion', isActive: true },
  { id: 'md-24', category: 'Customer Type', code: 'PROSP', name: 'Prospect', isActive: true },
  { id: 'md-25', category: 'Customer Type', code: 'EXIST', name: 'Existing Customer', isActive: true },
  { id: 'md-26', category: 'Customer Status', code: 'ACT-CUST', name: 'Active Customer', isActive: true },
  { id: 'md-27', category: 'Customer Status', code: 'PROSPECT', name: 'Prospect', isActive: true },
  { id: 'md-28', category: 'Customer Status', code: 'DORMANT', name: 'Dormant', isActive: true },
  { id: 'md-29', category: 'Customer Status', code: 'INACT', name: 'Inactive', isActive: true },
  { id: 'md-34', category: 'Lost Reason', code: 'PRICE', name: 'Price Non-Competitive', isActive: true },
  { id: 'md-35', category: 'Lost Reason', code: 'SPEC', name: 'Fleet Spec Mismatch', isActive: true },
  { id: 'md-36', category: 'Lost Reason', code: 'TIMING', name: 'Project Postponed / Timing', isActive: true },
  { id: 'md-37', category: 'Lost Reason', code: 'INCUMB', name: 'Competitor / Incumbent Advantage', isActive: true },
  { id: 'md-38', category: 'PICA Priority', code: 'CRIT', name: 'Critical', isActive: true },
  { id: 'md-39', category: 'PICA Priority', code: 'HIGH', name: 'High', isActive: true },
  { id: 'md-40', category: 'PICA Priority', code: 'MED', name: 'Medium', isActive: true },
  { id: 'md-41', category: 'PICA Priority', code: 'LOW', name: 'Low', isActive: true },
  { id: 'md-42', category: 'PICA Status', code: 'OPEN', name: 'Open', isActive: true },
  { id: 'md-43', category: 'PICA Status', code: 'IN-PRG', name: 'In Progress', isActive: true },
  { id: 'md-44', category: 'PICA Status', code: 'WAIT-VERIF', name: 'Waiting Verification', isActive: true },
  { id: 'md-45', category: 'PICA Status', code: 'VERIF', name: 'Verified', isActive: true },
  { id: 'md-46', category: 'PICA Status', code: 'CLOSED', name: 'Closed', isActive: true },
  { id: 'md-47', category: 'Department', code: 'COMM-BD', name: 'Commercial & Business Development', isActive: true, headUserId: 'usr-2', headUserName: 'Bambang Wijaya' },
  { id: 'md-48', category: 'Department', code: 'KAM', name: 'Key Account Management', isActive: true, headUserId: 'usr-2', headUserName: 'Bambang Wijaya' },
  { id: 'md-49', category: 'Department', code: 'OPS-LOG', name: 'Operations & Fleet Logistics', isActive: true, headUserId: 'usr-2', headUserName: 'Bambang Wijaya' },
  { id: 'md-50', category: 'Department', code: 'SCM', name: 'Supply Chain Management', isActive: true, headUserId: 'usr-2', headUserName: 'Bambang Wijaya' },
  { id: 'md-51', category: 'Department', code: 'COMM-FIN', name: 'Commercial Finance & Billing', isActive: true, headUserId: 'usr-2', headUserName: 'Bambang Wijaya' },
  { id: 'md-52', category: 'Department', code: 'COMM-IT', name: 'Commercial & IT', isActive: true, headUserId: 'usr-1', headUserName: 'Hendra Kusuma' },
  { id: 'md-53', category: 'Department', code: 'COMM-MGMT', name: 'Commercial Management', isActive: true, headUserId: 'usr-2', headUserName: 'Bambang Wijaya' },
  { id: 'md-54', category: 'Position Title', code: 'CCTO', name: 'Chief Commercial Technology Officer', isActive: true },
  { id: 'md-55', category: 'Position Title', code: 'HOD', name: 'Head of Commercial Department', isActive: true },
  { id: 'md-56', category: 'Position Title', code: 'SR-BD', name: 'Senior BD Executive', isActive: true },
  { id: 'md-57', category: 'Position Title', code: 'SR-KAM', name: 'Senior Key Account Manager', isActive: true },
  { id: 'md-58', category: 'Position Title', code: 'SPEC', name: 'Commercial Specialist', isActive: true },
  { id: 'md-59', category: 'Position Title', code: 'LEAD', name: 'Account Team Lead', isActive: true },
  { id: 'md-60', category: 'Position Title', code: 'LOG-MGR', name: 'Logistics Solution Manager', isActive: true },
];

export const INITIAL_CONTRACTS: Contract[] = [];

export const INITIAL_OPERATIONAL_PROFILES: OperationalProfile[] = [];

export const INITIAL_CUSTOMER_FINANCIALS: CustomerFinancialMonthly[] = [];
