import { useState, useEffect } from "react";
import { X, MapPin, Calendar, User, Mail, Tag, MessageSquare, ChevronDown, Check, AlertTriangle, Trash2, ZoomIn } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Complaint, ComplaintStatus } from "../../lib/complaintService";
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const { updateComplaintStatus, deleteComplaint, setToastMessage } = useApp();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await updateComplaintStatus(complaint.id, status, remarks);
      if (response.success) {
        setSaved(true);
        setToastMessage(response.message);
        setTimeout(() => setSaved(false), 2500);
      } else {
        setToastMessage(response.error || "Failed to update complaint. Please try again.");
      }
    } catch (error) {
      setToastMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await deleteComplaint(complaint.id);
      if (response.success) {
        setToastMessage(response.message);
        setTimeout(() => onClose(), 500);
      } else {
        setToastMessage(response.error || "Failed to delete complaint. Please try again.");
      }
    } catch (error) {
      setToastMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Handle Escape key to close image viewer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showImageViewer) {
        setShowImageViewer(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showImageViewer]);

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
          <h3 className="text-slate-800 text-base">{complaint.complaint_code}</h3>
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
              <p className="text-sm text-slate-800">{complaint.residentName || "Unknown"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Email</p>
              <p className="text-sm text-slate-700">{complaint.residentEmail || "N/A"}</p>
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
              <p className="text-sm text-slate-800">{new Date(complaint.created_at).toLocaleDateString()}</p>
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

        {/* Image Attachment */}
        {complaint.image_url && (
          <div className="px-5 py-4 border-b border-slate-100">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">Attachment</p>
            <button
              onClick={() => setShowImageViewer(true)}
              className="relative rounded-lg overflow-hidden bg-slate-100 border border-slate-200 aspect-video flex items-center justify-center hover:border-[#1e3a5f] hover:shadow-md transition-all group w-full cursor-pointer"
            >
              <img
                src={complaint.image_url}
                alt="Complaint attachment"
                className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors">
                <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          </div>
        )}

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
      <div className="px-5 py-4 border-t border-slate-200 bg-white flex-shrink-0 space-y-2">
        {showDeleteConfirm ? (
          <>
            <p className="text-xs text-slate-600 mb-2">
              Are you sure? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 py-2 px-3 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all disabled:opacity-70"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <>
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
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-all"
            >
              <Trash2 className="w-3 h-3" />
              Delete Complaint
            </button>
          </>
        )}
      </div>

      {/* Image Viewer Modal */}
      <AnimatePresence>
        {showImageViewer && complaint.image_url && (
          <motion.div
            key="image-viewer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => setShowImageViewer(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative max-w-4xl max-h-[90vh] w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
                <h3 className="text-lg font-semibold text-slate-800">
                  {complaint.complaint_code} - Attachment
                </h3>
                <button
                  onClick={() => setShowImageViewer(false)}
                  className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Image */}
              <div className="flex-1 overflow-auto flex items-center justify-center bg-slate-100">
                <img
                  src={complaint.image_url}
                  alt="Complaint attachment - full view"
                  className="max-w-full max-h-full object-contain"
                />
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Click anywhere to close or press Escape
                </p>
                <a
                  href={complaint.image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-[#1e3a5f] hover:bg-[#162d4a] text-white px-4 py-2 rounded-lg transition-all"
                >
                  Open in New Tab
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
