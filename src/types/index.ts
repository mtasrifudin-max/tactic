export type UserRole = 'Super Admin' | 'Head of Department' | 'Business Development' | 'Key Account Management';

export type EntityId = 'PETRA' | 'PDT' | 'PLI';

export interface EntityInfo {
  id: EntityId;
  code: EntityId;
  name: string;
  fullName: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  position: string;
  assignedEntities: EntityId[];
  status: 'Active' | 'Inactive';
  createdDate: string;
  lastLogin: string;
}

export type CustomerType = 'Prospect' | 'Existing Customer';
export type CustomerStatus = 'Prospect' | 'Qualified' | 'Active' | 'Inactive';

export interface Customer {
  id: string;
  code: string; // e.g. CUST-001
  name: string;
  legalEntityName: string;
  customerType: CustomerType;
  industry: string;
  businessSegment: string;
  address: string;
  city: string;
  province: string;
  country: string;
  website: string;
  npwp: string;
  nib: string;
  phone: string;
  status: CustomerStatus;
  ownerId: string;
  ownerName: string;
  ownerRole: UserRole;
  potentialRevenue: number; // in IDR
  operatingEntities?: EntityId[]; // Operating entities currently servicing this customer
  currentService?: string;
  potentialService?: string;
  estimatedVolume?: string;
  competitor?: string;
  paymentTerm?: string;
  createdBy: string;
  createdDate: string;
  lastUpdated: string;
}

export type ContactRoleType = 
  | 'Decision Maker'
  | 'Influencer'
  | 'Procurement'
  | 'User'
  | 'Operational PIC'
  | 'Finance PIC'
  | 'Other';

export interface ContactPerson {
  id: string;
  customerId: string;
  customerName: string;
  name: string;
  jobTitle: string;
  department: string;
  email: string;
  phone: string;
  whatsapp: string;
  roleTypes: ContactRoleType[];
  notes?: string;
  createdDate: string;
}

export type OpportunityStage = 'Qualification' | 'Proposal' | 'Negotiation' | 'Award' | 'Lost';

export type LostReason = 
  | 'Price'
  | 'Competitor'
  | 'Customer Cancelled'
  | 'Service Capability'
  | 'No Response'
  | 'Other';

export interface Opportunity {
  id: string;
  code: string; // OPP-001
  entity: EntityId; // PETRA | PDT | PLI
  customerId: string;
  customerName: string;
  opportunityName: string;
  service: string;
  description: string;
  potentialRevenue: number;
  probability: number; // 0 - 100%
  stage: OpportunityStage;
  competitor?: string;
  targetClosingDate: string;
  ownerId: string;
  ownerName: string;
  createdDate: string;
  createdBy?: string;
  updatedDate?: string;
  lastActivityDate: string;
  nextAction?: string;
  nextFollowUpDate?: string;
  status: 'Open' | 'Won' | 'Lost';
  notes?: string;
  lostReason?: LostReason;
  lostNotes?: string;
}

export type ActivityType = 
  | 'Customer Visit'
  | 'Meeting'
  | 'Call'
  | 'Email'
  | 'WhatsApp'
  | 'Presentation'
  | 'Follow-up'
  | 'Negotiation'
  | 'Internal Discussion'
  | 'Other';

export interface Activity {
  id: string;
  code: string;
  entity: EntityId; // PETRA | PDT | PLI
  date: string;
  time: string;
  userId: string;
  userName: string;
  customerId: string;
  customerName: string;
  opportunityId?: string;
  opportunityName?: string;
  activityType: ActivityType;
  subject: string;
  description: string;
  result: string;
  nextAction?: string;
  nextFollowUpDate?: string;
  nextFollowUpTime?: string;
  attachment?: string;
  createdBy?: string;
  createdDate: string;
}

export type FollowUpStatus = 'Open' | 'Completed' | 'Overdue' | 'Cancelled';

export interface FollowUp {
  id: string;
  entity: EntityId; // PETRA | PDT | PLI
  activityId?: string;
  customerId: string;
  customerName: string;
  opportunityId?: string;
  opportunityName?: string;
  actionText: string;
  dueDate: string;
  dueTime?: string;
  ownerId: string;
  ownerName: string;
  assignedToId?: string;
  assignedToName?: string;
  status: FollowUpStatus;
  completedDate?: string;
  completedBy?: string;
  completionNotes?: string;
  createdDate: string;
}

export type PicaPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type PicaStatus = 'Open' | 'In Progress' | 'Waiting Verification' | 'Verified' | 'Closed';

export interface PicaProgressEntry {
  id: string;
  date: string;
  userId: string;
  userName: string;
  progressPercent: number;
  notes: string;
  attachment?: string;
}

export interface PicaVerificationEntry {
  id: string;
  verifierId: string;
  verifierName: string;
  date: string;
  decision: 'Approved' | 'Revision Required';
  notes: string;
}

