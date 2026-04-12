import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Eye,
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Complaint, ComplaintStatus } from "../../lib/complaintService";
import { StatusBadge } from "../shared/StatusBadge";
import { ComplaintDetailPanel } from "./ComplaintDetailPanel";
import { useApp } from "../../context/AppContext";

const COMPLAINT_CATEGORIES_FILTER = [
  "All",
  "Road & Infrastructure",
  "Waste Management",
  "Public Safety",
  "Noise Complaint",
  "Street Lighting",
  "Water & Drainage",
  "Public Health",
  "Other",
] as const;
type ComplaintCategory = Exclude<(typeof COMPLAINT_CATEGORIES_FILTER)[number], "All">;

const STATUS_FILTER: (ComplaintStatus | "All")[] = ["All", "Pending", "In Progress", "Resolved", "Rejected"];

type SortField = "complaint_code" | "residentName" | "category" | "created_at" | "status";
type SortDir = "asc" | "desc";

export function AdminDashboard() {
  const { complaints, complaintsLoading, fetchAllComplaints } = useApp();
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<ComplaintCategory | "All">("All");
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | "All">("All");
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Fetch all complaints on component mount
  useEffect(() => {
    const loadComplaints = async () => {
      setLoadError(null);
      const response = await fetchAllComplaints();
      if (!response.success) {
        setLoadError(response.error || "Failed to load complaints");
      }
    };
    loadComplaints();
  }, []);

  const stats = useMemo(() => ({
    total: complaints.length,
    pending: complaints.filter((c) => c.status === "Pending").length,
    inProgress: complaints.filter((c) => c.status === "In Progress").length,
    resolved: complaints.filter((c) => c.status === "Resolved").length,
  }), [complaints]);

  const filtered = useMemo(() => {
    let result = [...complaints];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.complaint_code.toLowerCase().includes(q) ||
          (c.residentName || "").toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }
    if (categoryFilter !== "All") {
      result = result.filter((c) => c.category === categoryFilter);
    }
    if (statusFilter !== "All") {
      result = result.filter((c) => c.status === statusFilter);
    }
    result.sort((a, b) => {
      let valA: any = a[sortField] || "";
      let valB: any = b[sortField] || "";
      
      // Handle date sorting
      if (sortField === "created_at") {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }
      
      const cmp = valA < valB ? -1 : valA > valB ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [complaints, search, categoryFilter, statusFilter, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronsUpDown className="w-3.5 h-3.5 text-slate-300" />;
    return sortDir === "asc" ? (
      <ChevronUp className="w-3.5 h-3.5 text-[#1e3a5f]" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-[#1e3a5f]" />
    );
  };

  if (loadError) {
    return (
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white border-b border-slate-200 px-6 py-5 flex-shrink-0">
            <h1 className="text-slate-800">Complaint Management</h1>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-700 text-sm">{loadError}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-5 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-slate-800">Complaint Management</h1>
              <p className="text-slate-500 text-sm mt-0.5">
                Review, assign, and resolve resident complaints
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">
                {complaintsLoading ? "Loading..." : `${filtered.length} of ${complaints.length} complaints`}
              </span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total", value: stats.total, icon: FileText, color: "text-slate-600", bg: "bg-slate-100", border: "border-slate-200" },
              { label: "Pending", value: stats.pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
              { label: "In Progress", value: stats.inProgress, icon: AlertCircle, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
              { label: "Resolved", value: stats.resolved, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={`bg-white rounded-xl border ${s.border} p-4 shadow-sm`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-2xl ${s.color}`}>{s.value}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
                  </div>
                  <div className={`w-9 h-9 ${s.bg} rounded-lg flex items-center justify-center`}>
                    <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
                  </div>
                </div>
                <div className="mt-3 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${s.color.replace("text-", "bg-").replace("-600", "-400").replace("-500", "-400")}`}
                    style={{ width: `${(s.value / stats.total) * 100}%` }}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by ID, resident name, category..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as ComplaintStatus | "All")}
                className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
              >
                {STATUS_FILTER.map((s) => (
                  <option key={s} value={s}>
                    {s === "All" ? "All Status" : s}
                  </option>
                ))}
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as ComplaintCategory | "All")}
                className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
              >
                {COMPLAINT_CATEGORIES_FILTER.map((c) => (
                  <option key={c} value={c}>
                    {c === "All" ? "All Categories" : c}
                  </option>
                ))}
              </select>

              {(search || statusFilter !== "All" || categoryFilter !== "All") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("All");
                    setCategoryFilter("All");
                  }}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            {filtered.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-slate-600 text-sm">No complaints match your filters</p>
                <p className="text-slate-400 text-xs mt-1">Try adjusting the search or filter criteria</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80">
                      {[
                        { label: "Complaint ID", field: "complaint_code" as SortField },
                        { label: "Resident", field: "residentName" as SortField },
                        { label: "Category", field: "category" as SortField },
                        { label: "Date Submitted", field: "created_at" as SortField },
                        { label: "Status", field: "status" as SortField },
                      ].map((col) => (
                        <th
                          key={col.field}
                          onClick={() => handleSort(col.field)}
                          className="text-left px-4 py-3 cursor-pointer select-none group"
                        >
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 uppercase tracking-wide hover:text-slate-700 transition-colors">
                            {col.label}
                            <SortIcon field={col.field} />
                          </div>
                        </th>
                      ))}
                      <th className="px-4 py-3 text-xs text-slate-500 uppercase tracking-wide text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((complaint, i) => (
                      <motion.tr
                        key={complaint.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => setSelectedComplaint(complaint)}
                        className={`group hover:bg-slate-50 transition-colors cursor-pointer ${
                          selectedComplaint?.id === complaint.id ? "bg-blue-50/50" : ""
                        }`}
                      >
                        <td className="px-4 py-3.5">
                          <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
                            {complaint.complaint_code}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 bg-[#1e3a5f]/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-[#1e3a5f] text-xs">
                                {(complaint.residentName || "U").charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm text-slate-800">{complaint.residentName || "Unknown"}</p>
                              <p className="text-xs text-slate-400 truncate max-w-[140px]">
                                {complaint.residentEmail || "N/A"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                            {complaint.category}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-slate-500">
                          {new Date(complaint.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={complaint.status} size="sm" />
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedComplaint(complaint);
                            }}
                            className="inline-flex items-center gap-1.5 text-xs text-[#1e3a5f] hover:text-white hover:bg-[#1e3a5f] border border-[#1e3a5f]/20 hover:border-[#1e3a5f] px-3 py-1.5 rounded-lg transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Table footer */}
            {filtered.length > 0 && (
              <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Showing {filtered.length} of {complaints.length} complaints
                </p>
                <div className="flex items-center gap-1">
                  {["Pending", "In Progress", "Resolved"].map((s) => (
                    <div key={s} className="flex items-center gap-1">
                      <StatusBadge status={s as ComplaintStatus} size="sm" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      <AnimatePresence>
        {selectedComplaint && (
          <div className="w-80 flex-shrink-0 border-l border-slate-200 bg-white overflow-hidden">
            <ComplaintDetailPanel
              key={selectedComplaint.id}
              complaint={selectedComplaint}
              onClose={() => setSelectedComplaint(null)}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
