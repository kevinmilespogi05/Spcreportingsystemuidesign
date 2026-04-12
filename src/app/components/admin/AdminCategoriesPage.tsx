import { useState, useMemo } from "react";
import { Clock, CheckCircle2, AlertCircle, Plus, Edit2, Search } from "lucide-react";
import { motion } from "motion/react";
import { useApp } from "../../context/AppContext";
import { COMPLAINT_CATEGORIES, ComplaintCategory } from "../../data/mockData";

const categoryIcons: Record<ComplaintCategory, string> = {
  "Road & Infrastructure": "🛣️",
  "Waste Management": "♻️",
  "Public Safety": "🛡️",
  "Noise Complaint": "🔊",
  "Street Lighting": "💡",
  "Water & Drainage": "💧",
  "Public Health": "🏥",
  Other: "📋",
};

const categoryColors: Record<ComplaintCategory, { bg: string; border: string; text: string; bar: string }> = {
  "Road & Infrastructure": { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", bar: "bg-blue-500" },
  "Waste Management": { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", bar: "bg-emerald-500" },
  "Public Safety": { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", bar: "bg-amber-500" },
  "Noise Complaint": { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", bar: "bg-purple-500" },
  "Street Lighting": { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", bar: "bg-yellow-500" },
  "Water & Drainage": { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700", bar: "bg-cyan-500" },
  "Public Health": { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", bar: "bg-red-500" },
  Other: { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-600", bar: "bg-slate-400" },
};

export function AdminCategoriesPage() {
  const { complaints } = useApp();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ComplaintCategory | null>(null);

  const categoryStats = useMemo(() => {
    return COMPLAINT_CATEGORIES.map((cat) => {
      const catComplaints = complaints.filter((c) => c.category === cat);
      return {
        name: cat,
        total: catComplaints.length,
        pending: catComplaints.filter((c) => c.status === "Pending").length,
        inProgress: catComplaints.filter((c) => c.status === "In Progress").length,
        resolved: catComplaints.filter((c) => c.status === "Resolved").length,
        rejected: catComplaints.filter((c) => c.status === "Rejected").length,
        resolutionRate: catComplaints.length > 0
          ? Math.round((catComplaints.filter((c) => c.status === "Resolved").length / catComplaints.length) * 100)
          : 0,
        complaints: catComplaints,
      };
    });
  }, [complaints]);

  const filtered = useMemo(() => {
    if (!search) return categoryStats;
    return categoryStats.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [categoryStats, search]);

  const maxCount = Math.max(...categoryStats.map((c) => c.total), 1);
  const selectedStats = selectedCategory
    ? categoryStats.find((c) => c.name === selectedCategory)
    : null;

  return (
    <div className="flex-1 overflow-hidden flex">
      {/* Main content */}
      <div className={`flex-1 overflow-y-auto bg-slate-50 ${selectedStats ? "lg:flex-1" : ""}`}>
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-slate-800">Categories</h1>
              <p className="text-slate-500 text-sm mt-0.5">
                {COMPLAINT_CATEGORIES.length} complaint categories · {complaints.length} total complaints
              </p>
            </div>
            <button className="flex items-center gap-2 border border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f] hover:text-white px-4 py-2.5 rounded-xl text-sm transition-all">
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>
        </div>

        <div className="px-6 py-6 space-y-5">
          {/* Overview bar chart */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-slate-700 mb-4">Complaints Distribution</h3>
            <div className="space-y-3">
              {[...categoryStats]
                .sort((a, b) => b.total - a.total)
                .map((cat, i) => (
                  <div key={cat.name} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-36 truncate flex-shrink-0">{cat.name}</span>
                    <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${cat.total > 0 ? (cat.total / maxCount) * 100 : 0}%` }}
                        transition={{ delay: i * 0.06, duration: 0.5 }}
                        className={`h-full rounded-full ${categoryColors[cat.name as ComplaintCategory]?.bar || "bg-slate-400"}`}
                      />
                    </div>
                    <span className="text-xs text-slate-600 w-6 text-right flex-shrink-0">{cat.total}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all shadow-sm"
            />
          </div>

          {/* Category Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
            {filtered.map((cat, i) => {
              const colors = categoryColors[cat.name as ComplaintCategory];
              const icon = categoryIcons[cat.name as ComplaintCategory];
              const isSelected = selectedCategory === cat.name;
              return (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => setSelectedCategory(isSelected ? null : (cat.name as ComplaintCategory))}
                  className={`bg-white rounded-xl border shadow-sm cursor-pointer transition-all hover:shadow-md ${
                    isSelected
                      ? `border-[#1e3a5f] ring-2 ring-[#1e3a5f]/10`
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 ${colors?.bg || "bg-slate-50"} ${colors?.border ? `border ${colors.border}` : ""} rounded-xl flex items-center justify-center text-lg flex-shrink-0`}>
                          {icon}
                        </div>
                        <div>
                          <p className="text-sm text-slate-800">{cat.name}</p>
                          <p className="text-xs text-slate-400">{cat.total} complaint{cat.total !== 1 ? "s" : ""}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); }}
                          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-3">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs text-slate-400">Resolution rate</span>
                        <span className={`text-xs ${colors?.text || "text-slate-600"}`}>
                          {cat.resolutionRate}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${cat.resolutionRate}%` }}
                          transition={{ delay: i * 0.06 + 0.2, duration: 0.5 }}
                          className={`h-full rounded-full ${colors?.bar || "bg-slate-400"}`}
                        />
                      </div>
                    </div>

                    {/* Status pills */}
                    <div className="flex gap-2 flex-wrap">
                      {cat.pending > 0 && (
                        <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3" />{cat.pending} pending
                        </span>
                      )}
                      {cat.inProgress > 0 && (
                        <span className="flex items-center gap-1 text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                          <AlertCircle className="w-3 h-3" />{cat.inProgress} active
                        </span>
                      )}
                      {cat.resolved > 0 && (
                        <span className="flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />{cat.resolved} resolved
                        </span>
                      )}
                      {cat.total === 0 && (
                        <span className="text-xs text-slate-400">No complaints yet</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Detail Side Panel */}
      {selectedStats && (
        <div className="w-72 flex-shrink-0 border-l border-slate-200 bg-white overflow-y-auto hidden lg:block">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Category Detail</p>
                <h3 className="text-slate-800 text-sm">{selectedStats.name}</h3>
              </div>
              <button
                onClick={() => setSelectedCategory(null)}
                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total", value: selectedStats.total, color: "text-slate-700" },
                { label: "Pending", value: selectedStats.pending, color: "text-amber-600" },
                { label: "In Progress", value: selectedStats.inProgress, color: "text-blue-600" },
                { label: "Resolved", value: selectedStats.resolved, color: "text-emerald-600" },
              ].map((s) => (
                <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
                  <p className={`text-xl ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">Recent Complaints</p>
              <div className="space-y-2">
                {selectedStats.complaints.slice(0, 4).map((c) => (
                  <div key={c.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono text-slate-400">{c.id}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                        c.status === "Resolved" ? "text-emerald-700 bg-emerald-50" :
                        c.status === "In Progress" ? "text-blue-700 bg-blue-50" :
                        c.status === "Pending" ? "text-amber-700 bg-amber-50" :
                        "text-red-700 bg-red-50"
                      }`}>{c.status}</span>
                    </div>
                    <p className="text-xs text-slate-600 truncate">{c.residentName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{c.dateSubmitted}</p>
                  </div>
                ))}
                {selectedStats.complaints.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">No complaints in this category</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}