export interface Pica {
  id: string;
  picaNumber: string; // PICA-2026-0001
  entity: EntityId; // PETRA | PDT | PLI
  customerId: string;
  customerName: string;
  relatedOpportunityId?: string;
  relatedOpportunityName?: string;
  sourceActivityId?: string;
  sourceActivitySubject?: string;
  issueTitle: string;
  issueDescription: string;
  rootCause?: string;
  correctiveAction: string;
  preventiveAction?: string;
  picId: string;
  picName: string;
  department?: string;
  priority: PicaPriority;
  dueDate: string;
  status: PicaStatus;
  evidence?: string;
  notes?: string;
  createdBy: string;
  createdDate: string;
  verifiedBy?: string;
  verifiedDate?: string;
  verificationNotes?: string;
  verificationDecision?: 'Approved' | 'Revision Required';
  verificationHistory?: PicaVerificationEntry[];
  closedDate?: string;
  progressHistory: PicaProgressEntry[];
}

export type NotificationType = 
  | 'followup_due_today' 
  | 'followup_overdue' 
  | 'pica_assigned' 
  | 'pica_due_soon' 
  | 'pica_overdue' 
  | 'pica_waiting_verification'
  | 'contract_expiring_soon'
  | 'contract_expired';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  customerName?: string;
  contractTitle?: string;
  expiryDate?: string;
  daysRemaining?: number;
  relatedId?: string;
  relatedEntity: 'customer' | 'opportunity' | 'followup' | 'pica' | 'contract';
  date: string;
  isRead: boolean;
  isUrgent?: boolean;
}

export interface MasterDataItem {
  id: string;
  category: 'Entity' | 'Industry' | 'Business Segment' | 'Service' | 'Activity Type' | 'Customer Type' | 'Customer Status' | 'Lost Reason' | 'PICA Priority' | 'PICA Status' | 'Department' | 'Position Title';
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdDate?: string;
  headUserId?: string; // Lead Approver / Head of Dept User ID
  headUserName?: string; // Lead Approver / Head of Dept Name
}

export type ContractType = 'Main Contract' | 'Addendum' | 'Amendment' | 'Renewal' | 'Other';
export type ContractStatus = 'Draft' | 'Active' | 'Expiring Soon' | 'Expired' | 'Terminated';

export interface Contract {
  id: string;
  customerId: string;
  entity: EntityId;
  contractTitle: string;
  projectLocation: string;
  documentNumber: string;
  contractType: ContractType;
  effectiveDate: string;
  expiryDate: string;
  top: string; // Term of Payment
  contractPic: string;
  picPhone: string;
  picEmail: string;
  contractStatus: ContractStatus;
  attachment?: string;
  notes?: string;
  parentContractId?: string; // For hierarchy: Main Contract -> Addendum/Amendment/Renewal
  createdBy: string;
  createdAt: string;
  updatedBy: string;
  updatedAt: string;
}

export type OperationalProfileStatus = 'Planned' | 'Active' | 'Inactive' | 'Completed';

// Extensible unit category metric to support PA, DT, and future categories (e.g. Standby, Maintenance, Utilization)
export interface UnitCategoryMetric {
  key: string;
  label: string;
  percentage: number;
}

export interface OperationalProfile {
  id: string; // Operational Profile ID
  customerId: string; // Customer ID
  entity: EntityId; // Entity (PETRA | PDT | PLI)
  projectLocation: string; // Project / Location
  service: string; // Service
  operationalRegion: string; // Operational Region
  origin: string; // Origin
  destination: string; // Destination
  totalUnit: number; // Total Unit
  unitType: string; // Unit Type
  paPercentage?: number; // PA Percentage (Physical Availability)
  dtPercentage?: number; // DT Percentage (Downtime)
  additionalCategories?: UnitCategoryMetric[]; // Extensible structure for future unit categories
  estimatedTrips?: number | string; // Estimated Trips
  estimatedVolume?: string; // Estimated Volume
  sla?: string; // SLA
  effectiveDate: string; // Effective Date
  endDate: string; // End Date
  status: OperationalProfileStatus; // Status: Planned | Active | Inactive | Completed
  notes?: string; // Notes
  createdBy: string; // Created By
  createdAt: string; // Created At
  updatedBy: string; // Updated By
  updatedAt: string; // Updated At
}

export interface AvailabilityValidationResult {
  isValid: boolean;
  totalPercentage: number;
  warning?: string;
}

