import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import {
  LayoutDashboard,
  FileText,
  Users,
  LogOut,
  Shield,
  Menu,
  X,
  BarChart3,
  Settings,
  Tag,
  Ban,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { ToastNotification } from "../shared/ToastNotification";
import { useApp } from "../../context/AppContext";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/admin" },
  { icon: FileText, label: "Complaints", href: "/admin/complaints" },
  { icon: Users, label: "Residents", href: "/admin/residents" },
  { icon: Ban, label: "Banned Residents", href: "/admin/banned" },
  { icon: Tag, label: "Categories", href: "/admin/categories" },
  { icon: BarChart3, label: "Reports & Analytics", href: "/admin/analytics" },
  { icon: Settings, label: "System Settings", href: "/admin/settings" },
];

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, setUser, toastMessage, setToastMessage } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

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
    if (href === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(href);
  };

  const activeLabel = navItems.find((item) => isActive(item.href))?.label || "Overview";

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/");
  };

  return (
    <div className="h-screen flex overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <>
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
            w-64 bg-[#0a1f3d] flex flex-col transition-transform duration-300 ease-in-out flex-shrink-0
          `}
        >
          {/* Logo */}
          <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-500/30">
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-white text-sm leading-tight">SPC System</p>
              <p className="text-blue-300/60 text-xs">Admin Portal</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-auto lg:hidden text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Admin user */}
          <div className="px-4 py-4 border-b border-white/10">
            <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl bg-white/5">
              <div className="w-8 h-8 bg-amber-500/20 border border-amber-400/30 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-amber-200 text-xs">
                  {user?.name?.charAt(0) || "A"}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm truncate">{user?.name || "Admin Officer"}</p>
                <p className="text-amber-300/60 text-xs truncate">Administrator</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            <p className="text-blue-300/40 text-xs uppercase tracking-widest px-3 mb-3">
              Main Menu
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
                    ? "bg-blue-600/20 text-white border border-blue-500/20"
                    : "text-blue-200/60 hover:bg-white/5 hover:text-white"
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

          {/* Breadcrumb */}
          <div className="hidden lg:flex items-center gap-2 text-sm">
            <span className="text-slate-400">Admin</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-700">{activeLabel}</span>
          </div>

          <div className="flex-1" />

          {/* Admin badge */}
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
            <Shield className="w-3 h-3" />
            Administrator
          </span>


        </header>

        {/* Page content */}
        <div className="flex-1 overflow-hidden flex">
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
