import { useMemo } from "react";
import { useNavigate } from "react-router";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Users,
  Tag,
  BarChart3,
  MapPin,
  Calendar,
} from "lucide-react";
import { motion } from "motion/react";
import { StatusBadge } from "../shared/StatusBadge";
import { useApp } from "../../context/AppContext";

const categoryColors: Record<string, string> = {
  "Road & Infrastructure": "bg-blue-500",
  "Waste Management": "bg-emerald-500",
  "Public Safety": "bg-amber-500",
  "Noise Complaint": "bg-purple-500",
  "Street Lighting": "bg-yellow-500",
  "Water & Drainage": "bg-cyan-500",
  "Public Health": "bg-red-500",
  Other: "bg-slate-400",
};

export function AdminOverviewPage() {
  const { complaints } = useApp();
  const navigate = useNavigate();

  const stats = useMemo(() => ({
    total: complaints.length,
    pending: complaints.filter((c) => c.status === "Pending").length,
    inProgress: complaints.filter((c) => c.status === "In Progress").length,
    resolved: complaints.filter((c) => c.status === "Resolved").length,
    resolutionRate: Math.round(
      (complaints.filter((c) => c.status === "Resolved").length / complaints.length) * 100
    ),
  }), [complaints]);

  const categoryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};
    complaints.forEach((c) => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [complaints]);

  const recentComplaints = useMemo(
    () => [...complaints].sort((a, b) => b.dateSubmitted.localeCompare(a.dateSubmitted)).slice(0, 5),
    [complaints]
  );

  const priorityComplaints = complaints.filter((c) => c.status === "Pending").slice(0, 3);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-slate-800">Overview</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              System summary as of {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/complaints")}
            className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#162d4a] text-white px-4 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-[#1e3a5f]/20"
          >
            <FileText className="w-4 h-4" />
            Manage Complaints
          </button>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6 max-w-7xl mx-auto">
        {/* KPI Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Complaints",
              value: stats.total,
              icon: FileText,
              color: "text-slate-600",
              bg: "bg-slate-100",
              border: "border-slate-200",
              trend: "+3 this week",
              trendUp: true,
            },
            {
              label: "Pending Review",
              value: stats.pending,
              icon: Clock,
              color: "text-amber-600",
              bg: "bg-amber-50",
              border: "border-amber-200",
              trend: "Needs attention",
              trendUp: false,
            },
            {
              label: "In Progress",
              value: stats.inProgress,
              icon: AlertCircle,
              color: "text-blue-600",
              bg: "bg-blue-50",
              border: "border-blue-200",
              trend: "Active cases",
              trendUp: true,
            },
            {
              label: "Resolved",
              value: stats.resolved,
              icon: CheckCircle2,
              color: "text-emerald-600",
              bg: "bg-emerald-50",
              border: "border-emerald-200",
              trend: `${stats.resolutionRate}% resolution rate`,
              trendUp: true,
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`bg-white rounded-xl border ${stat.border} p-4 shadow-sm`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
                </div>
                {stat.trendUp ? (
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-amber-500" />
                )}
              </div>
              <p className={`text-3xl ${stat.color}`}>{stat.value}</p>
              <p className="text-slate-500 text-xs mt-0.5">{stat.label}</p>
              <p className="text-xs text-slate-400 mt-1">{stat.trend}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Complaints */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-slate-700">Recent Complaints</h3>
              <button
                onClick={() => navigate("/admin/complaints")}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
              >
                View all
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {recentComplaints.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 + i * 0.05 }}
                  className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => navigate("/admin/complaints")}
                >
                  <div className="w-8 h-8 bg-[#1e3a5f]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[#1e3a5f] text-xs">{c.residentName.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {c.id}
                      </span>
                      <span className="text-xs text-slate-500 truncate">{c.residentName}</span>
                    </div>
                    <p className="text-xs text-slate-600 truncate">{c.category}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span className="text-xs text-slate-400">{c.dateSubmitted}</span>
                    </div>
                  </div>
                  <StatusBadge status={c.status} size="sm" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Category Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-slate-700">By Category</h3>
              <button
                onClick={() => navigate("/admin/categories")}
                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
              >
                Details
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              {categoryBreakdown.map(([cat, count], i) => (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-600 truncate max-w-[140px]">{cat}</span>
                    <span className="text-xs text-slate-500">{count}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / stats.total) * 100}%` }}
                      transition={{ delay: 0.4 + i * 0.06, duration: 0.5 }}
                      className={`h-full rounded-full ${categoryColors[cat] || "bg-slate-400"}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Priority Items & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending/Priority */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl border border-amber-200 shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-amber-100 bg-amber-50/50">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <h3 className="text-amber-700">Pending Action Required</h3>
              </div>
              <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                {stats.pending} items
              </span>
            </div>
            <div className="divide-y divide-slate-100">
              {priorityComplaints.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-sm">
                  No pending complaints
                </div>
              ) : (
                priorityComplaints.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 cursor-pointer"
                    onClick={() => navigate("/admin/complaints")}
                  >
                    <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-mono text-slate-400">{c.id}</span>
                      </div>
                      <p className="text-xs text-slate-700">{c.category}</p>
                      {c.location && (
                        <span className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                          <MapPin className="w-3 h-3" />{c.location}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 flex-shrink-0">{c.dateSubmitted}</span>
                  </div>
                ))
              )}
            </div>
            {stats.pending > 3 && (
              <div className="px-5 py-3 border-t border-slate-100">
                <button
                  onClick={() => navigate("/admin/complaints")}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  View {stats.pending - 3} more pending complaints
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="text-slate-700">Quick Actions</h3>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3">
              {[
                {
                  icon: FileText,
                  label: "Manage Complaints",
                  desc: "View & update all reports",
                  href: "/admin/complaints",
                  color: "text-[#1e3a5f]",
                  bg: "bg-[#1e3a5f]/10",
                },
                {
                  icon: Users,
                  label: "View Residents",
                  desc: "Browse resident accounts",
                  href: "/admin/residents",
                  color: "text-emerald-600",
                  bg: "bg-emerald-50",
                },
                {
                  icon: Tag,
                  label: "Categories",
                  desc: "Manage complaint types",
                  href: "/admin/categories",
                  color: "text-purple-600",
                  bg: "bg-purple-50",
                },
                {
                  icon: BarChart3,
                  label: "Analytics",
                  desc: "Reports & insights",
                  href: "/admin/analytics",
                  color: "text-amber-600",
                  bg: "bg-amber-50",
                },
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.href)}
                  className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all text-left"
                >
                  <div className={`w-8 h-8 ${action.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <action.icon className={`w-4 h-4 ${action.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-slate-700">{action.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{action.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
