import React, { useMemo } from 'react';
import { Customer, Contract, Pica, FollowUp, Opportunity } from '../../../types';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  FileText,
  Briefcase,
  Calendar,
  DollarSign,
  Info,
  ShieldAlert,
  ListTodo,
  User,
  ChevronRight
} from 'lucide-react';

interface AccountAttentionSectionProps {
  customer: Customer;
  contracts: Contract[];
  picas: Pica[];
  followUps: FollowUp[];
  opportunities: Opportunity[];
  directMarginYTD: number | null;
  targetDirectMarginYTD: number | null;
  latestAR: number | null;
  latestUnbill: number | null;
  formatFullFinancial: (val?: number | null) => string;
  formatCompactFinancial: (val?: number | null) => string;
  onOpenContract: (contractId: string) => void;
  onOpenOpportunity: (oppId: string) => void;
  onOpenPica: (picaId: string) => void;
  onNavigateTab: (tab: 'overview' | 'contacts' | 'contracts' | 'operations' | 'financial' | 'activity' | 'pipeline' | 'pica' | 'documents') => void;
}

type AttentionPriority = 'High Attention' | 'Medium Attention' | 'Normal';

interface NextActionItem {
  id: string;
  sourceModule: 'Follow-up' | 'Opportunity' | 'Contract' | 'PICA';
  title: string;
  dueDate: string;
  picName: string;
  badgeLabel: string;
  isOverdue: boolean;
  priorityWeight: number; // for secondary tie-break
  onClick: () => void;
}

