import { Bell, X, CheckCircle, Info, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Notification } from "../../data/mockData";

interface NotificationPanelProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkAllRead: () => void;
  isOpen: boolean;
}

const typeIcon = {
  update: <RefreshCw className="w-3.5 h-3.5 text-blue-500" />,
  info: <Info className="w-3.5 h-3.5 text-slate-500" />,
  resolved: <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />,
};

export function NotificationPanel({
  notifications,
  onClose,
  onMarkAllRead,
  isOpen,
}: NotificationPanelProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-2xl z-40 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-semibold text-slate-800">Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-[#1e3a5f] text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllRead}
                    className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Notifications list */}
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">
                  No notifications
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`flex gap-3 px-4 py-3 border-b border-slate-50 last:border-0 transition-colors ${
                      !notif.read ? "bg-blue-50/40" : "bg-white"
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5 w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center">
                      {typeIcon[notif.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs leading-relaxed ${!notif.read ? "text-slate-800" : "text-slate-500"}`}>
                        {notif.message}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{notif.timestamp}</p>
                    </div>
                    {!notif.read && (
                      <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1.5" />
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