export const validateOperationalAvailability = (
  paPercentage?: number,
  dtPercentage?: number,
  additionalCategories?: UnitCategoryMetric[]
): AvailabilityValidationResult => {
  let total = 0;
  let countEntered = 0;

  if (paPercentage !== undefined && paPercentage !== null && !isNaN(paPercentage)) {
    total += Number(paPercentage);
    countEntered++;
  }
  if (dtPercentage !== undefined && dtPercentage !== null && !isNaN(dtPercentage)) {
    total += Number(dtPercentage);
    countEntered++;
  }

  if (additionalCategories && additionalCategories.length > 0) {
    additionalCategories.forEach(cat => {
      if (cat.percentage !== undefined && cat.percentage !== null && !isNaN(cat.percentage)) {
        total += Number(cat.percentage);
        countEntered++;
      }
    });
  }

  if (countEntered >= 2) {
    const roundedTotal = Math.round(total * 100) / 100;
    if (roundedTotal !== 100) {
      return {
        isValid: false,
        totalPercentage: roundedTotal,
        warning: `Total availability breakdown is ${roundedTotal}% (expected 100%). Adjust PA/DT or category allocation.`
      };
    }
  }

  return {
    isValid: true,
    totalPercentage: Math.round(total * 100) / 100
  };
};

// ==========================================
// COMMERCIAL FINANCIAL MONITORING
// Customer Financial Performance Monthly Structure
// Commercial monitoring (not Accounting/ERP)
// ==========================================

export interface CustomerFinancialMonthly {
  id: string; // Financial Record ID
  customerId: string; // Customer ID
  year: number; // Year (e.g. 2026)
  month: number; // Month (1 - 12)
  entity: EntityId; // Entity (PETRA | PDT | PLI)
  segment: string; // Business Segment (e.g. Automotive, FMCG, Mining)
  projectLocation: string; // Project / Location
  revenue: number; // Revenue (manually entered or imported - no invented formulas)
  truckingContract: number; // Trucking Contract amount
  variableCost: number; // Variable Cost
  driverCost: number; // Driver Cost
  shipmentCost: number; // Shipment Cost
  directMargin: number; // Direct Margin (manually entered or imported - no calculated override)
  targetDirectMargin: number; // Target Direct Margin (manually entered or imported)
  ar: number; // Accounts Receivable (manually entered or imported)
  unbill: number; // Unbill amount (manually entered or imported)
  dataSource: string; // Data Source: 'Manual Entry' | 'SAP ERP Sync' | 'TMS Billing Import' | 'Excel Upload' | string
  externalId?: string; // External ID (ERP reference, billing document ID, etc.)
  lastSyncDate?: string; // Last Sync Date (ISO string or YYYY-MM-DD)
  createdBy: string; // Created By
  createdAt: string; // Created At
  updatedBy: string; // Updated By
  updatedAt: string; // Updated At
}

export interface FinancialCompositeKey {
  customerId: string;
  year: number;
  month: number;
  entity: EntityId | string;
  segment: string;
  projectLocation: string;
}

export interface FinancialDuplicateCheckResult {
  isDuplicate: boolean;
  duplicateRecord?: CustomerFinancialMonthly;
  message?: string;
}

/**
 * Builds standard composite uniqueness key for monthly financial records:
 * Customer + Year + Month + Entity + Segment + Project
 */
export const buildFinancialRecordKey = (
  record: FinancialCompositeKey
): string => {
  const norm = (val?: string) => (val || '').trim().toLowerCase();
  return `${record.customerId}::${record.year}::${record.month}::${record.entity}::${norm(record.segment)}::${norm(record.projectLocation)}`;
};

/**
 * Prevents accidental exact duplicate financial records for the same Customer,
 * Year, Month, Entity, Segment, and Project / Location.
 */
export const checkDuplicateFinancialRecord = (
  records: CustomerFinancialMonthly[],
  candidate: FinancialCompositeKey,
  excludeId?: string
): FinancialDuplicateCheckResult => {
  const candidateKey = buildFinancialRecordKey(candidate);

  const duplicate = records.find(r => {
    if (excludeId && r.id === excludeId) return false;
    const currentKey = buildFinancialRecordKey({
      customerId: r.customerId,
      year: r.year,
      month: r.month,
      entity: r.entity,
      segment: r.segment,
      projectLocation: r.projectLocation
    });
    return currentKey === candidateKey;
  });

  if (duplicate) {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthStr = monthNames[candidate.month - 1] || `Month ${candidate.month}`;

    return {
      isDuplicate: true,
      duplicateRecord: duplicate,
      message: `Duplicate record: A financial record for this Customer (${candidate.customerId}), Period ${monthStr} ${candidate.year}, Entity ${candidate.entity}, Segment "${candidate.segment}", and Project "${candidate.projectLocation}" already exists.`
    };
  }

  return { isDuplicate: false };
};

export type DocumentRelatedModule = 'Customer' | 'Contract' | 'Operational Profile' | 'PICA';

export interface ConsolidatedDocument {
  id: string;
  documentName: string;
  documentType: string;
  relatedModule: DocumentRelatedModule;
  documentNumber: string;
  effectiveDate: string;
  expiryDate?: string;
  uploadedBy: string;
  uploadedDate: string;
  fileName: string;
  fileSize?: string;
  sourceEntityId?: string;
  sourceModuleTab?: 'overview' | 'contracts' | 'operations' | 'pica';
  status?: string;
  notes?: string;
}

