import { useState } from "react";
import { Plus, Clock, CheckCircle2, AlertCircle, FileText, ArrowRight, MapPin, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { StatusBadge } from "../shared/StatusBadge";
import { ComplaintSubmissionModal } from "./ComplaintSubmissionModal";
import { useApp } from "../../context/AppContext";
import { Complaint } from "../../data/mockData";

const statusCounts = (complaints: Complaint[]) => ({
  total: complaints.length,
  pending: complaints.filter((c) => c.status === "Pending").length,
  inProgress: complaints.filter((c) => c.status === "In Progress").length,
  resolved: complaints.filter((c) => c.status === "Resolved").length,
});

export function ResidentDashboard() {
  const [showModal, setShowModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const { residentComplaints } = useApp();
  const counts = statusCounts(residentComplaints);

  return (
    <>
      <div className="flex-1 overflow-y-auto bg-slate-50">
        {/* Page Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-5">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-slate-800">My Dashboard</h1>
              <p className="text-slate-500 text-sm mt-0.5">
                Track and manage your submitted complaints
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#162d4a] text-white px-4 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-[#1e3a5f]/20"
            >
              <Plus className="w-4 h-4" />
              Submit New Complaint
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Total Submitted",
                value: counts.total,
                icon: FileText,
                color: "text-slate-600",
                bg: "bg-slate-100",
                border: "border-slate-200",
              },
              {
                label: "Pending",
                value: counts.pending,
                icon: Clock,
                color: "text-amber-600",
                bg: "bg-amber-50",
                border: "border-amber-200",
              },
              {
                label: "In Progress",
                value: counts.inProgress,
                icon: AlertCircle,
                color: "text-blue-600",
                bg: "bg-blue-50",
                border: "border-blue-200",
              },
              {
                label: "Resolved",
                value: counts.resolved,
                icon: CheckCircle2,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
                border: "border-emerald-200",
              },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`bg-white rounded-xl border ${stat.border} p-4 shadow-sm`}
              >
                <div className={`w-9 h-9 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
                  <stat.icon className={`w-4.5 h-4.5 ${stat.color}`} />
                </div>
                <p className={`text-2xl ${stat.color}`}>{stat.value}</p>
                <p className="text-slate-500 text-xs mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* CTA Banner */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-gradient-to-r from-[#0f2744] to-[#1a4f8a] rounded-2xl p-6 flex items-center justify-between overflow-hidden relative"
          >
            <div className="absolute right-0 top-0 w-64 h-full opacity-10"
              style={{
                backgroundImage: `radial-gradient(circle at 70% 50%, white 1px, transparent 1px)`,
                backgroundSize: "24px 24px",
              }}
            />
            <div className="relative z-10">
              <h3 className="text-white mb-1">Have a new concern?</h3>
              <p className="text-blue-200/70 text-sm max-w-sm">
                Submit a complaint and let your local government know. We're here to help.
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="relative z-10 flex items-center gap-2 bg-white text-[#1e3a5f] px-5 py-2.5 rounded-xl text-sm hover:bg-blue-50 transition-all flex-shrink-0 shadow-lg"
            >
              <Plus className="w-4 h-4" />
              New Complaint
            </button>
          </motion.div>

          {/* Recent Activity Feed */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-slate-700 text-lg">Recent Complaints</h2>
              <span className="text-xs text-slate-400">{residentComplaints.length} total</span>
            </div>

            {residentComplaints.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-7 h-7 text-slate-400" />
                </div>
                <h3 className="text-slate-600 mb-2">No complaints yet</h3>
                <p className="text-slate-400 text-sm mb-6">
                  Submit your first complaint to get started
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center gap-2 bg-[#1e3a5f] text-white px-5 py-2.5 rounded-xl text-sm hover:bg-[#162d4a] transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Submit Complaint
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {residentComplaints.map((complaint, i) => (
                  <motion.div
                    key={complaint.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    onClick={() => setSelectedComplaint(selectedComplaint?.id === complaint.id ? null : complaint)}
                    className="bg-white rounded-xl border border-slate-200 p-4 cursor-pointer hover:border-[#1e3a5f]/30 hover:shadow-md shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
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
                      <div className="flex-shrink-0 flex flex-col items-end gap-2">
                        <StatusBadge status={complaint.status} />
                        <ArrowRight className="w-4 h-4 text-slate-300" />
                      </div>
                    </div>

                    {/* Expanded remarks */}
                    <AnimatePresence>
                      {selectedComplaint?.id === complaint.id && complaint.remarks && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-4 overflow-hidden"
                        >
                          <div className="pt-4 border-t border-slate-100">
                            <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">
                              Admin Remarks
                            </p>
                            <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 leading-relaxed">
                              {complaint.remarks}
                            </p>
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
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && <ComplaintSubmissionModal onClose={() => setShowModal(false)} />}
      </AnimatePresence>
    </>
  );
}
