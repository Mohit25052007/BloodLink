import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import notificationService from '../services/notificationService';
import { useToast } from '../context/ToastContext';
import { Spinner } from '../components/common/Loader';
import { Bell, CheckCheck, CheckCircle2, Clock, Inbox, ShieldCheck, HeartHandshake } from 'lucide-react';

export const NotificationsPage = () => {
  const { showSuccess, showError } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications({ limit: 50 });
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      showError(err.message || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      showSuccess('All notifications marked as read.');
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err) {
      showError(err.message || 'Failed to mark all as read.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
            <Bell className="w-4 h-4" />
            Alerts & Activity
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Notifications</h1>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-xs"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" />
          <p className="text-xs text-slate-500 font-medium">Fetching notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-3 max-w-md mx-auto my-8">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Bell className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">All Caught Up!</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            You don't have any notifications right now. When you receive donation offers or verification updates, they
            will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const isUnread = !notif.readAt;

            return (
              <div
                key={notif._id}
                onClick={() => isUnread && handleMarkAsRead(notif._id)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start gap-4 cursor-pointer ${
                  isUnread
                    ? 'bg-rose-50/70 border-brand-200 shadow-xs hover:bg-rose-50'
                    : 'bg-white border-slate-200/80 hover:bg-slate-50 text-slate-600'
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    notif.type.includes('accepted')
                      ? 'bg-emerald-100 text-emerald-700'
                      : notif.type.includes('verification')
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-brand-100 text-brand-700'
                  }`}
                >
                  {notif.type.includes('accepted') ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : notif.type.includes('verification') ? (
                    <ShieldCheck className="w-5 h-5" />
                  ) : (
                    <HeartHandshake className="w-5 h-5" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{notif.title}</h4>
                    <span className="text-[11px] text-slate-400">
                      {new Date(notif.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>

                  {/* Context Link */}
                  {notif.relatedEntityType === 'ContactRequest' && (
                    <div className="pt-2">
                      <Link
                        to="/inbox"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
                      >
                        <Inbox className="w-3.5 h-3.5" />
                        View in Contact Inbox →
                      </Link>
                    </div>
                  )}
                </div>

                {/* Unread indicator */}
                {isUnread && (
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-600 flex-shrink-0 mt-1.5" title="Unread"></span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
