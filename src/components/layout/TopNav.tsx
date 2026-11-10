import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Search, 
  Bell, 
  Menu, 
  UserCheck, 
  Building2, 
  Briefcase, 
  Clock, 
  FileText,
  ChevronDown,
  LogOut,
  User,
  Shield,
  Sparkles,
  ArrowRight,
  Layers,
  Check,
  X
} from 'lucide-react';
import { NotificationDrawer } from '../notifications/NotificationDrawer';
import { EntityBadge } from '../common/EntityBadge';

export const TopNav: React.FC = () => {
  const {
    selectedEntity,
    setSelectedEntity,
    availableEntities,
    currentUser,
    users,
    switchUser,
    logout,
    searchQuery,
    setSearchQuery,
    unreadNotificationCount,
    setIsNotificationOpen,
    setIsMobileSidebarOpen,
    scopedCustomers: customers,
    scopedOpportunities: opportunities,
    scopedActivities: activities,
    scopedPicas: picas,
    openCustomer360,
    openOpportunityDetail,
    openPicaDetail,
    setActiveMenu
  } = useApp();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isEntityDropdownOpen, setIsEntityDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const entityDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
      if (entityDropdownRef.current && !entityDropdownRef.current.contains(e.target as Node)) {
        setIsEntityDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut (Ctrl+K / Cmd+K) to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const input = searchRef.current?.querySelector('input');
        input?.focus();
        setIsSearchFocused(true);
      } else if (e.key === 'Escape') {
        setIsSearchFocused(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter global search results across 5 categories
  const q = searchQuery.toLowerCase().trim();
  const searchResults = useMemo(() => {
    if (!q) return null;

    const matchedCustomers = customers.filter(
      c => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || (c.legalEntityName && c.legalEntityName.toLowerCase().includes(q)) || (c.npwp && c.npwp.includes(q))
    ).slice(0, 4);

    const matchedOpportunities = opportunities.filter(
      o => o.opportunityName.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.code.toLowerCase().includes(q) || o.service.toLowerCase().includes(q)
    ).slice(0, 4);

    const matchedActivities = activities.filter(
      a => a.subject.toLowerCase().includes(q) || a.customerName.toLowerCase().includes(q) || a.activityType.toLowerCase().includes(q)
    ).slice(0, 3);

    const matchedPicas = picas.filter(
      p => p.issueTitle.toLowerCase().includes(q) || p.picaNumber.toLowerCase().includes(q) || p.customerName.toLowerCase().includes(q)
    ).slice(0, 3);

    const totalMatches =
      matchedCustomers.length +
      matchedOpportunities.length +
      matchedActivities.length +
      matchedPicas.length;

    return {
      customers: matchedCustomers,
      opportunities: matchedOpportunities,
      activities: matchedActivities,
      picas: matchedPicas,
      totalMatches
    };
  }, [q, customers, opportunities, activities, picas]);

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        {/* Left Section: Mobile Menu & Brand Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Open sidebar menu"
          >
            <Menu className="w-5 h-5" />
          </button>

        </div>

        {/* Center: Global Search Bar */}
        <div className="relative flex-1 max-w-lg mx-4 hidden sm:block" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search..."
              className="w-full pl-9 pr-14 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs border border-slate-200 rounded-lg text-[#172B4D] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0070C0]/20 focus:border-[#0070C0] transition-all"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 bg-slate-200/60 border border-slate-300/60 px-1.5 py-0.5 rounded pointer-events-none">
                ⌘K
              </kbd>
            )}
          </div>

          {/* Real-time Grouped Search Results Dropdown */}
          {isSearchFocused && searchResults && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[75vh] overflow-y-auto animate-in zoom-in-95 duration-100 divide-y divide-slate-100">
              {searchResults.totalMatches === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 space-y-1.5">
                  <Search className="w-6 h-6 mx-auto opacity-30 text-slate-400" />
                  <p className="font-semibold text-slate-600">No records found for "{searchQuery}"</p>
                  <p className="text-[11px] text-slate-400">Try searching by company name, opportunity code, or PICA number.</p>
                </div>
              ) : (
                <>
                  {/* Category 1: CUSTOMER */}
                  {searchResults.customers.length > 0 && (
                    <div className="p-2">
                      <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Building2 className="w-3 h-3 text-[#0070C0]" />
                        <span>CUSTOMER</span>
                      </div>
                      {searchResults.customers.map(c => (
                        <div
                          key={c.id}
                          onClick={() => {
                            openCustomer360(c.id);
                            setIsSearchFocused(false);
                            setSearchQuery('');
                          }}
                          className="px-2.5 py-2 rounded-lg hover:bg-blue-50/70 cursor-pointer flex items-center justify-between transition-colors group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded shrink-0">
                              {c.code}
                            </span>
                            <span className="font-semibold text-xs text-[#172B4D] group-hover:text-[#0070C0] truncate">
                              {c.name}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 shrink-0 ml-2">{c.industry}</span>
                        </div>
                      ))}
                    </div>
                  )}



                  {/* Category 3: OPPORTUNITY */}
                  {searchResults.opportunities.length > 0 && (
                    <div className="p-2">
                      <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Briefcase className="w-3 h-3 text-amber-600" />
                        <span>OPPORTUNITY</span>
                      </div>
                      {searchResults.opportunities.map(o => (
                        <div
                          key={o.id}
                          onClick={() => {
                            openOpportunityDetail(o.id);
                            setIsSearchFocused(false);
                            setSearchQuery('');
                          }}
                          className="px-2.5 py-2 rounded-lg hover:bg-amber-50/70 cursor-pointer flex items-center justify-between transition-colors group"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="font-semibold text-xs text-[#172B4D] group-hover:text-amber-800 truncate">
                              {o.opportunityName}
                            </div>
                            <span className="text-[11px] text-slate-400 truncate">{o.customerName}</span>
                          </div>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded shrink-0">
                            {o.stage}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Category 4: ACTIVITY */}
                  {searchResults.activities.length > 0 && (
                    <div className="p-2">
                      <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-blue-600" />
                        <span>ACTIVITY</span>
                      </div>
                      {searchResults.activities.map(a => (
                        <div
                          key={a.id}
                          onClick={() => {
                            openCustomer360(a.customerId, 'activity');
                            setIsSearchFocused(false);
                            setSearchQuery('');
                          }}
                          className="px-2.5 py-2 rounded-lg hover:bg-blue-50/70 cursor-pointer flex items-center justify-between transition-colors group"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="font-semibold text-xs text-[#172B4D] group-hover:text-[#0070C0] truncate">
                              {a.activityType} — {a.customerName}
                            </div>
                            <span className="text-[11px] text-slate-400 truncate">{a.subject}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">{a.date}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Category 5: PICA */}
                  {searchResults.picas.length > 0 && (
                    <div className="p-2">
                      <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3 h-3 text-rose-600" />
                        <span>PICA</span>
                      </div>
                      {searchResults.picas.map(p => (
                        <div
                          key={p.id}
                          onClick={() => {
                            openPicaDetail(p.id);
                            setIsSearchFocused(false);
                            setSearchQuery('');
                          }}
                          className="px-2.5 py-2 rounded-lg hover:bg-rose-50/70 cursor-pointer flex items-center justify-between transition-colors group"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="font-semibold text-xs text-[#172B4D] group-hover:text-rose-700 truncate">
                              {p.picaNumber} — {p.issueTitle}
                            </div>
                            <span className="text-[11px] text-slate-400 truncate">{p.customerName}</span>
                          </div>
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded shrink-0">
                            {p.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Section: Entity Switcher, Notification Bell & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Entity Switcher Dropdown */}
          <div className="relative" ref={entityDropdownRef}>
            <button
              onClick={() => setIsEntityDropdownOpen(!isEntityDropdownOpen)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs text-[#172B4D] transition-colors cursor-pointer shadow-2xs"
              title="Filter records by Operating Entity"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 text-[11px] hidden lg:inline">Entity:</span>
                {selectedEntity === 'ALL' ? (
                  <span className="font-semibold text-xs text-slate-700">All Entities</span>
                ) : (
                  <EntityBadge entity={selectedEntity} size="xs" />
                )}
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-0.5" />
            </button>

            {/* Entity Switcher Menu */}
            {isEntityDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-72 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 z-50 animate-in zoom-in-95 duration-100 text-xs">
                <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Operating Entity
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {availableEntities.length} assigned
                  </span>
                </div>

                {/* Option 1: All Entities (Group) */}
                <button
                  onClick={() => {
                    setSelectedEntity('ALL');
                    setIsEntityDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                    selectedEntity === 'ALL' ? 'bg-blue-50/70 text-[#0070C0]' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs leading-tight">All Entities (Group View)</div>
                      <div className="text-[10px] text-slate-400">Pancaran Group unified data</div>
                    </div>
                  </div>
                  {selectedEntity === 'ALL' && <Check className="w-4 h-4 text-[#0070C0] shrink-0 ml-1" />}
                </button>

                <div className="my-1 border-t border-slate-100" />

                {/* Specific Operating Entities */}
                <div className="space-y-0.5">
                  {availableEntities.map(ent => {
                    const isSelected = selectedEntity === ent.id;
                    return (
                      <button
                        key={ent.id}
                        onClick={() => {
                          setSelectedEntity(ent.id);
                          setIsEntityDropdownOpen(false);
                        }}
                        className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer ${
                          isSelected ? 'bg-blue-50/70 text-[#0070C0]' : 'text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <EntityBadge entity={ent.id} size="xs" />
                          <div className="min-w-0">
                            <div className="text-[11px] font-normal text-slate-700 truncate">
                              {ent.fullName}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {ent.description}
                            </div>
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#0070C0] shrink-0 ml-1.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Notification Bell */}
          <button
            onClick={() => setIsNotificationOpen(true)}
            className="relative p-2 text-slate-600 hover:text-[#172B4D] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white tabular-nums animate-pulse">
                {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
              </span>
            )}
          </button>

          {/* Role Switcher & Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-left cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-[#172B4D] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-bold text-[#172B4D] leading-tight flex items-center gap-1">
                  <span>{currentUser.name}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                  {currentUser.role}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
            </button>

            {/* Profile & Demo Role Switcher Dropdown */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in zoom-in-95 duration-100 text-xs">
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="font-bold text-[#172B4D]">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-400">{currentUser.email}</div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#0070C0] border border-blue-100">
                      {currentUser.role}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      Dept: {currentUser.department}
                    </span>
                  </div>
                  <div className="mt-2 text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-700 font-semibold">Assigned Entities:</span>
                      <div className="flex gap-1">
                        {(currentUser.assignedEntities || ['PETRA', 'PDT', 'PLI']).map(eid => (
                          <EntityBadge key={eid} entity={eid} size="xs" />
                        ))}
                      </div>
                    </div>
                    <div>
                      <strong className="text-slate-700">Data Visibility: </strong>
                      {currentUser.role === 'Super Admin'
                        ? 'Global (All Departments)'
                        : currentUser.role === 'Head of Department'
                        ? 'Department Scope (Team Members)'
                        : 'Data Ownership (Personal Accounts)'}
                    </div>
                  </div>
                </div>

                {/* Quick Role Switcher for Evaluation */}
                <div className="p-2 border-b border-slate-100 bg-slate-50/50">
                  <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Switch Test Persona
                  </div>
                  <div className="space-y-1 mt-1">
                    {users.map(u => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u.id);
                          setIsProfileDropdownOpen(false);
                        }}
                        className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors flex items-center justify-between cursor-pointer ${
                          u.id === currentUser.id
                            ? 'bg-[#0070C0] text-white font-bold shadow-2xs'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="min-w-0 pr-1">
                          <div className="truncate font-medium">{u.name}</div>
                          <div className={`text-[10px] truncate ${u.id === currentUser.id ? 'text-blue-100' : 'text-slate-400'}`}>
                            {u.department}
                          </div>
                        </div>
                        <span className={`text-[10px] shrink-0 font-semibold px-1.5 py-0.5 rounded ${
                          u.id === currentUser.id ? 'bg-white/20 text-white' : 'bg-slate-200/60 text-slate-600'
                        }`}>
                          {u.role.replace('Business Development', 'BD').replace('Key Account Management', 'KAM').replace('Head of Department', 'Head Dept')}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-1">
                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg text-left flex items-center gap-2 transition-colors cursor-pointer font-semibold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Notification Drawer */}
      <NotificationDrawer />
    </>
  );
};
