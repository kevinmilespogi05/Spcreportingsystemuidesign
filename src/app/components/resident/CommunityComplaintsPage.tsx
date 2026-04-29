import { useState, useMemo, useEffect } from "react";
import {
  Search, X, FileText, MapPin, Calendar,
  ChevronDown, ChevronUp, Users, ZoomIn, ImageIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { StatusBadge } from "../shared/StatusBadge";
import { useApp } from "../../context/AppContext";
import { ComplaintStatus } from "../../../lib/complaintService";

const COMPLAINT_CATEGORIES = [
  "Road & Infrastructure",
  "Waste Management",
  "Public Safety",
  "Noise Complaint",
  "Street Lighting",
  "Water & Drainage",
  "Public Health",
  "Other",
] as const;
type ComplaintCategory = (typeof COMPLAINT_CATEGORIES)[number];
const CATEGORY_OPTIONS: (ComplaintCategory | "All")[] = ["All", ...COMPLAINT_CATEGORIES];

export function CommunityComplaintsPage() {
  const { complaints, complaintsLoading, fetchPublicComplaints, user } = useApp();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | "All">("All");
  const [categoryFilter, setCategoryFilter] = useState<ComplaintCategory | "All">("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Fetch all community complaints on mount
  useEffect(() => {
    const load = async () => {
      setLoadError(null);
      const res = await fetchPublicComplaints();
      if (!res.success) setLoadError(res.error || "Failed to load community complaints");
    };
    if (user) load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const filtered = useMemo(() => {
    let result = [...complaints];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.complaint_code.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q) ||
          (c.location ?? "").toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "All") result = result.filter((c) => c.status === statusFilter);
    if (categoryFilter !== "All") result = result.filter((c) => c.category === categoryFilter);
    return result;
  }, [complaints, search, statusFilter, categoryFilter]);

  const counts = {
    pending:    complaints.filter((c) => c.status === "Pending").length,
    inProgress: complaints.filter((c) => c.status === "In Progress").length,
    resolved:   complaints.filter((c) => c.status === "Resolved").length,
  };

  if (loadError) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-50">
        <div className="bg-white border-b border-slate-200 px-6 py-5">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-slate-800">Community Complaints</h1>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 text-sm">{loadError}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-5">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <Users className="w-5 h-5 text-[#1e3a5f]" />
                <h1 className="text-slate-800">Community Complaints</h1>
              </div>
              <p className="text-slate-500 text-sm mt-0.5">
                {complaintsLoading
                  ? "Loading…"
                  : `${complaints.length} total complaint${complaints.length !== 1 ? "s" : ""} from the community`}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-6 space-y-5">
          {/* Status chips */}
          <div className="flex gap-3 flex-wrap">
            {[
              { label: "All",         value: "All"         as const, count: complaints.length, color: "border-slate-300 text-slate-600 bg-white" },
              { label: "Pending",     value: "Pending"     as const, count: counts.pending,    color: "border-amber-300 text-amber-700 bg-amber-50" },
              { label: "In Progress", value: "In Progress" as const, count: counts.inProgress, color: "border-blue-300 text-blue-700 bg-blue-50" },
              { label: "Resolved",    value: "Resolved"    as const, count: counts.resolved,   color: "border-emerald-300 text-emerald-700 bg-emerald-50" },
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

          {/* Search & category filter */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by ID, category, location, or description…"
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
                  <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>
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

          {/* Result count */}
          <p className="text-sm text-slate-500">
            {complaintsLoading
              ? "Loading…"
              : `${filtered.length} complaint${filtered.length !== 1 ? "s" : ""} found`}
          </p>

          {/* List */}
          {complaintsLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-1/3 mb-3" />
                  <div className="h-3 bg-slate-100 rounded w-2/3" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-7 h-7 text-slate-400" />
              </div>
              <h3 className="text-slate-600 mb-2">No complaints found</h3>
              <p className="text-slate-400 text-sm">
                {search || statusFilter !== "All" || categoryFilter !== "All"
                  ? "Try adjusting your search or filter criteria"
                  : "No community complaints have been submitted yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((complaint, i) => (
                <motion.div
                  key={complaint.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:border-slate-300 transition-colors"
                >
                  {/* ── Image banner — visual title ── */}
                  {complaint.image_url && (
                    <div
                      className="relative w-full h-44 bg-slate-100 overflow-hidden cursor-pointer"
                      onClick={() => setExpandedId(expandedId === complaint.id ? null : complaint.id)}
                    >
                      <img
                        src={complaint.image_url}
                        alt={`Photo for ${complaint.complaint_code}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                      <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-white/80" />
                        <span className="text-white/90 text-xs font-medium">Photo attached</span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <StatusBadge status={complaint.status} />
                      </div>
                    </div>
                  )}

                  {/* Summary row */}
                  <div
                    className="p-5 cursor-pointer"
                    onClick={() => setExpandedId(expandedId === complaint.id ? null : complaint.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Chips */}
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                            {complaint.complaint_code}
                          </span>
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            {complaint.category}
                          </span>
                          {complaint.image_url && (
                            <span className="text-xs text-blue-500 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <ImageIcon className="w-3 h-3" />
                              Photo
                            </span>
                          )}
                        </div>

                        {/* Complainant name */}
                        {complaint.residentName && (
                          <div className="flex items-center gap-1.5 mb-2">
                            <div className="w-5 h-5 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-[#1e3a5f] text-[10px] leading-none">
                                {(complaint.residentName ?? "?").charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-xs text-slate-500">{complaint.residentName}</span>
                          </div>
                        )}

                        {/* Description preview */}
                        <p className="text-slate-700 text-sm leading-relaxed line-clamp-2">
                          {complaint.description}
                        </p>

                        {/* Meta */}
                        <div className="flex items-center gap-4 mt-2 flex-wrap">
                          {complaint.location && (
                            <span className="flex items-center gap-1 text-xs text-slate-400">
                              <MapPin className="w-3 h-3" />
                              {complaint.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Calendar className="w-3 h-3" />
                            {new Date(complaint.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        {!complaint.image_url && <StatusBadge status={complaint.status} />}
                        {expandedId === complaint.id
                          ? <ChevronUp className="w-4 h-4 text-slate-400" />
                          : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded */}
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
                            {/* Image viewer */}
                            {complaint.image_url && (
                              <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Attachment</p>
                                <button
                                  onClick={() => setLightboxUrl(complaint.image_url!)}
                                  className="group relative w-full rounded-lg overflow-hidden bg-slate-100 border border-slate-200 aspect-video flex items-center justify-center hover:border-[#1e3a5f]/40 hover:shadow-md transition-all"
                                >
                                  <img
                                    src={complaint.image_url}
                                    alt="Complaint attachment"
                                    className="w-full h-full object-cover group-hover:opacity-85 transition-opacity"
                                  />
                                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 bg-white/90 text-slate-800 text-xs font-medium px-3 py-1.5 rounded-full shadow">
                                      <ZoomIn className="w-3.5 h-3.5" />
                                      View Full Image
                                    </div>
                                  </div>
                                </button>
                              </div>
                            )}

                            {/* Remarks */}
                            {complaint.remarks ? (
                              <div>
                                <p className="text-xs text-slate-500 uppercase tracking-wide mb-1.5">Official Remarks</p>
                                <p className="text-sm text-slate-700 bg-blue-50 border border-blue-100 rounded-lg p-3 leading-relaxed">
                                  {complaint.remarks}
                                </p>
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400 italic">
                                No official remarks yet.
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

      {/* Image lightbox */}
      <AnimatePresence>
        {lightboxUrl && (
          <motion.div
            key="community-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setLightboxUrl(null)}
          >
            <motion.div
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.93, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="relative max-w-4xl max-h-[90vh] w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
                <p className="text-sm text-slate-700 font-medium">Complaint Attachment</p>
                <button
                  onClick={() => setLightboxUrl(null)}
                  className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-auto flex items-center justify-center bg-slate-100 min-h-[300px]">
                <img
                  src={lightboxUrl}
                  alt="Complaint attachment full view"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                <p className="text-xs text-slate-400">Click outside or press Escape to close</p>
                <a
                  href={lightboxUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-[#1e3a5f] hover:bg-[#162d4a] text-white px-4 py-2 rounded-lg transition-all"
                >
                  Open in new tab
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