export const AccountAttentionSection: React.FC<AccountAttentionSectionProps> = ({
  customer,
  contracts,
  picas,
  followUps,
  opportunities,
  directMarginYTD,
  targetDirectMarginYTD,
  latestAR,
  latestUnbill,
  formatFullFinancial,
  formatCompactFinancial,
  onOpenContract,
  onOpenOpportunity,
  onOpenPica,
  onNavigateTab
}) => {
  const todayStr = '2026-11-05';

  // --------------------------------------------------------------------------
  // 1. RULE-BASED INDICATORS CALCULATION
  // --------------------------------------------------------------------------

  // A. Contract Indicator: Active | Expiring Soon | Expired
  const customerContracts = useMemo(() => {
    return contracts.filter(c => c.customerId === customer.id);
  }, [contracts, customer.id]);

  const expiredContracts = useMemo(() => {
    return customerContracts.filter(c =>
      c.contractStatus === 'Expired' ||
      (c.expiryDate < todayStr && c.contractStatus !== 'Terminated' && c.contractStatus !== 'Draft')
    );
  }, [customerContracts, todayStr]);

  const expiringContracts = useMemo(() => {
    return customerContracts.filter(c => {
      if (expiredContracts.some(exp => exp.id === c.id)) return false;
      if (c.contractStatus === 'Expiring Soon') return true;
      if (c.contractStatus === 'Active' && c.expiryDate >= todayStr) {
        const diffTime = new Date(c.expiryDate).getTime() - new Date(todayStr).getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 90;
      }
      return false;
    });
  }, [customerContracts, expiredContracts, todayStr]);

  const activeContracts = useMemo(() => {
    return customerContracts.filter(c =>
      c.contractStatus === 'Active' &&
      !expiredContracts.some(exp => exp.id === c.id) &&
      !expiringContracts.some(soon => soon.id === c.id)
    );
  }, [customerContracts, expiredContracts, expiringContracts]);

  const contractIndicator: 'Active' | 'Expiring Soon' | 'Expired' = useMemo(() => {
    if (expiredContracts.length > 0) return 'Expired';
    if (expiringContracts.length > 0) return 'Expiring Soon';
    return 'Active';
  }, [expiredContracts.length, expiringContracts.length]);

  // B. Direct Margin Indicator: On Target | Below Target
  const hasMarginComparison = directMarginYTD !== null && targetDirectMarginYTD !== null;
  const directMarginIndicator: 'On Target' | 'Below Target' | 'Informational' = useMemo(() => {
    if (!hasMarginComparison) return 'Informational';
    if (directMarginYTD < targetDirectMarginYTD) return 'Below Target';
    return 'On Target';
  }, [hasMarginComparison, directMarginYTD, targetDirectMarginYTD]);

  // C. PICA Indicator: Controlled | Overdue
  const customerPicas = useMemo(() => {
    return picas.filter(p => p.customerId === customer.id);
  }, [picas, customer.id]);

  const openPicas = useMemo(() => {
    return customerPicas.filter(p => p.status !== 'Closed');
  }, [customerPicas]);

  const overduePicas = useMemo(() => {
    return openPicas.filter(p => p.dueDate < todayStr);
  }, [openPicas, todayStr]);

  const criticalOverduePicas = useMemo(() => {
    return overduePicas.filter(p => p.priority === 'Critical');
  }, [overduePicas]);

  const picaIndicator: 'Controlled' | 'Overdue' = useMemo(() => {
    if (overduePicas.length > 0) return 'Overdue';
    return 'Controlled';
  }, [overduePicas.length]);

  // D. Follow-up Indicator: On Track | Overdue
  const customerFollowUps = useMemo(() => {
    return followUps.filter(f => f.customerId === customer.id && f.status !== 'Completed' && f.status !== 'Cancelled');
  }, [followUps, customer.id]);

  const overdueFollowUps = useMemo(() => {
    return customerFollowUps.filter(f => f.dueDate < todayStr || f.status === 'Overdue');
  }, [customerFollowUps, todayStr]);

  const followUpIndicator: 'On Track' | 'Overdue' = useMemo(() => {
    if (overdueFollowUps.length > 0) return 'Overdue';
    return 'On Track';
  }, [overdueFollowUps.length]);

  // --------------------------------------------------------------------------
  // 2. PRIORITY DETERMINATION (High Attention | Medium Attention | Normal)
  // Strictly rule-based, no scoring, no AI.
  // --------------------------------------------------------------------------
  const { priority, priorityReasons }: { priority: AttentionPriority; priorityReasons: string[] } = useMemo(() => {
    const reasons: string[] = [];

    // High Attention checks
    const hasExpiredContract = expiredContracts.length > 0;
    const hasCriticalOverduePica = criticalOverduePicas.length > 0;

    if (hasExpiredContract) {
      reasons.push(`${expiredContracts.length} Expired Contract(s) past validity`);
    }
    if (hasCriticalOverduePica) {
      reasons.push(`${criticalOverduePicas.length} Critical PICA(s) overdue resolution`);
    }

    if (hasExpiredContract || hasCriticalOverduePica) {
      return { priority: 'High Attention', priorityReasons: reasons };
    }

    // Medium Attention checks
    const hasExpiringContract = expiringContracts.length > 0;
    const isMarginBelowTarget = directMarginIndicator === 'Below Target';
    const hasOverdueFollowUp = overdueFollowUps.length > 0;
    const hasNonCriticalOverduePica = overduePicas.length > 0;

    if (hasExpiringContract) {
      reasons.push(`${expiringContracts.length} Contract(s) expiring within 90 days`);
    }
    if (isMarginBelowTarget) {
      reasons.push('Direct Margin realization is below commercial budget target');
    }
    if (hasOverdueFollowUp) {
      reasons.push(`${overdueFollowUps.length} Commercial Follow-up(s) overdue`);
    }
    if (hasNonCriticalOverduePica) {
      reasons.push(`${overduePicas.length} PICA corrective case(s) past due date`);
    }

    if (hasExpiringContract || isMarginBelowTarget || hasOverdueFollowUp || hasNonCriticalOverduePica) {
      return { priority: 'Medium Attention', priorityReasons: reasons };
    }

    // Normal
    reasons.push('All contracts active, margin on track, follow-ups current, and PICAs controlled');
    return { priority: 'Normal', priorityReasons: reasons };
  }, [
    expiredContracts.length,
    criticalOverduePicas.length,
    expiringContracts.length,
    directMarginIndicator,
    overdueFollowUps.length,
    overduePicas.length
  ]);

  // --------------------------------------------------------------------------
  // 3. COMBINED NEXT ACTIONS (Follow-up, Opportunity, Contract, PICA)
  // Sorted by due date, displaying only the most relevant upcoming actions.
  // --------------------------------------------------------------------------
  const upcomingActions: NextActionItem[] = useMemo(() => {
    const actions: NextActionItem[] = [];

    // 1. Follow-up items
    customerFollowUps.forEach(f => {
      const isOverdue = f.dueDate < todayStr || f.status === 'Overdue';
      actions.push({
        id: `act-fu-${f.id}`,
        sourceModule: 'Follow-up',
        title: f.actionText || 'Commercial Follow-up action required',
        dueDate: f.dueDate,
        picName: f.assignedToName || f.ownerName || customer.ownerName,
        badgeLabel: isOverdue ? 'Overdue Follow-up' : 'Scheduled Follow-up',
        isOverdue,
        priorityWeight: isOverdue ? 1 : 4,
        onClick: () => onNavigateTab('activity')
      });
    });

    // 2. Opportunity items (Open deals requiring next step / closing)
    const openOpps = opportunities.filter(o =>
      o.customerId === customer.id &&
      o.stage !== 'Award' &&
      o.stage !== 'Lost'
    );

    openOpps.forEach(o => {
      const oppDueDate = o.nextFollowUpDate || o.targetClosingDate || todayStr;
      const isOverdue = oppDueDate < todayStr;
      const title = o.nextAction
        ? `${o.opportunityName}: ${o.nextAction}`
        : `Advance Deal: ${o.opportunityName} (${o.stage})`;

      actions.push({
        id: `act-opp-${o.id}`,
        sourceModule: 'Opportunity',
        title,
        dueDate: oppDueDate,
        picName: o.ownerName,
        badgeLabel: `Pipeline: ${o.stage}`,
        isOverdue,
        priorityWeight: isOverdue ? 2 : 5,
        onClick: () => onOpenOpportunity(o.id)
      });
    });

    // 3. Contract items (Expired or Expiring soon)
    expiredContracts.forEach(c => {
      actions.push({
        id: `act-cont-exp-${c.id}`,
        sourceModule: 'Contract',
        title: `Renew or Terminate: ${c.contractTitle} (Doc: ${c.documentNumber})`,
        dueDate: c.expiryDate,
        picName: c.contractPic || customer.ownerName,
        badgeLabel: 'Contract Expired',
        isOverdue: true,
        priorityWeight: 0, // Highest urgency
        onClick: () => onOpenContract(c.id)
      });
    });

    expiringContracts.forEach(c => {
      actions.push({
        id: `act-cont-soon-${c.id}`,
        sourceModule: 'Contract',
        title: `Prepare Renewal & Commercial Terms: ${c.contractTitle}`,
        dueDate: c.expiryDate,
        picName: c.contractPic || customer.ownerName,
        badgeLabel: 'Renewal Due (Within 90d)',
        isOverdue: false,
        priorityWeight: 3,
        onClick: () => onOpenContract(c.id)
      });
    });

    // 4. PICA items (Open investigation / verification)
    openPicas.forEach(p => {
      const isOverdue = p.dueDate < todayStr;
      actions.push({
        id: `act-pica-${p.id}`,
        sourceModule: 'PICA',
        title: `Corrective Action: ${p.issueTitle} (${p.picaNumber})`,
        dueDate: p.dueDate,
        picName: p.picName,
        badgeLabel: isOverdue ? `PICA Overdue (${p.priority})` : `PICA: ${p.status}`,
        isOverdue,
        priorityWeight: p.priority === 'Critical' ? (isOverdue ? 0 : 2) : (isOverdue ? 2 : 6),
        onClick: () => onOpenPica(p.id)
      });
    });

    // Sort by:
    // 1. Due date ascending (earliest / most overdue first)
    // 2. Priority weight (tie-break)
    return actions.sort((a, b) => {
      if (a.dueDate !== b.dueDate) {
        return a.dueDate.localeCompare(b.dueDate);
      }
      return a.priorityWeight - b.priorityWeight;
    });
  }, [
    customerFollowUps,
    opportunities,
    customer.id,
    customer.ownerName,
    expiredContracts,
    expiringContracts,
    openPicas,
    todayStr,
    onNavigateTab,
    onOpenOpportunity,
    onOpenContract,
    onOpenPica
  ]);

  // Display top 5 most relevant upcoming actions
  const topActions = upcomingActions.slice(0, 5);

  // Styling helpers
  const getPriorityStyle = (p: AttentionPriority) => {
    switch (p) {
      case 'High Attention':
        return {
          wrapper: 'bg-rose-50/80 border-rose-200 text-rose-900',
          badge: 'bg-rose-600 text-white',
          dot: 'bg-rose-500 animate-pulse',
          icon: <ShieldAlert className="w-4 h-4 text-rose-600" />
        };
      case 'Medium Attention':
        return {
          wrapper: 'bg-amber-50/80 border-amber-200 text-amber-900',
          badge: 'bg-amber-500 text-white',
          dot: 'bg-amber-500',
          icon: <AlertTriangle className="w-4 h-4 text-amber-600" />
        };
      case 'Normal':
      default:
        return {
          wrapper: 'bg-emerald-50/70 border-emerald-200 text-emerald-900',
          badge: 'bg-emerald-600 text-white',
          dot: 'bg-emerald-500',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        };
    }
  };

  const priorityStyle = getPriorityStyle(priority);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
      {/* -------------------------------------------------------------------- */}
      {/* SECTION HEADER & OVERALL PRIORITY BADGE */}
      {/* -------------------------------------------------------------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-4 h-4 text-[#0070C0]" />
          <div>
            <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
              Account Attention
            </h3>
            <span className="text-[10px] font-medium text-slate-400">
              Rule-based commercial monitoring & triggers
            </span>
          </div>
        </div>

        {/* Priority Badge */}
        <div className="flex items-center gap-2">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-xs font-bold ${priorityStyle.wrapper}`}>
            {priorityStyle.icon}
            <span>{priority}</span>
          </div>
        </div>
      </div>

      {/* Priority Reasons Summary Bar (if High or Medium) */}
      {priority !== 'Normal' && (
        <div className={`p-3 rounded-lg border text-xs space-y-1 ${priorityStyle.wrapper}`}>
          <div className="font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
            <span>Attention Triggers Detected:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-[11px]">
            {priorityReasons.map((reason, idx) => (
              <li key={idx} className="font-medium">{reason}</li>
            ))}
          </ul>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 1. INDICATORS GRID */}
      {/* Contract | Direct Margin | PICA | Follow-up | AR | Unbill */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Indicator 1: Contract (Active | Expiring Soon | Expired) */}
        <div
          onClick={() => onNavigateTab('contracts')}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            contractIndicator === 'Expired'
              ? 'bg-rose-50/70 border-rose-300 text-rose-900 shadow-2xs hover:bg-rose-100/70'
              : contractIndicator === 'Expiring Soon'
              ? 'bg-amber-50/70 border-amber-300 text-amber-900 shadow-2xs hover:bg-amber-100/70'
              : 'bg-emerald-50/50 border-emerald-200 text-emerald-900 hover:bg-emerald-100/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Contract
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                contractIndicator === 'Expired'
                  ? 'bg-rose-500'
                  : contractIndicator === 'Expiring Soon'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
            />
          </div>
          <div className="text-xs font-bold mt-1.5 truncate">
            {contractIndicator}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 truncate">
            {contractIndicator === 'Expired'
              ? `${expiredContracts.length} Expired`
              : contractIndicator === 'Expiring Soon'
              ? `${expiringContracts.length} Soon (90d)`
              : `${activeContracts.length} In-Force`}
          </div>
        </div>

        {/* Indicator 2: Direct Margin (On Target | Below Target) */}
        <div
          onClick={() => onNavigateTab('financial')}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            directMarginIndicator === 'Below Target'
              ? 'bg-amber-50/70 border-amber-300 text-amber-900 shadow-2xs hover:bg-amber-100/70'
              : directMarginIndicator === 'On Target'
              ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900 hover:bg-emerald-100/50'
              : 'bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-slate-100/80'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Direct Margin
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                directMarginIndicator === 'Below Target'
                  ? 'bg-amber-500'
                  : directMarginIndicator === 'On Target'
                  ? 'bg-emerald-500'
                  : 'bg-slate-400'
              }`}
            />
          </div>
          <div className="text-xs font-bold mt-1.5 truncate">
            {directMarginIndicator}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 truncate font-mono">
            {directMarginYTD !== null ? formatCompactFinancial(directMarginYTD) : '—'}
          </div>
        </div>

        {/* Indicator 3: PICA (Controlled | Overdue) */}
        <div
          onClick={() => onNavigateTab('pica')}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            picaIndicator === 'Overdue'
              ? 'bg-rose-50/70 border-rose-300 text-rose-900 shadow-2xs hover:bg-rose-100/70'
              : 'bg-emerald-50/50 border-emerald-200 text-emerald-900 hover:bg-emerald-100/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              PICA
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                picaIndicator === 'Overdue' ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
            />
          </div>
          <div className="text-xs font-bold mt-1.5 truncate">
            {picaIndicator}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 truncate">
            {overduePicas.length > 0 ? `${overduePicas.length} Overdue` : `${openPicas.length} Active`}
          </div>
        </div>

        {/* Indicator 4: Follow-up (On Track | Overdue) */}
        <div
          onClick={() => onNavigateTab('activity')}
          className={`p-3 rounded-xl border cursor-pointer transition-all ${
            followUpIndicator === 'Overdue'
              ? 'bg-amber-50/70 border-amber-300 text-amber-900 shadow-2xs hover:bg-amber-100/70'
              : 'bg-emerald-50/50 border-emerald-200 text-emerald-900 hover:bg-emerald-100/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Follow-up
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                followUpIndicator === 'Overdue' ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            />
          </div>
          <div className="text-xs font-bold mt-1.5 truncate">
            {followUpIndicator}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 truncate">
            {overdueFollowUps.length > 0 ? `${overdueFollowUps.length} Overdue` : `${customerFollowUps.length} Pending`}
          </div>
        </div>

        {/* Indicator 5: AR (Informational only unless threshold exists) */}
        <div
          onClick={() => onNavigateTab('financial')}
          className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 hover:bg-slate-100/60 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              AR (Info)
            </span>
            <span className="text-[9px] font-semibold text-slate-500 bg-slate-200/80 px-1 py-0.2 rounded">
              Info
            </span>
          </div>
          <div className="text-xs font-bold mt-1.5 truncate font-mono" title={formatFullFinancial(latestAR)}>
            {formatCompactFinancial(latestAR)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
            Monitored
          </div>
        </div>

        {/* Indicator 6: Unbill (Informational only unless threshold exists) */}
        <div
          onClick={() => onNavigateTab('financial')}
          className="p-3 rounded-xl border border-slate-200 bg-slate-50/60 text-slate-800 hover:bg-slate-100/60 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Unbill (Info)
            </span>
            <span className="text-[9px] font-semibold text-slate-500 bg-slate-200/80 px-1 py-0.2 rounded">
              Info
            </span>
          </div>
          <div className="text-xs font-bold mt-1.5 truncate font-mono" title={formatFullFinancial(latestUnbill)}>
            {formatCompactFinancial(latestUnbill)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
            Monitored
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 2. NEXT ACTION SECTION */}
      {/* Combine actions from: Follow-up, Opportunity, Contract, PICA */}
      {/* Sorted by due date, displaying only the most relevant upcoming actions. */}
      {/* -------------------------------------------------------------------- */}
      <div className="pt-2 border-t border-slate-100 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-[#0070C0]" />
            <h4 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
              Next Actions
            </h4>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {upcomingActions.length} Pending
            </span>
          </div>

          <span className="text-[11px] text-slate-400">
            Sorted by earliest due date
          </span>
        </div>

        {/* Actions List */}
        {topActions.length === 0 ? (
          <div className="p-6 bg-slate-50/60 border border-slate-200/80 rounded-xl text-center space-y-1.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">No Pending Actions</p>
            <p className="text-[11px] text-slate-400">
              All commercial follow-ups, contracts, pipeline deals, and PICAs are currently up to date.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {topActions.map(action => {
              // Badge color depending on module
              let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
              if (action.sourceModule === 'Contract') {
                badgeColor = action.isOverdue
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200';
              } else if (action.sourceModule === 'PICA') {
                badgeColor = action.isOverdue
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200';
              } else if (action.sourceModule === 'Follow-up') {
                badgeColor = action.isOverdue
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-indigo-50 text-indigo-700 border-indigo-200';
              } else if (action.sourceModule === 'Opportunity') {
                badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
              }

              return (
                <div
                  key={action.id}
                  onClick={action.onClick}
                  className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all hover:shadow-2xs ${
                    action.isOverdue
                      ? 'bg-rose-50/30 border-rose-200/80 hover:bg-rose-50/60'
                      : 'bg-white border-slate-200/80 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${badgeColor}`}>
                        {action.sourceModule}
                      </span>
                      <span className="font-semibold text-xs text-[#172B4D] hover:text-[#0070C0] transition-colors">
                        {action.title}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>PIC: <strong className="text-slate-700">{action.picName}</strong></span>
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Due: <strong className={action.isOverdue ? 'text-rose-600' : 'text-slate-700'}>{action.dueDate}</strong></span>
                      </span>
                      {action.isOverdue && (
                        <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded border border-rose-200">
                          Overdue
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0070C0] group shrink-0">
                    <span>Act</span>
                    <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </div>
              );
            })}

            {upcomingActions.length > 5 && (
              <div className="text-center pt-1">
                <span className="text-[11px] text-slate-400 font-medium">
                  Showing 5 of {upcomingActions.length} prioritized commercial actions
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
