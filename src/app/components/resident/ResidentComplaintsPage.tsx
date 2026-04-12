import { useState, useMemo } from "react";
import { Search, X, FileText, MapPin, Calendar, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { StatusBadge } from "../shared/StatusBadge";
import { ComplaintSubmissionModal } from "./ComplaintSubmissionModal";
import { useApp } from "../../context/AppContext";
import { ComplaintCategory, ComplaintStatus } from "../../data/mockData";

const STATUS_OPTIONS: (ComplaintStatus | "All")[] = ["All", "Pending", "In Progress", "Resolved", "Rejected"];
const CATEGORY_OPTIONS: (ComplaintCategory | "All")[] = [
  "All", "Road & Infrastructure", "Waste Management", "Public Safety",
  "Noise Complaint", "Street Lighting", "Water & Drainage", "Public Health", "Other",
];

export function ResidentComplaintsPage() {
  const { residentComplaints } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | "All">("All");
  const [categoryFilter, setCategoryFilter] = useState<ComplaintCategory | "All">("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = [...residentComplaints];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "All") result = result.filter((c) => c.status === statusFilter);
    if (categoryFilter !== "All") result = result.filter((c) => c.category === categoryFilter);
    return result;
  }, [residentComplaints, search, statusFilter, categoryFilter]);

  const counts = {
    pending: residentComplaints.filter((c) => c.status === "Pending").length,
    inProgress: residentComplaints.filter((c) => c.status === "In Progress").length,
    resolved: residentComplaints.filter((c) => c.status === "Resolved").length,
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto bg-slate-50">
        {/* Page Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-5">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-slate-800">My Complaints</h1>
              <p className="text-slate-500 text-sm mt-0.5">
                {residentComplaints.length} total submissions
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#162d4a] text-white px-4 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-[#1e3a5f]/20"
            >
              <Plus className="w-4 h-4" />
              New Complaint
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-6 space-y-5">
          {/* Status Quick Filters */}
          <div className="flex gap-3 flex-wrap">
            {[
              { label: "All", value: "All" as const, count: residentComplaints.length, color: "border-slate-300 text-slate-600 bg-white" },
              { label: "Pending", value: "Pending" as const, count: counts.pending, color: "border-amber-300 text-amber-700 bg-amber-50" },
              { label: "In Progress", value: "In Progress" as const, count: counts.inProgress, color: "border-blue-300 text-blue-700 bg-blue-50" },
              { label: "Resolved", value: "Resolved" as const, count: counts.resolved, color: "border-emerald-300 text-emerald-700 bg-emerald-50" },
            ].map((chip) => (
              <button
                key={chip.label}
                onClick={() => setStatusFilter(chip.value)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-sm transition-all ${
                  statusFilter === chip.value
                    ? `${chip.color} shadow-sm`
                    : "border-slate-200 text-slate-500 bg-white hover:border-slate-300"
                }`}
              >
                {chip.label}
                <span className={`text-xs rounded-full px-1.5 py-0.5 ${statusFilter === chip.value ? "bg-white/60" : "bg-slate-100"}`}>
                  {chip.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search & Filters */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by ID, category, or description..."
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
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as ComplaintCategory | "All")}
                className="px-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c === "All" ? "All Categories" : c}
                  </option>
                ))}
              </select>
              {(search || statusFilter !== "All" || categoryFilter !== "All") && (
                <button
                  onClick={() => { setSearch(""); setStatusFilter("All"); setCategoryFilter("All"); }}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 px-3 py-2 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              {filtered.length} complaint{filtered.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-7 h-7 text-slate-400" />
              </div>
              <h3 className="text-slate-600 mb-2">No complaints found</h3>
              <p className="text-slate-400 text-sm mb-5">
                {search || statusFilter !== "All" || categoryFilter !== "All"
                  ? "Try adjusting your search or filter criteria"
                  : "You haven't submitted any complaints yet"}
              </p>
              {!(search || statusFilter !== "All" || categoryFilter !== "All") && (
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center gap-2 bg-[#1e3a5f] text-white px-5 py-2.5 rounded-xl text-sm hover:bg-[#162d4a] transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Submit Complaint
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((complaint, i) => (
                <motion.div
                  key={complaint.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:border-slate-300 transition-colors"
                >
                  <div
                    className="p-5 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === complaint.id ? null : complaint.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                            {complaint.id}
                          </span>
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {complaint.category}
                          </span>
                        </div>
                        <p className="text-slate-700 text-sm leading-relaxed line-clamp-2">
                          {complaint.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 flex-wrap">
                          {complaint.location && (
                            <span className="flex items-center gap-1 text-xs text-slate-400">
                              <MapPin className="w-3 h-3" />
                              {complaint.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Calendar className="w-3 h-3" />
                            {complaint.dateSubmitted}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <StatusBadge status={complaint.status} />
                        {expandedId === complaint.id ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {expandedId === complaint.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 border-t border-slate-100">
                          <div className="pt-4 space-y-3">
                            <div>
                              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1.5">
                                Full Description
                              </p>
                              <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 leading-relaxed">
                                {complaint.description}
                              </p>
                            </div>
                            {complaint.remarks ? (
                              <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1.5">
                                  Official Remarks
                                </p>
                                <p className="text-sm text-slate-700 bg-blue-50 border border-blue-100 rounded-lg p-3 leading-relaxed">
                                  {complaint.remarks}
                                </p>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 italic">
                                No official remarks yet. Your complaint is being reviewed.
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showModal && <ComplaintSubmissionModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </>
  );
}
