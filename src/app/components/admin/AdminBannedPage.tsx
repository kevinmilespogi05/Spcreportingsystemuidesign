import React, { useState, useMemo, useEffect } from "react";
import { Search, X, Users, Mail, Clock, ChevronDown, ChevronUp, Unlock, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "../../context/AppContext";
import { supabase } from "../../../lib/supabase";

interface BannedResident {
  id: string;
  name: string;
  email: string;
  banned_at: string;
}

export function AdminBannedPage() {
  const { unbanResident, setToastMessage } = useApp();
  const [search, setSearch] = useState("");
  const [bannedResidents, setBannedResidents] = useState<BannedResident[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanding, setExpanding] = useState<string | null>(null);
  const [unbanning, setUnbanning] = useState<string | null>(null);
  const [residentToUnban, setResidentToUnban] = useState<BannedResident | null>(null);
  const [confirmingUnban, setConfirmingUnban] = useState(false);

  // Fetch banned residents
  useEffect(() => {
    const fetchBannedResidents = async () => {
      try {
        const { data, error } = await supabase
          .from("residents")
          .select("id, full_name, email, updated_at")
          .eq("status", "banned")
          .order("updated_at", { ascending: false });

        if (error) throw error;

        const residents = (data || []).map((r: any) => ({
          id: r.id,
          name: r.full_name || "Unknown",
          email: r.email || "Unknown",
          banned_at: r.updated_at,
        }));

        setBannedResidents(residents);
      } catch (error) {
        console.error("Failed to fetch banned residents:", error);
        setToastMessage("Failed to load banned residents");
      } finally {
        setLoading(false);
      }
    };

    fetchBannedResidents();
  }, [setToastMessage]);

  const filtered = useMemo(() => {
    if (!search) return bannedResidents;

    const q = search.toLowerCase();
    return bannedResidents.filter(
      (r) => r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q)
    );
  }, [bannedResidents, search]);

  const handleUnban = async () => {
    if (!residentToUnban) return;

    setConfirmingUnban(true);
    setUnbanning(residentToUnban.id);

    try {
      const response = await unbanResident(residentToUnban.id);

      if (response.success) {
        setToastMessage(response.message);
        // Remove from local list
        setBannedResidents((prev) =>
          prev.filter((r) => r.id !== residentToUnban.id)
        );
        setResidentToUnban(null);
      } else {
        setToastMessage(response.error || response.message);
      }
    } finally {
      setConfirmingUnban(false);
      setUnbanning(null);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-slate-800">Banned Residents</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              Manage and review banned residents in the system
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-xs text-slate-400">Total banned</p>
              <p className="text-sm text-slate-700">{bannedResidents.length} residents</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-5">
        {/* Search */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search banned residents by name or email..."
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
          {loading ? (
            <div className="py-16 text-center">
              <div className="w-8 h-8 border-4 border-slate-200 border-t-[#1e3a5f] rounded-full animate-spin mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Loading banned residents...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              {bannedResidents.length === 0 ? (
                <>
                  <AlertCircle className="w-10 h-10 text-emerald-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No banned residents</p>
                </>
              ) : (
                <>
                  <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No residents match your search</p>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/80">
                      <th className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-wide">
                        Resident
                      </th>
                      <th className="text-left px-4 py-3 text-xs text-slate-500 uppercase tracking-wide">
                        Banned Date
                      </th>
                      <th className="px-4 py-3 text-xs text-slate-500 uppercase tracking-wide text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((resident, i) => (
                      <motion.tr
                        key={resident.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-red-700 text-xs">
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
                          <div className="flex items-center gap-1.5 text-sm text-slate-500">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(resident.banned_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => setResidentToUnban(resident)}
                            disabled={unbanning === resident.id}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Unban resident"
                          >
                            <Unlock className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50">
                <p className="text-xs text-slate-400">
                  Showing {filtered.length} of {bannedResidents.length} banned residents
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Unban Confirmation Dialog */}
      <AnimatePresence>
        {residentToUnban && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => !confirmingUnban && setResidentToUnban(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-lg max-w-md w-full"
            >
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-semibold text-slate-900">Unban Resident?</h3>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-slate-600">
                  Are you sure you want to unban <span className="font-semibold text-slate-900">{residentToUnban.name}</span>?
                </p>
                <p className="text-sm text-slate-500">
                  This resident will be able to submit and view complaints again. They will have full access to their account.
                </p>
              </div>
              <div className="p-6 border-t border-slate-100 flex gap-3">
                <button
                  onClick={() => setResidentToUnban(null)}
                  disabled={confirmingUnban}
                  className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUnban}
                  disabled={confirmingUnban}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {confirmingUnban && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Unban
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
