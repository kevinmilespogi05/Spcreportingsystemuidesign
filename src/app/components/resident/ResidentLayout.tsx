import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import {
  LayoutDashboard,
  FileText,
  Bell,
  LogOut,
  Shield,
  Menu,
  X,
  ChevronDown,
  HelpCircle,
  Settings,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { NotificationPanel } from "../shared/NotificationPanel";
import { ToastNotification } from "../shared/ToastNotification";
import { useApp } from "../../context/AppContext";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/resident" },
  { icon: FileText, label: "My Complaints", href: "/resident/complaints" },
  { icon: HelpCircle, label: "Help & Support", href: "/resident/help" },
  { icon: Settings, label: "Settings", href: "/resident/settings" },
];

export function ResidentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { user, setUser, notifications, markNotificationsRead, toastMessage, setToastMessage } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Redirect to login if not authenticated
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user) {
        navigate("/");
      }
    }, 500); // Give AppContext time to load user from session

    return () => clearTimeout(timer);
  }, [user, navigate]);

  const isActive = (href: string) => {
    if (href === "/resident") return location.pathname === "/resident";
    return location.pathname.startsWith(href);
  };

  const activeLabel = navItems.find((item) => isActive(item.href))?.label || "Dashboard";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/");
  };

  return (
    <div className="h-screen flex overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <>
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <aside
          className={`
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            fixed lg:static inset-y-0 left-0 z-30 lg:z-auto
            w-64 bg-[#0f2744] flex flex-col transition-transform duration-300 ease-in-out flex-shrink-0
          `}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center border border-white/15">
              <Shield className="w-4 h-4 text-blue-300" />
            </div>
            <div>
              <p className="text-white text-sm leading-tight">SPC System</p>
              <p className="text-blue-300/60 text-xs">Resident Portal</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto lg:hidden text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* User info */}
          <div className="px-4 py-4 border-b border-white/10">
            <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl bg-white/5">
              <div className="w-8 h-8 bg-blue-500/20 border border-blue-400/30 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-200 text-xs">
                  {user?.name?.charAt(0) || "R"}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm truncate">{user?.name || "Resident"}</p>
                <p className="text-blue-300/60 text-xs truncate">{user?.email || ""}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            <p className="text-blue-300/40 text-xs uppercase tracking-widest px-3 mb-3">
              Navigation
            </p>
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  navigate(item.href);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive(item.href)
                    ? "bg-white/10 text-white border border-white/10"
                    : "text-blue-200/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
                {isActive(item.href) && (
                  <div className="ml-auto w-1.5 h-1.5 bg-blue-400 rounded-full" />
                )}
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div className="px-3 py-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-300/70 hover:bg-red-500/10 hover:text-red-300 transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </aside>
      </>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Breadcrumb on desktop */}
          <div className="hidden lg:flex items-center gap-2 text-sm">
            <span className="text-slate-400">Resident</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-700">{activeLabel}</span>
          </div>

          <div className="flex-1" />

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1">
                  {unreadCount}
                </span>
              )}
            </button>
            <NotificationPanel
              notifications={notifications}
              isOpen={notifOpen}
              onClose={() => setNotifOpen(false)}
              onMarkAllRead={() => {
                markNotificationsRead();
                setNotifOpen(false);
              }}
            />
          </div>

          {/* Avatar */}
          <div className="w-8 h-8 bg-[#1e3a5f] rounded-full flex items-center justify-center">
            <span className="text-white text-xs">{user?.name?.charAt(0) || "R"}</span>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <Outlet />
        </div>
      </div>

      <ToastNotification
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}
