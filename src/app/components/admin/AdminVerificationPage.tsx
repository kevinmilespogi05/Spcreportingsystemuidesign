import { useState, useEffect } from "react";
import { Eye, CheckCircle, XCircle, Clock, AlertCircle, Search, Filter } from "lucide-react";
import {
  getPendingVerifications,
  getApprovedUsers,
  getRejectedUsers,
  approveUser,
  rejectUser,
} from "../../../lib/complaintService";
import { ScrollArea } from "../ui/scroll-area";

interface PendingUser {
  id: string;
  full_name: string;
  email: string;
  id_type: string;
  id_front_url: string | null;
  id_back_url: string | null;
  created_at: string;
  rejection_reason?: string | null;
}

interface ApprovalModalProps {
  user: PendingUser | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (userId: string) => void;
  onReject: (userId: string, reason: string) => void;
}

function ApprovalModal({ user, isOpen, onClose, onApprove, onReject }: ApprovalModalProps) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !user) return null;

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await onApprove(user.id);
      onClose();
    } catch (error) {
      console.error("Approval error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    setIsProcessing(true);
    try {
      await onReject(user.id, rejectionReason.trim());
      onClose();
    } catch (error) {
      console.error("Rejection error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const ID_TYPE_LABELS: Record<string, string> = {
    philsys_national_id: "PhilSys National ID",
    drivers_license: "Driver's License",
    passport: "Passport",
    voters_id: "Voter's ID",
    postal_id: "Postal ID",
    umid: "UMID",
    senior_citizen_id: "Senior Citizen ID",
    barangay_id: "Barangay ID",
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800">Review User Registration</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"
            >
              <XCircle className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* User Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-600">Full Name</label>
                <p className="text-lg font-medium text-slate-800">{user.full_name}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Email</label>
                <p className="text-slate-700">{user.email}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">ID Type</label>
                <p className="text-slate-700">{ID_TYPE_LABELS[user.id_type] || user.id_type}</p>
              </div>
              <div>
                <label className="text-sm text-slate-600">Registration Date</label>
                <p className="text-slate-700">{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {/* ID Images */}
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-600 mb-2 block">ID Front</label>
                {user.id_front_url ? (
                  <img
                    src={user.id_front_url}
                    alt="ID Front"
                    className="w-full h-32 object-cover rounded-lg border border-slate-200"
                  />
                ) : (
                  <div className="w-full h-32 bg-slate-100 rounded-lg flex items-center justify-center">
                    <span className="text-slate-500">No image</span>
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm text-slate-600 mb-2 block">ID Back (Optional)</label>
                {user.id_back_url ? (
                  <img
                    src={user.id_back_url}
                    alt="ID Back"
                    className="w-full h-32 object-cover rounded-lg border border-slate-200"
                  />
                ) : (
                  <div className="w-full h-32 bg-slate-100 rounded-lg flex items-center justify-center">
                    <span className="text-slate-500">No image</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rejection Reason Input */}
          <div className="mb-6">
            <label className="text-sm text-slate-600 mb-2 block">
              Rejection Reason (required for rejection)
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Please provide a reason for rejection..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              rows={3}
            />
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={isProcessing}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" />
              {isProcessing ? "Processing..." : "Reject"}
            </button>
            <button
              onClick={handleApprove}
              disabled={isProcessing}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              {isProcessing ? "Processing..." : "Approve"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface RejectedDetailsModalProps {
  user: PendingUser | null;
  isOpen: boolean;
  onClose: () => void;
}

function RejectedDetailsModal({ user, isOpen, onClose }: RejectedDetailsModalProps) {
  if (!isOpen || !user) return null;

  const ID_TYPE_LABELS: Record<string, string> = {
    philsys_national_id: "PhilSys National ID",
    drivers_license: "Driver's License",
    passport: "Passport",
    voters_id: "Voter's ID",
    postal_id: "Postal ID",
    umid: "UMID",
    senior_citizen_id: "Senior Citizen ID",
    barangay_id: "Barangay ID",
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Rejected User Details</h2>
            <p className="text-sm text-slate-600">Review the submitted information and rejection reason.</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg hover:bg-slate-100 flex items-center justify-center"
          >
            <XCircle className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4 rounded-2xl bg-slate-50 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Submitted Information</h3>
              <div>
                <p className="text-xs text-slate-500">Full Name</p>
                <p className="text-base font-medium text-slate-900">{user.full_name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="text-base text-slate-700">{user.email}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">ID Type</p>
                <p className="text-base text-slate-700">{ID_TYPE_LABELS[user.id_type] || user.id_type}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Registration Date</p>
                <p className="text-base text-slate-700">{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Rejection Reason</p>
                <p className="text-base text-slate-700">{user.rejection_reason || "No reason provided."}</p>
              </div>
            </div>

            <div className="space-y-4 rounded-2xl bg-slate-50 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Uploaded IDs</h3>
              <div>
                <p className="text-xs text-slate-500 mb-2">ID Front</p>
                {user.id_front_url ? (
                  <img src={user.id_front_url} alt="ID Front" className="w-full rounded-2xl border border-slate-200 object-cover max-h-72" />
                ) : (
                  <div className="flex h-40 items-center justify-center rounded-2xl bg-white border border-dashed border-slate-300 text-sm text-slate-500">
                    No front image available
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-2">ID Back</p>
                {user.id_back_url ? (
                  <img src={user.id_back_url} alt="ID Back" className="w-full rounded-2xl border border-slate-200 object-cover max-h-72" />
                ) : (
                  <div className="flex h-40 items-center justify-center rounded-2xl bg-white border border-dashed border-slate-300 text-sm text-slate-500">
                    No back image provided
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminVerificationPage() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<PendingUser[]>([]);
  const [rejectedUsers, setRejectedUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRejectedUser, setSelectedRejectedUser] = useState<PendingUser | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [idTypeFilter, setIdTypeFilter] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const [pending, approved, rejected] = await Promise.all([
        getPendingVerifications(),
        getApprovedUsers(),
        getRejectedUsers(),
      ]);

      setPendingUsers(pending || []);
      setApprovedUsers(approved || []);
      setRejectedUsers(rejected || []);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      await approveUser(userId);
      await loadUsers(); // Refresh the lists
    } catch (error) {
      console.error("Error approving user:", error);
      alert("Failed to approve user. Please try again.");
    }
  };

  const handleReject = async (userId: string, reason: string) => {
    try {
      await rejectUser(userId, reason);
      await loadUsers(); // Refresh the lists
    } catch (error) {
      console.error("Error rejecting user:", error);
      alert("Failed to reject user. Please try again.");
    }
  };

  const getFilteredUsers = () => {
    let users: PendingUser[] = [];

    switch (activeTab) {
      case "pending":
        users = pendingUsers;
        break;
      case "approved":
        users = approvedUsers;
        break;
      case "rejected":
        users = rejectedUsers;
        break;
    }

    return users.filter(user => {
      const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesIdType = !idTypeFilter || user.id_type === idTypeFilter;
      return matchesSearch && matchesIdType;
    });
  };

  const filteredUsers = getFilteredUsers();
  const activeTabTotal =
    activeTab === "pending"
      ? pendingUsers.length
      : activeTab === "approved"
      ? approvedUsers.length
      : rejectedUsers.length;

  const ID_TYPE_LABELS: Record<string, string> = {
    philsys_national_id: "PhilSys National ID",
    drivers_license: "Driver's License",
    passport: "Passport",
    voters_id: "Voter's ID",
    postal_id: "Postal ID",
    umid: "UMID",
    senior_citizen_id: "Senior Citizen ID",
    barangay_id: "Barangay ID",
  };

  const tabItems = [
    {
      key: "pending",
      label: "Pending",
      count: pendingUsers.length,
      activeClasses: "border-amber-500 text-amber-600",
      inactiveClasses: "border-transparent text-slate-500 hover:text-slate-700",
    },
    {
      key: "approved",
      label: "Approved",
      count: approvedUsers.length,
      activeClasses: "border-green-500 text-green-600",
      inactiveClasses: "border-transparent text-slate-500 hover:text-slate-700",
    },
    {
      key: "rejected",
      label: "Rejected",
      count: rejectedUsers.length,
      activeClasses: "border-red-500 text-red-600",
      inactiveClasses: "border-transparent text-slate-500 hover:text-slate-700",
    },
  ];

  const contentIsLoading = loading;

  return (
    <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold text-slate-900">User Verifications</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Review and approve user registrations while keeping your team aligned with the latest status updates.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="p-8 transition-opacity duration-300">
          {contentIsLoading ? (
            <div className="flex min-h-[60vh] w-full items-center justify-center">
              <div className="flex flex-col items-center gap-4 rounded-3xl bg-slate-50 p-8 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-slate-200 border-t-[#1e3a5f] animate-spin" />
                <p className="text-sm font-medium text-slate-600">Loading verification data...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-8 w-full">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-amber-700">Pending Approval</p>
                      <p className="mt-2 text-3xl font-semibold text-amber-900">{pendingUsers.length}</p>
                    </div>
                  </div>
                  <p className="mt-5 text-sm leading-6 text-amber-700/90">Users awaiting review by the admin team.</p>
                </div>

                <div className="rounded-3xl border border-green-200 bg-green-50 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-green-700">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-green-700">Approved</p>
                      <p className="mt-2 text-3xl font-semibold text-green-900">{approvedUsers.length}</p>
                    </div>
                  </div>
                  <p className="mt-5 text-sm leading-6 text-green-700/90">Registrations that are cleared and ready to use the platform.</p>
                </div>

                <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-700">
                      <XCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-red-700">Rejected</p>
                      <p className="mt-2 text-3xl font-semibold text-red-900">{rejectedUsers.length}</p>
                    </div>
                  </div>
                  <p className="mt-5 text-sm leading-6 text-red-700/90">Users declined with a rejection reason recorded.</p>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                <div className="border-b border-slate-200 pb-3">
                  <div className="flex flex-wrap gap-3">
                    {tabItems.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key as any)}
                        className={`rounded-full border-b-2 px-4 py-3 text-sm font-semibold transition ${
                          activeTab === tab.key ? `${tab.activeClasses} border-current bg-slate-50` : `${tab.inactiveClasses}`
                        }`}
                      >
                        {tab.label} ({tab.count})
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                  <div className="relative flex-1 min-w-0">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by name or email"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20"
                    />
                  </div>
                  <select
                    value={idTypeFilter}
                    onChange={(e) => setIdTypeFilter(e.target.value)}
                    className="w-full max-w-xs rounded-2xl border border-slate-200 bg-white py-3 px-4 text-sm text-slate-700 shadow-sm outline-none transition focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20"
                  >
                    <option value="">All ID Types</option>
                    {Object.entries(ID_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm max-h-[55vh]">
                <div className="flex h-full min-h-0 flex-col overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
                    <p className="text-sm text-slate-600">
                      Showing <span className="font-semibold text-slate-900">{filteredUsers.length}</span> of <span className="font-semibold text-slate-900">{activeTabTotal}</span> {activeTab} registrations
                    </p>
                    <p className="text-sm text-slate-500">Filtered by current search and ID type</p>
                  </div>
                  <ScrollArea className="flex-1 min-h-0 max-h-[calc(55vh-72px)]">
                    <div className="overflow-x-auto min-h-0">
                      <table className="min-w-full border-separate border-spacing-0">
                        <thead className="bg-slate-50">
                          <tr>
                            <th className="sticky top-0 z-10 bg-slate-50 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Name</th>
                            <th className="sticky top-0 z-10 bg-slate-50 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Email</th>
                            <th className="sticky top-0 z-10 bg-slate-50 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">ID Type</th>
                            <th className="sticky top-0 z-10 bg-slate-50 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Date</th>
                            <th className="sticky top-0 z-10 bg-slate-50 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {filteredUsers.map((user) => (
                            <tr key={user.id} className="transition hover:bg-slate-50">
                              <td className="px-6 py-5 text-sm font-medium text-slate-800">{user.full_name}</td>
                              <td className="px-6 py-5 text-sm text-slate-600 break-all">{user.email}</td>
                              <td className="px-6 py-5 text-sm text-slate-600">
                                {ID_TYPE_LABELS[user.id_type] || user.id_type}
                              </td>
                              <td className="px-6 py-5 text-sm text-slate-600">
                                {new Date(user.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-5">
                                {activeTab === "pending" ? (
                                  <button
                                    onClick={() => {
                                      setSelectedUser(user);
                                      setShowModal(true);
                                    }}
                                    className="inline-flex items-center gap-2 rounded-full bg-[#1e3a5f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#162d4a]"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                    Review
                                  </button>
                                ) : activeTab === "rejected" ? (
                                  <button
                                    onClick={() => {
                                      setSelectedRejectedUser(user);
                                      setShowDetailsModal(true);
                                    }}
                                    className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                                  >
                                    <Eye className="h-3.5 w-3.5" />
                                    View Details
                                  </button>
                                ) : (
                                  <span className="inline-flex rounded-full px-3 py-2 text-xs font-semibold bg-green-100 text-green-800">
                                    Approved
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </ScrollArea>
              </div>

                {filteredUsers.length === 0 && (
                  <div className="border-t border-slate-200 px-6 py-12 text-center">
                    <AlertCircle className="mx-auto mb-4 h-12 w-12 text-slate-400" />
                    <p className="text-sm text-slate-500">No users found in this category. Try another filter or refresh the list.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <ApprovalModal
        user={selectedUser}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedUser(null);
        }}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      <RejectedDetailsModal
        user={selectedRejectedUser}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedRejectedUser(null);
        }}
      />
    </div>
  );
}