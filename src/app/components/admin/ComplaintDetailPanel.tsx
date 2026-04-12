import { useState } from "react";
import { X, MapPin, Calendar, User, Mail, Tag, MessageSquare, ChevronDown, Check, AlertTriangle } from "lucide-react";
import { motion } from "motion/react";
import { Complaint, ComplaintStatus } from "../../data/mockData";
import { StatusBadge } from "../shared/StatusBadge";
import { useApp } from "../../context/AppContext";

interface ComplaintDetailPanelProps {
  complaint: Complaint;
  onClose: () => void;
}

const statusOptions: ComplaintStatus[] = ["Pending", "In Progress", "Resolved", "Rejected"];

export function ComplaintDetailPanel({ complaint, onClose }: ComplaintDetailPanelProps) {
  const [remarks, setRemarks] = useState(complaint.remarks || "");
  const [status, setStatus] = useState<ComplaintStatus>(complaint.status);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { setComplaints, complaints, setToastMessage } = useApp();

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setComplaints(
        complaints.map((c) =>
          c.id === complaint.id ? { ...c, status, remarks } : c
        )
      );
      setIsSaving(false);
      setSaved(true);
      setToastMessage(`Complaint ${complaint.id} updated successfully.`);
      setTimeout(() => setSaved(false), 2500);
    }, 800);
  };

  const statusColor: Record<ComplaintStatus, string> = {
    Pending: "text-amber-700 bg-amber-50 border-amber-200",
    "In Progress": "text-blue-700 bg-blue-50 border-blue-200",
    Resolved: "text-emerald-700 bg-emerald-50 border-emerald-200",
    Rejected: "text-red-700 bg-red-50 border-red-200",
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ type: "spring", stiffness: 350, damping: 35 }}
      className="h-full flex flex-col bg-white border-l border-slate-200 w-full max-w-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-0.5">Complaint Details</p>
          <h3 className="text-slate-800 text-base">{complaint.id}</h3>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Status */}
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 uppercase tracking-wide">Current Status</span>
            <StatusBadge status={complaint.status} />
          </div>
        </div>

        {/* Meta info */}
        <div className="px-5 py-4 space-y-3 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <User className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Resident</p>
              <p className="text-sm text-slate-800">{complaint.residentName}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Email</p>
              <p className="text-sm text-slate-700">{complaint.residentEmail}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <Tag className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Category</p>
              <p className="text-sm text-slate-800">{complaint.category}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Date Submitted</p>
              <p className="text-sm text-slate-800">{complaint.dateSubmitted}</p>
            </div>
          </div>
          {complaint.location && (
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Location</p>
                <p className="text-sm text-slate-800">{complaint.location}</p>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Description</p>
          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-3">
            {complaint.description}
          </p>
        </div>

        {/* Admin Actions */}
        <div className="px-5 py-4 space-y-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Update Status</p>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ComplaintStatus)}
                className={`w-full appearance-none px-3.5 py-2.5 text-sm rounded-xl border-2 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all cursor-pointer pr-9 ${statusColor[status]}`}
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none opacity-50" />
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              Admin Remarks
            </p>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add remarks, actions taken, or instructions for the resident..."
              rows={4}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all resize-none"
            />
          </div>

          {/* Warning for rejected */}
          {status === "Rejected" && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">
                Rejecting a complaint will notify the resident. Please add remarks explaining the reason.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="px-5 py-4 border-t border-slate-200 bg-white flex-shrink-0">
        <button
          onClick={handleSave}
          disabled={isSaving || saved}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm transition-all ${
            saved
              ? "bg-emerald-500 text-white"
              : "bg-[#1e3a5f] hover:bg-[#162d4a] text-white"
          } disabled:opacity-80`}
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : saved ? (
            <>
              <Check className="w-4 h-4" />
              Saved Successfully
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </motion.div>
  );
}
