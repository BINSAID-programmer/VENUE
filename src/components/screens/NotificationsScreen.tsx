import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Calendar,
  BookOpen,
  MessageSquare,
  Award,
  Trash2,
  Check,
} from 'lucide-react';
import { NotificationItem } from '../../types';

interface NotificationsScreenProps {
  notifications: NotificationItem[];
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  notifications: initialNotifs,
}) => {
  const [notifs, setNotifs] = useState<NotificationItem[]>(initialNotifs);

  const markAllAsRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markSingleAsRead = (id: string) => {
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotif = (id: string) => {
    setNotifs((prev) => prev.filter((n) => n.id !== id));
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'academic':
        return <BookOpen className="w-4 h-4 text-sky-400" />;
      case 'deadline':
        return <Calendar className="w-4 h-4 text-amber-400" />;
      case 'community':
        return <MessageSquare className="w-4 h-4 text-emerald-400" />;
      case 'system':
      default:
        return <Bell className="w-4 h-4 text-blue-400" />;
    }
  };

  const unreadCount = notifs.filter((n) => !n.read).length;

  return (
    <div className="p-4 sm:p-6 space-y-5 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Notifications</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {unreadCount} unread academic alerts & updates
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            id="mark-all-read-btn"
            onClick={markAllAsRead}
            className="text-xs font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {notifs.map((notif) => (
          <div
            key={notif.id}
            onClick={() => markSingleAsRead(notif.id)}
            className={`p-3.5 rounded-2xl border flex items-start gap-3 transition-all cursor-pointer ${
              notif.read
                ? 'bg-slate-900/60 border-slate-850 opacity-70'
                : 'bg-slate-900 border-slate-800 hover:border-blue-500/40 shadow-sm'
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-center shrink-0 mt-0.5">
              {getIcon(notif.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4
                  className={`text-xs sm:text-sm font-semibold truncate ${
                    notif.read ? 'text-slate-300' : 'text-white'
                  }`}
                >
                  {notif.title}
                </h4>
                <span className="text-[10px] text-slate-500 shrink-0">{notif.timestamp}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{notif.message}</p>
            </div>

            <div className="flex items-center gap-1 shrink-0 pt-0.5">
              {!notif.read && (
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotif(notif.id);
                }}
                className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                title="Dismiss"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {notifs.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">No notifications right now.</p>
          </div>
        )}
      </div>
    </div>
  );
};
