import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  CheckCheck,
  Clock,
  AlertTriangle,
  FileText,
  X,
  Check,
  ShieldCheck,
  Building2,
  Briefcase,
  AlertOctagon,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { NotificationItem } from '../../types';

export const NotificationDrawer: React.FC = () => {
  const {
    notifications,
    isNotificationOpen,
    setIsNotificationOpen,
    markNotificationAsRead,
    markAllNotificationsRead,
    openCustomer360,
    openOpportunityDetail,
    openPicaDetail,
    setPicaSubTab,
    setActiveMenu,
    openContractDetail,
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  if (!isNotificationOpen) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const handleNotificationClick = (notif: NotificationItem) => {
    markNotificationAsRead(notif.id);
    setIsNotificationOpen(false);

    if (notif.relatedEntity === 'contract' && notif.relatedId) {
      openContractDetail(notif.relatedId);
    } else if (notif.relatedEntity === 'pica' && notif.relatedId) {
      if (notif.type === 'pica_waiting_verification') {
        setActiveMenu('pica');
        setPicaSubTab('verification');
      } else {
        setActiveMenu('pica');
      }
      openPicaDetail(notif.relatedId);
    } else if (notif.relatedEntity === 'followup') {
      setActiveMenu('followup');
    } else if (notif.relatedEntity === 'customer' && notif.relatedId) {
      openCustomer360(notif.relatedId);
    } else if (notif.relatedEntity === 'opportunity' && notif.relatedId) {
      openOpportunityDetail(notif.relatedId);
    }
  };

  const getNotificationIcon = (type: NotificationItem['type'], isUrgent?: boolean) => {
    switch (type) {
      case 'contract_expired':
      case 'followup_overdue':
      case 'pica_overdue':
        return (
          <div className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 shrink-0">
            <AlertOctagon className="w-4 h-4" />
          </div>
        );
      case 'contract_expiring_soon':
      case 'followup_due_today':
      case 'pica_due_soon':
        return (
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
        );
      case 'pica_waiting_verification':
        return (
          <div className="p-2 rounded-lg bg-purple-50 text-purple-600 border border-purple-100 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
        );
      case 'pica_assigned':
      default:
        return (
          <div className="p-2 rounded-lg bg-blue-50 text-[#0070C0] border border-blue-100 shrink-0">
            <FileText className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 text-[#0070C0] rounded-lg">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#172B4D]">Notification Center</h3>
              <p className="text-[11px] text-slate-400">Action items, reminders & SLA warnings</p>
            </div>
          </div>

          <button
            onClick={() => setIsNotificationOpen(false)}
            className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter and Mark Read Actions Bar */}
        <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                filter === 'all' ? 'bg-white text-[#172B4D] shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                filter === 'unread' ? 'bg-white text-[#0070C0] shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="text-xs font-semibold text-[#0070C0] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs space-y-2">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Bell className="w-5 h-5 opacity-40" />
              </div>
              <p className="font-semibold text-slate-700">
                {filter === 'unread' ? "You're all caught up!" : 'No notifications right now.'}
              </p>
              <p className="text-slate-400 max-w-xs mx-auto">
                {filter === 'unread' ? 'No pending unread alerts or reminders.' : 'New SLA notices and assignments will appear here.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((n) => {
              const isOverdue = n.type.includes('overdue');

              return (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-4 transition-colors cursor-pointer hover:bg-slate-50 flex items-start gap-3 relative group ${
                    !n.isRead ? 'bg-blue-50/30' : 'bg-white'
                  }`}
                >
                  {getNotificationIcon(n.type, n.isUrgent)}

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-xs font-bold truncate ${isOverdue ? 'text-rose-700' : 'text-[#172B4D]'}`}>
                        {n.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {n.date.split(' ')[1] || n.date}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {n.message}
                    </p>

                    {/* Contract Details specific block */}
                    {n.relatedEntity === 'contract' && (
                      <div className="bg-slate-50/80 border border-slate-200/60 rounded-lg p-2 text-xs space-y-1 mt-1">
                        {n.contractTitle && (
                          <div className="font-semibold text-[#172B4D] truncate flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-[#0070C0] shrink-0" />
                            <span className="truncate">{n.contractTitle}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                          {n.expiryDate && (
                            <span>Expiry: <strong className="font-mono text-slate-700">{n.expiryDate}</strong></span>
                          )}
                          {n.type === 'contract_expired' ? (
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              Expired
                            </span>
                          ) : n.daysRemaining !== undefined ? (
                            <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border ${
                              n.daysRemaining <= 30
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {n.daysRemaining} days remaining
                            </span>
                          ) : null}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1">
                      {n.customerName ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[180px]">{n.customerName}</span>
                        </span>
                      ) : (
                        <span />
                      )}

                      {!n.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markNotificationAsRead(n.id);
                          }}
                          className="text-[11px] text-[#0070C0] font-semibold hover:underline flex items-center gap-0.5 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Check className="w-3 h-3" />
                          <span>Mark read</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-[#0070C0] mt-1.5 shrink-0" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
