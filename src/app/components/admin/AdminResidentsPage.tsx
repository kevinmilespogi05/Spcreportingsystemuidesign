import { useState, useMemo } from "react";
import { Search, X, Users, Mail, FileText, Clock, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "../../context/AppContext";
import { Complaint } from "../../data/mockData";
import { StatusBadge } from "../shared/StatusBadge";

interface ResidentRecord {
  name: string;
  email: string;
  complaints: Complaint[];
  pending: number;
  inProgress: number;
  resolved: number;
  lastSubmitted: string;
}

export function AdminResidentsPage() {
  const { complaints } = useApp();
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<"name" | "complaints" | "lastSubmitted">("complaints");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [expandedEmail, setExpandedEmail] = useState<string | null>(null);

  const residents = useMemo<ResidentRecord[]>(() => {
    const map = new Map<string, ResidentRecord>();
    complaints.forEach((c) => {
      if (!map.has(c.residentEmail)) {
        map.set(c.residentEmail, {
          name: c.residentName,
          email: c.residentEmail,
          complaints: [],
          pending: 0,
          inProgress: 0,
          resolved: 0,
          lastSubmitted: c.dateSubmitted,
        });
      }
      const rec = map.get(c.residentEmail)!;
      rec.complaints.push(c);
      if (c.status === "Pending") rec.pending++;
      if (c.status === "In Progress") rec.inProgress++;
      if (c.status === "Resolved") rec.resolved++;
      if (c.dateSubmitted > rec.lastSubmitted) rec.lastSubmitted = c.dateSubmitted;
    });
    return Array.from(map.values());
  }, [complaints]);

  const filtered = useMemo(() => {
    let result = [...residents];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      let valA: string | number = "";
      let valB: string | number = "";
      if (sortField === "name") { valA = a.name; valB = b.name; }
      if (sortField === "complaints") { valA = a.complaints.length; valB = b.complaints.length; }
      if (sortField === "lastSubmitted") { valA = a.lastSubmitted; valB = b.lastSubmitted; }
      const cmp = valA < valB ? -1 : valA > valB ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [residents, search, sortField, sortDir]);

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const SortIcon = ({ field }: { field: typeof sortField }) =>
    sortField !== field ? null : sortDir === "asc" ? (
      <ChevronUp className="w-3.5 h-3.5 text-[#1e3a5f]" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-[#1e3a5f]" />
    );

  const totalResidents = residents.length;
  const activeResidents = residents.filter((r) => r.complaints.length > 0).length;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-slate-800">Residents</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {totalResidents} registered resident{totalResidents !== 1 ? "s" : ""} in the system
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-xs text-slate-400">Active filers</p>
              <p className="text-sm text-slate-700">{activeResidents} residents</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-5">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Residents", value: totalResidents, icon: Users, color: "text-slate-600", bg: "bg-slate-100", border: "border-slate-200" },
            { label: "With Pending", value: residents.filter((r) => r.pending > 0).length, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
            { label: "With In Progress", value: residents.filter((r) => r.inProgress > 0).length, icon: AlertCircle, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
            { label: "Fully Resolved", value: residents.filter((r) => r.resolved > 0 && r.pending === 0 && r.inProgress === 0).length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
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
            </motion.div>
          ))}
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search residents by name or email..."
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
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">No residents found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80">
                      <th
                        className="text-left px-4 py-3 cursor-pointer select-none"
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 uppercase tracking-wide">
                          Resident <SortIcon field="name" />
                        </div>
                      </th>
                      <th
                        className="text-left px-4 py-3 cursor-pointer select-none"
                        onClick={() => handleSort("complaints")}
                      >
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 uppercase tracking-wide">
                          Complaints <SortIcon field="complaints" />
                        </div>
                      </th>
                      <th className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-wide">
                        Status Breakdown
                      </th>
                      <th
                        className="text-left px-4 py-3 cursor-pointer select-none"
                        onClick={() => handleSort("lastSubmitted")}
                      >
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 uppercase tracking-wide">
                          Last Submitted <SortIcon field="lastSubmitted" />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-xs text-slate-500 uppercase tracking-wide text-right">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((resident, i) => (
                      <>
                        <motion.tr
                          key={resident.email}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.04 }}
                          className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                            expandedEmail === resident.email ? "bg-blue-50/30" : ""
                          }`}
                          onClick={() =>
                            setExpandedEmail(
                              expandedEmail === resident.email ? null : resident.email
                            )
                          }
                        >
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 bg-[#1e3a5f]/10 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-[#1e3a5f] text-xs">
                                  {resident.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="text-sm text-slate-800">{resident.name}</p>
                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                  <Mail className="w-3 h-3" />
                                  {resident.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-sm text-slate-700">
                                {resident.complaints.length}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              {resident.pending > 0 && (
                                <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                  {resident.pending} pending
                                </span>
                              )}
                              {resident.inProgress > 0 && (
                                <span className="text-xs text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                                  {resident.inProgress} active
                                </span>
                              )}
                              {resident.resolved > 0 && (
                                <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                  {resident.resolved} resolved
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-sm text-slate-500">
                            {resident.lastSubmitted}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            {expandedEmail === resident.email ? (
                              <ChevronUp className="w-4 h-4 text-slate-400 ml-auto" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-slate-400 ml-auto" />
                            )}
                          </td>
                        </motion.tr>

                        <AnimatePresence>
                          {expandedEmail === resident.email && (
                            <tr key={`${resident.email}-expanded`}>
                              <td colSpan={5} className="p-0">
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden bg-slate-50 border-b border-slate-100"
                                >
                                  <div className="px-6 py-4">
                                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">
                                      Complaint History for {resident.name}
                                    </p>
                                    <div className="space-y-2">
                                      {resident.complaints.map((c) => (
                                        <div
                                          key={c.id}
                                          className="flex items-center gap-3 bg-white rounded-lg border border-slate-200 px-3.5 py-2.5"
                                        >
                                          <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded flex-shrink-0">
                                            {c.id}
                                          </span>
                                          <span className="text-xs text-slate-600 flex-1 truncate">
                                            {c.category}
                                          </span>
                                          <span className="text-xs text-slate-400">{c.dateSubmitted}</span>
                                          <StatusBadge status={c.status} size="sm" />
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </motion.div>
                              </td>
                            </tr>
                          )}
                        </AnimatePresence>
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                <p className="text-xs text-slate-400">
                  Showing {filtered.length} of {residents.length} residents
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
