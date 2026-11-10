import React, { useState, useMemo } from 'react';
import { Customer, CustomerFinancialMonthly, EntityId, UserRole } from '../../../types';
import { useApp } from '../../../context/AppContext';
import { AddFinancialModal } from './AddFinancialModal';
import { FinancialHistoryModal } from './FinancialHistoryModal';
import { FinancialPermissionModal } from './FinancialPermissionModal';
import { EntityBadge } from '../../common/EntityBadge';
import { Select } from '../../ui/Select';
import {
  DollarSign,
  Plus,
  Filter,
  Calendar,
  History,
  Edit2,
  Lock,
  ShieldCheck,
  RotateCcw,
  TrendingUp,
  BarChart2,
  AlertCircle,
  FileSpreadsheet,
  CheckCircle2,
  HelpCircle,
  Layers
} from 'lucide-react';

interface CustomerFinancialTabProps {
  customer: Customer;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Enterprise Financial Formatter
 * Strictly ensures:
 * - Proper financial formatting (IDR currency)
 * - NEVER displays #DIV/0!, NaN, Infinity, or undefined
 * - Displays "—" when data is unavailable
 */
const formatFinancialValue = (val?: number | null | undefined): string => {
  if (val === undefined || val === null || isNaN(val) || !isFinite(val)) {
    return '—';
  }
  if (typeof val !== 'number') {
    return '—';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(val).replace('Rp', 'IDR ');
};

/**
 * Compact currency formatter for KPI cards and chart axes
 */
const formatCompactIDR = (val?: number | null | undefined): string => {
  if (val === undefined || val === null || isNaN(val) || !isFinite(val)) {
    return '—';
  }
  if (typeof val !== 'number') {
    return '—';
  }
  const abs = Math.abs(val);
  if (abs >= 1_000_000_000) {
    return `IDR ${(val / 1_000_000_000).toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}B`;
  }
  if (abs >= 1_000_000) {
    return `IDR ${(val / 1_000_000).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 1 })}M`;
  }
  return `IDR ${val.toLocaleString('id-ID')}`;
};

export const CustomerFinancialTab: React.FC<CustomerFinancialTabProps> = ({ customer }) => {
  const {
    financialRecords,
    currentUser,
    canViewFinancial,
    canEditFinancial,
    operationalProfiles
  } = useApp();

  // Permission Checks
  const hasViewAccess = canViewFinancial(customer);
  const hasEditAccess = canEditFinancial(customer);
  const isSuperAdmin = currentUser.role === 'Super Admin';

  // Customer Financial Records
  const allCustomerFinancials = useMemo(() => {
    return financialRecords.filter(r => r.customerId === customer.id);
  }, [financialRecords, customer.id]);

  // Dynamic filter options based on customer data
  const availableYears = useMemo(() => {
    const years = allCustomerFinancials.map(r => r.year);
    years.push(2026); // Ensure current year is present
    return Array.from(new Set(years)).sort((a, b) => b - a);
  }, [allCustomerFinancials]);

  const availableSegments = useMemo(() => {
    const list = allCustomerFinancials.map(r => r.segment.trim()).filter(Boolean);
    if (customer.businessSegment) list.push(customer.businessSegment.trim());
    return Array.from(new Set(list));
  }, [allCustomerFinancials, customer.businessSegment]);

  const availableProjects = useMemo(() => {
    const fromFinancials = allCustomerFinancials.map(r => r.projectLocation.trim()).filter(Boolean);
    const fromOps = operationalProfiles
      .filter(p => p.customerId === customer.id)
      .map(p => p.projectLocation.trim())
      .filter(Boolean);
    return Array.from(new Set([...fromFinancials, ...fromOps]));
  }, [allCustomerFinancials, operationalProfiles, customer.id]);

  // Filters State (Defaults: Current Year, All Segment, All Entity)
  const currentYear = 2026;
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedSegment, setSelectedSegment] = useState<string>('ALL');
  const [selectedEntity, setSelectedEntity] = useState<string>('ALL');
  const [selectedProject, setSelectedProject] = useState<string>('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [recordToEdit, setRecordToEdit] = useState<CustomerFinancialMonthly | null>(null);
  const [recordForHistory, setRecordForHistory] = useState<CustomerFinancialMonthly | null>(null);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [prefilledMonth, setPrefilledMonth] = useState<number | undefined>(undefined);

  // Active chart hover month state
  const [hoveredRevMonth, setHoveredRevMonth] = useState<number | null>(null);
  const [hoveredDmMonth, setHoveredDmMonth] = useState<number | null>(null);

  // Filtered Records for Selected Period & Scope
  const filteredRecords = useMemo(() => {
    return allCustomerFinancials.filter(r => {
      if (r.year !== selectedYear) return false;
      if (selectedEntity !== 'ALL' && r.entity !== selectedEntity) return false;
      if (selectedSegment !== 'ALL' && r.segment.toLowerCase() !== selectedSegment.toLowerCase()) return false;
      if (selectedProject !== 'ALL' && r.projectLocation.toLowerCase() !== selectedProject.toLowerCase()) return false;
      return true;
    });
  }, [allCustomerFinancials, selectedYear, selectedEntity, selectedSegment, selectedProject]);

  const hasFilteredData = filteredRecords.length > 0;

  // --------------------------------------------------------------------------
  // KPI CALCULATIONS (YTD Rules Compliant)
  // - Revenue YTD: Sum of recorded monthly revenue in the selected year/filters
  // - Direct Margin YTD: Sum of recorded nominal direct margin. Do not sum percentages!
  // - Target DM: Sum of recorded nominal target direct margin in the selected year/filters
  // - AR: Balance sheet snapshot from the latest recorded month
  // - Unbill: Balance sheet snapshot from the latest recorded month
  // - No division, no invented formulas, never outputs NaN/Infinity
  // --------------------------------------------------------------------------
  const { kpiRevenueYTD, kpiDirectMarginYTD, kpiTargetDM, kpiAR, kpiUnbill, latestMonthRecorded } = useMemo(() => {
    if (filteredRecords.length === 0) {
      return {
        kpiRevenueYTD: null,
        kpiDirectMarginYTD: null,
        kpiTargetDM: null,
        kpiAR: null,
        kpiUnbill: null,
        latestMonthRecorded: null
      };
    }

    const revSum = filteredRecords.reduce((sum, r) => sum + (typeof r.revenue === 'number' && isFinite(r.revenue) ? r.revenue : 0), 0);
    const dmSum = filteredRecords.reduce((sum, r) => sum + (typeof r.directMargin === 'number' && isFinite(r.directMargin) ? r.directMargin : 0), 0);
    const targetDmSum = filteredRecords.reduce((sum, r) => sum + (typeof r.targetDirectMargin === 'number' && isFinite(r.targetDirectMargin) ? r.targetDirectMargin : 0), 0);

    // Latest recorded reporting month
    const latestMonth = filteredRecords.reduce((max, r) => Math.max(max, r.month), 0);
    const latestMonthRecords = filteredRecords.filter(r => r.month === latestMonth);

    const arSum = latestMonthRecords.reduce((sum, r) => sum + (typeof r.ar === 'number' && isFinite(r.ar) ? r.ar : 0), 0);
    const unbillSum = latestMonthRecords.reduce((sum, r) => sum + (typeof r.unbill === 'number' && isFinite(r.unbill) ? r.unbill : 0), 0);

    return {
      kpiRevenueYTD: revSum,
      kpiDirectMarginYTD: dmSum,
      kpiTargetDM: targetDmSum,
      kpiAR: arSum,
      kpiUnbill: unbillSum,
      latestMonthRecorded: latestMonth
    };
  }, [filteredRecords]);

  // --------------------------------------------------------------------------
  // MONTHLY AGGREGATIONS FOR 12 CALENDAR MONTHS (CHART 1 & CHART 2)
  // --------------------------------------------------------------------------
  const monthlyChartData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const monthNum = i + 1;
      const recordsForMonth = filteredRecords.filter(r => r.month === monthNum);
      const hasData = recordsForMonth.length > 0;

      const revenue = recordsForMonth.reduce((s, r) => s + (typeof r.revenue === 'number' && isFinite(r.revenue) ? r.revenue : 0), 0);
      const directMargin = recordsForMonth.reduce((s, r) => s + (typeof r.directMargin === 'number' && isFinite(r.directMargin) ? r.directMargin : 0), 0);
      const targetDirectMargin = recordsForMonth.reduce((s, r) => s + (typeof r.targetDirectMargin === 'number' && isFinite(r.targetDirectMargin) ? r.targetDirectMargin : 0), 0);

      return {
        month: monthNum,
        name: MONTH_SHORT[i],
        fullName: MONTH_NAMES[i],
        hasData,
        revenue: hasData ? revenue : null,
        directMargin: hasData ? directMargin : null,
        targetDirectMargin: hasData ? targetDirectMargin : null,
        recordsCount: recordsForMonth.length
      };
    });
  }, [filteredRecords]);

  // Max value calculations for SVG bar chart scaling
  const maxRevenue = useMemo(() => {
    const revs = monthlyChartData.filter(d => d.hasData && d.revenue !== null).map(d => d.revenue as number);
    if (revs.length === 0) return 1_000_000_000;
    return Math.max(...revs) * 1.15; // 15% headroom
  }, [monthlyChartData]);

  const maxMargin = useMemo(() => {
    const vals: number[] = [];
    monthlyChartData.forEach(d => {
      if (d.hasData) {
        if (d.directMargin !== null) vals.push(d.directMargin);
        if (d.targetDirectMargin !== null) vals.push(d.targetDirectMargin);
      }
    });
    if (vals.length === 0) return 500_000_000;
    return Math.max(...vals) * 1.15; // 15% headroom
  }, [monthlyChartData]);

  // 12-Month Table Schedule Construction
  // For each calendar month (1 to 12), get matching records or mark unavailable
  const monthlyScheduleRows = useMemo(() => {
    const rows: {
      monthNumber: number;
      monthName: string;
      record?: CustomerFinancialMonthly;
    }[] = [];

    for (let m = 1; m <= 12; m++) {
      const recordsForMonth = filteredRecords.filter(r => r.month === m);

      if (recordsForMonth.length === 0) {
        // Month with no recorded financial data
        rows.push({
          monthNumber: m,
          monthName: MONTH_NAMES[m - 1],
          record: undefined
        });
      } else {
        // Month has 1 or more matching records
        recordsForMonth.forEach(rec => {
          rows.push({
            monthNumber: m,
            monthName: MONTH_NAMES[m - 1],
            record: rec
          });
        });
      }
    }

    return rows;
  }, [filteredRecords]);

  // Active filters count for reset badge
  const isFiltered = selectedYear !== currentYear || selectedSegment !== 'ALL' || selectedEntity !== 'ALL' || selectedProject !== 'ALL';

  const resetFilters = () => {
    setSelectedYear(currentYear);
    setSelectedSegment('ALL');
    setSelectedEntity('ALL');
    setSelectedProject('ALL');
  };

  // If user does not have permission to view this customer's financial records
  if (!hasViewAccess) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-xl mx-auto my-6 space-y-4 shadow-sm">
        <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
          <Lock className="w-7 h-7" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-[#172B4D]">Commercial Financial Access Restricted</h3>
          <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
            Commercial financial performance records for <strong>{customer.name}</strong> are restricted to the assigned account owner (<span className="text-slate-700 font-semibold">{customer.ownerName}</span>), Department Leadership, and Administrators.
          </p>
        </div>
        <div className="pt-2 text-xs text-slate-400">
          Current Role: <span className="font-semibold text-slate-600">{currentUser.role}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-bold text-[#172B4D]">Commercial Financial Performance</h2>
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {allCustomerFinancials.length} Recorded Months
            </span>
            {!hasEditAccess && (
              <span className="text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Read-Only
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Commercial realization, monthly margins, accounts receivable, and unbilled tracking
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Super Admin Permission Settings Toggle */}
          {isSuperAdmin && (
            <button
              onClick={() => setIsPermissionModalOpen(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Configure which roles can edit monthly financial figures"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#0070C0]" />
              <span>Permission Config</span>
            </button>
          )}

          {/* + Add Monthly Financial Data Button */}
          {hasEditAccess ? (
            <button
              onClick={() => {
                setRecordToEdit(null);
                setPrefilledMonth(undefined);
                setIsAddModalOpen(true);
              }}
              className="px-3.5 py-1.5 bg-[#0070C0] hover:bg-[#005a9c] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Monthly Financial Data</span>
            </button>
          ) : (
            <div className="text-[11px] text-slate-400 italic bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              Editing restricted to authorized financial roles
            </div>
          )}
        </div>
      </div>

      {/* Filters Bar: Year, Segment, Entity, Project / Location */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-[#0070C0]" />
            <span>Filter Period & Operational Scope</span>
          </div>
          {isFiltered && (
            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-[#0070C0] hover:text-[#005a9c] flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Filter 1: Year (Default: Current Year) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Year
            </label>
            <Select
              value={String(selectedYear)}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              options={availableYears.map(y => ({
                value: String(y),
                label: y === currentYear ? `${y} (Current Year)` : String(y)
              }))}
            />
          </div>

          {/* Filter 2: Segment (Default: All Segment) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Segment
            </label>
            <Select
              value={selectedSegment}
              onChange={(e) => setSelectedSegment(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Segments' },
                ...availableSegments.map(s => ({ value: s, label: s }))
              ]}
            />
          </div>

          {/* Filter 3: Entity (Default: All Entity) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Entity
            </label>
            <Select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Entities' },
                { value: 'PETRA', label: 'PETRA' },
                { value: 'PDT', label: 'PDT' },
                { value: 'PLI', label: 'PLI' }
              ]}
            />
          </div>

          {/* Filter 4: Project / Location */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              Project / Location
            </label>
            <Select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Projects' },
                ...availableProjects.map(p => ({ value: p, label: p }))
              ]}
            />
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* 1. COMPACT FINANCIAL KPI CARDS ROW */}
      {/* Revenue YTD | Direct Margin YTD | Target DM | AR | Unbill */}
      {/* ---------------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* KPI 1: Revenue YTD */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Revenue YTD
            </span>
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
          <div className="text-base font-bold text-[#172B4D] tabular-nums mt-1.5 truncate" title={formatFinancialValue(kpiRevenueYTD)}>
            {formatCompactIDR(kpiRevenueYTD)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Realization ({selectedYear})</span>
            {kpiRevenueYTD !== null && (
              <span className="text-blue-700 font-semibold">{filteredRecords.length} Mos</span>
            )}
          </div>
        </div>

        {/* KPI 2: Direct Margin YTD */}
        <div className="bg-white border border-emerald-100 rounded-xl p-3.5 shadow-2xs bg-gradient-to-br from-white to-emerald-50/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
              Direct Margin YTD
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-base font-bold text-emerald-700 tabular-nums mt-1.5 truncate" title={formatFinancialValue(kpiDirectMarginYTD)}>
            {formatCompactIDR(kpiDirectMarginYTD)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Nominal Margin</span>
            <span className="text-emerald-700 font-semibold">Actual</span>
          </div>
        </div>

        {/* KPI 3: Target DM */}
        <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Target DM
            </span>
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
          </div>
          <div className="text-base font-bold text-slate-700 tabular-nums mt-1.5 truncate" title={formatFinancialValue(kpiTargetDM)}>
            {formatCompactIDR(kpiTargetDM)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Commercial Target</span>
            <span className="text-slate-600 font-medium">Budget</span>
          </div>
        </div>

        {/* KPI 4: AR */}
        <div className="bg-white border border-amber-100 rounded-xl p-3.5 shadow-2xs bg-gradient-to-br from-white to-amber-50/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">
              AR
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="text-base font-bold text-amber-700 tabular-nums mt-1.5 truncate" title={formatFinancialValue(kpiAR)}>
            {formatCompactIDR(kpiAR)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Accounts Receivable</span>
            {latestMonthRecorded ? (
              <span className="text-amber-700 font-medium">{MONTH_SHORT[latestMonthRecorded - 1]}</span>
            ) : (
              <span>—</span>
            )}
          </div>
        </div>

        {/* KPI 5: Unbill */}
        <div className="bg-white border border-blue-100 rounded-xl p-3.5 shadow-2xs bg-gradient-to-br from-white to-blue-50/20 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">
              Unbill
            </span>
            <span className="w-2 h-2 rounded-full bg-blue-500" />
          </div>
          <div className="text-base font-bold text-blue-700 tabular-nums mt-1.5 truncate" title={formatFinancialValue(kpiUnbill)}>
            {formatCompactIDR(kpiUnbill)}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Unbilled Revenue</span>
            {latestMonthRecorded ? (
              <span className="text-blue-700 font-medium">{MONTH_SHORT[latestMonthRecorded - 1]}</span>
            ) : (
              <span>—</span>
            )}
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* 2. EXACTLY TWO CHARTS (CHART 1 & CHART 2 ONLY) */}
      {/* CHART 1: Revenue Trend (Monthly Revenue) */}
      {/* CHART 2: Direct Margin vs Target (Direct Margin vs Target DM by month) */}
      {/* ---------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ==================================================================== */}
        {/* CHART 1: Revenue Trend */}
        {/* ==================================================================== */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[#0070C0]" />
                <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
                  Revenue Trend
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Monthly revenue realization for {selectedYear}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#0070C0]" />
                Revenue
              </span>
            </div>
          </div>

          {/* Chart Canvas or Clean Empty State */}
          {!hasFilteredData ? (
            <div className="h-56 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-lg p-6 text-center bg-slate-50/50">
              <FileSpreadsheet className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-600">No Revenue Data for {selectedYear}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                No monthly revenue entries match the active filters.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* SVG / Visual Bar Schedule for 12 months */}
              <div className="relative h-56 flex items-end gap-1.5 sm:gap-2 pt-6 px-1 border-b border-slate-200">
                {/* Horizontal guide lines */}
                <div className="absolute inset-x-0 top-6 border-b border-slate-100 text-[10px] text-slate-300 select-none">
                  <span className="absolute -top-3 left-0">{formatCompactIDR(maxRevenue)}</span>
                </div>
                <div className="absolute inset-x-0 top-1/2 border-b border-slate-100/70" />

                {monthlyChartData.map((d) => {
                  const val = d.revenue ?? 0;
                  const heightPercent = d.hasData && val > 0
                    ? Math.min(100, Math.max(12, Math.round((val / maxRevenue) * 100)))
                    : 0;
                  const isHovered = hoveredRevMonth === d.month;

                  return (
                    <div
                      key={`rev-${d.month}`}
                      onMouseEnter={() => setHoveredRevMonth(d.month)}
                      onMouseLeave={() => setHoveredRevMonth(null)}
                      className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
                    >
                      {/* Floating tooltip */}
                      {isHovered && (
                        <div className="absolute -top-12 z-20 bg-[#172B4D] text-white text-[11px] py-1 px-2 rounded shadow-lg whitespace-nowrap pointer-events-none transition-all">
                          <div className="font-semibold">{d.fullName} {selectedYear}</div>
                          <div className="text-blue-300 font-mono font-bold">
                            {d.hasData ? formatFinancialValue(d.revenue) : 'No data recorded'}
                          </div>
                        </div>
                      )}

                      {/* Bar */}
                      {d.hasData && val > 0 ? (
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full max-w-[28px] rounded-t-md transition-all duration-200 ${
                            isHovered
                              ? 'bg-[#005a9c] ring-2 ring-blue-300'
                              : 'bg-[#0070C0] hover:bg-[#005a9c]'
                          }`}
                        />
                      ) : (
                        <div className="w-full max-w-[28px] h-1.5 bg-slate-200/80 rounded-t-sm" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Month X-Axis Labels */}
              <div className="flex gap-1.5 sm:gap-2 px-1 text-center">
                {monthlyChartData.map(d => (
                  <div
                    key={`lbl-rev-${d.month}`}
                    className={`flex-1 text-[10px] font-semibold truncate ${
                      d.hasData ? 'text-slate-700' : 'text-slate-300'
                    } ${hoveredRevMonth === d.month ? 'text-[#0070C0]' : ''}`}
                  >
                    {d.name}
                  </div>
                ))}
              </div>

              {/* Chart Footnote Summary */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <span>Total Realized ({selectedYear}):</span>
                <span className="font-mono font-bold text-[#172B4D]">
                  {formatFinancialValue(kpiRevenueYTD)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* CHART 2: Direct Margin vs Target */}
        {/* ==================================================================== */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
                  Direct Margin vs Target
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Monthly Direct Margin compared against Target DM
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600" />
                Direct Margin
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
                Target DM
              </span>
            </div>
          </div>

          {/* Chart Canvas or Clean Empty State */}
          {!hasFilteredData ? (
            <div className="h-56 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-lg p-6 text-center bg-slate-50/50">
              <FileSpreadsheet className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-600">No Margin Data for {selectedYear}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                No Direct Margin or Target records match the active filters.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* SVG / Visual Dual-Bar Schedule for 12 months */}
              <div className="relative h-56 flex items-end gap-1 sm:gap-1.5 pt-6 px-1 border-b border-slate-200">
                {/* Horizontal guide lines */}
                <div className="absolute inset-x-0 top-6 border-b border-slate-100 text-[10px] text-slate-300 select-none">
                  <span className="absolute -top-3 left-0">{formatCompactIDR(maxMargin)}</span>
                </div>
                <div className="absolute inset-x-0 top-1/2 border-b border-slate-100/70" />

                {monthlyChartData.map((d) => {
                  const dmVal = d.directMargin ?? 0;
                  const targetVal = d.targetDirectMargin ?? 0;

                  const dmHeight = d.hasData && dmVal > 0
                    ? Math.min(100, Math.max(12, Math.round((dmVal / maxMargin) * 100)))
                    : 0;

                  const targetHeight = d.hasData && targetVal > 0
                    ? Math.min(100, Math.max(12, Math.round((targetVal / maxMargin) * 100)))
                    : 0;

                  const isHovered = hoveredDmMonth === d.month;

                  return (
                    <div
                      key={`dm-${d.month}`}
                      onMouseEnter={() => setHoveredDmMonth(d.month)}
                      onMouseLeave={() => setHoveredDmMonth(null)}
                      className="flex-1 flex flex-col items-center h-full justify-end relative group cursor-pointer"
                    >
                      {/* Floating tooltip */}
                      {isHovered && (
                        <div className="absolute -top-16 z-20 bg-[#172B4D] text-white text-[11px] py-1.5 px-2.5 rounded shadow-lg whitespace-nowrap pointer-events-none transition-all">
                          <div className="font-semibold">{d.fullName} {selectedYear}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-emerald-400 font-mono">
                              DM: {d.hasData ? formatFinancialValue(d.directMargin) : '—'}
                            </span>
                            <span className="text-indigo-300 font-mono">
                              Target: {d.hasData ? formatFinancialValue(d.targetDirectMargin) : '—'}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Dual bars grouped side-by-side */}
                      {d.hasData ? (
                        <div className="w-full flex items-end justify-center gap-0.5">
                          {/* Direct Margin Bar (Emerald) */}
                          <div
                            style={{ height: `${dmHeight}%` }}
                            className={`w-1/2 max-w-[14px] rounded-t-sm transition-all duration-200 ${
                              isHovered ? 'bg-emerald-700' : 'bg-emerald-600'
                            }`}
                          />
                          {/* Target DM Bar (Indigo) */}
                          <div
                            style={{ height: `${targetHeight}%` }}
                            className={`w-1/2 max-w-[14px] rounded-t-sm transition-all duration-200 ${
                              isHovered ? 'bg-indigo-700' : 'bg-indigo-500'
                            }`}
                          />
                        </div>
                      ) : (
                        <div className="w-full max-w-[20px] h-1.5 bg-slate-200/80 rounded-t-sm" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Month X-Axis Labels */}
              <div className="flex gap-1 sm:gap-1.5 px-1 text-center">
                {monthlyChartData.map(d => (
                  <div
                    key={`lbl-dm-${d.month}`}
                    className={`flex-1 text-[10px] font-semibold truncate ${
                      d.hasData ? 'text-slate-700' : 'text-slate-300'
                    } ${hoveredDmMonth === d.month ? 'text-emerald-700' : ''}`}
                  >
                    {d.name}
                  </div>
                ))}
              </div>

              {/* Chart Footnote Summary */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                <span>Margin Realized vs Target:</span>
                <div className="flex items-center gap-2 font-mono font-bold text-xs">
                  <span className="text-emerald-700">{formatFinancialValue(kpiDirectMarginYTD)}</span>
                  <span className="text-slate-300">/</span>
                  <span className="text-indigo-600">{formatFinancialValue(kpiTargetDM)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ---------------------------------------------------------------------- */}
      {/* 3. MONTHLY FINANCIAL REALIZATION TABLE */}
      {/* ---------------------------------------------------------------------- */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0070C0]" />
            <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
              Monthly Schedule & Realization Table ({selectedYear})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Commercial real-time financial tracking
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3.5 whitespace-nowrap">Month</th>
                <th className="py-3 px-3 whitespace-nowrap text-right">Revenue</th>
                <th className="py-3 px-3 whitespace-nowrap text-right">Trucking Contract</th>
                <th className="py-3 px-3 whitespace-nowrap text-right">Variable Cost</th>
                <th className="py-3 px-3 whitespace-nowrap text-right">Driver Cost</th>
                <th className="py-3 px-3 whitespace-nowrap text-right">Shipment Cost</th>
                <th className="py-3 px-3 whitespace-nowrap text-right text-emerald-800">Direct Margin</th>
                <th className="py-3 px-3 whitespace-nowrap text-right">Target DM</th>
                <th className="py-3 px-3 whitespace-nowrap text-right text-amber-800">AR</th>
                <th className="py-3 px-3 whitespace-nowrap text-right text-blue-800">Unbill</th>
                <th className="py-3 px-3.5 whitespace-nowrap text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthlyScheduleRows.map((row, idx) => {
                const rec = row.record;
                const hasData = Boolean(rec);

                return (
                  <tr
                    key={rec ? rec.id : `empty-month-${row.monthNumber}`}
                    className={`hover:bg-slate-50/60 transition-colors ${!hasData ? 'opacity-80' : ''}`}
                  >
                    {/* Month Column */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">
                          {row.monthName} {selectedYear}
                        </span>
                        {rec && (
                          <EntityBadge entity={rec.entity} size="sm" />
                        )}
                      </div>
                      {rec && (
                        <div className="text-[10px] text-slate-400 truncate max-w-[170px]" title={`${rec.segment} · ${rec.projectLocation}`}>
                          {rec.projectLocation}
                        </div>
                      )}
                    </td>

                    {/* Revenue */}
                    <td className="py-3 px-3 whitespace-nowrap text-right font-mono tabular-nums text-slate-800 font-medium">
                      {formatFinancialValue(rec?.revenue)}
                    </td>

                    {/* Trucking Contract */}
                    <td className="py-3 px-3 whitespace-nowrap text-right font-mono tabular-nums text-slate-600">
                      {formatFinancialValue(rec?.truckingContract)}
                    </td>

                    {/* Variable Cost */}
                    <td className="py-3 px-3 whitespace-nowrap text-right font-mono tabular-nums text-slate-600">
                      {formatFinancialValue(rec?.variableCost)}
                    </td>

                    {/* Driver Cost */}
                    <td className="py-3 px-3 whitespace-nowrap text-right font-mono tabular-nums text-slate-600">
                      {formatFinancialValue(rec?.driverCost)}
                    </td>

                    {/* Shipment Cost */}
                    <td className="py-3 px-3 whitespace-nowrap text-right font-mono tabular-nums text-slate-600">
                      {formatFinancialValue(rec?.shipmentCost)}
                    </td>

                    {/* Direct Margin */}
                    <td className="py-3 px-3 whitespace-nowrap text-right font-mono tabular-nums font-bold text-emerald-700 bg-emerald-50/30">
                      {formatFinancialValue(rec?.directMargin)}
                    </td>

                    {/* Target DM */}
                    <td className="py-3 px-3 whitespace-nowrap text-right font-mono tabular-nums text-slate-600">
                      {formatFinancialValue(rec?.targetDirectMargin)}
                    </td>

                    {/* AR */}
                    <td className="py-3 px-3 whitespace-nowrap text-right font-mono tabular-nums font-semibold text-amber-700">
                      {formatFinancialValue(rec?.ar)}
                    </td>

                    {/* Unbill */}
                    <td className="py-3 px-3 whitespace-nowrap text-right font-mono tabular-nums font-semibold text-blue-700">
                      {formatFinancialValue(rec?.unbill)}
                    </td>

                    {/* Actions Column */}
                    <td className="py-3 px-3.5 whitespace-nowrap text-center">
                      {rec ? (
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Edit button (if authorized) */}
                          {hasEditAccess && (
                            <button
                              onClick={() => {
                                setRecordToEdit(rec);
                                setIsAddModalOpen(true);
                              }}
                              className="p-1.5 text-slate-500 hover:text-[#0070C0] hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                              title="Edit Monthly Financial Data"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* View History button */}
                          <button
                            onClick={() => setRecordForHistory(rec)}
                            className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title="View Record Audit History"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        hasEditAccess ? (
                          <button
                            onClick={() => {
                              setRecordToEdit(null);
                              setPrefilledMonth(row.monthNumber);
                              setIsAddModalOpen(true);
                            }}
                            className="text-[11px] font-semibold text-[#0070C0] hover:underline cursor-pointer"
                          >
                            + Enter
                          </button>
                        ) : (
                          <span className="text-slate-300 text-[11px]">—</span>
                        )
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {isAddModalOpen && (
        <AddFinancialModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setRecordToEdit(null);
            setPrefilledMonth(undefined);
          }}
          customer={customer}
          recordToEdit={recordToEdit}
          defaultMonth={prefilledMonth}
          defaultYear={selectedYear}
        />
      )}

      {recordForHistory && (
        <FinancialHistoryModal
          isOpen={Boolean(recordForHistory)}
          onClose={() => setRecordForHistory(null)}
          record={recordForHistory}
          customer={customer}
        />
      )}

      {isPermissionModalOpen && (
        <FinancialPermissionModal
          isOpen={isPermissionModalOpen}
          onClose={() => setIsPermissionModalOpen(false)}
        />
      )}
    </div>
  );
};
