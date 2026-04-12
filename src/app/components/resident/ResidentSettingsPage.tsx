import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Bell,
  Lock,
  Shield,
  Save,
  Eye,
  EyeOff,
  Check,
  AlertTriangle,
  LogOut,
} from "lucide-react";
import { motion } from "motion/react";
import { supabase } from "../../../lib/supabase";
import { useApp } from "../../context/AppContext";
import { useNavigate } from "react-router";

export function ResidentSettingsPage() {
  const { user, setUser, setToastMessage } = useApp();
  const navigate = useNavigate();

  const [profileForm, setProfileForm] = useState({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "0917-555-1234",
    address: user?.address || "",
    barangay: "Brgy. San Pablo",
  });

  const [notifications, setNotifications] = useState({
    statusUpdates: true,
    resolutionAlerts: true,
    weeklyDigest: false,
    systemAnnouncements: true,
  });

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedProfile, setSavedProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);

  // Update form when user data changes
  useEffect(() => {
    setProfileForm({
      fullName: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "0917-555-1234",
      address: user?.address || "",
      barangay: "Brgy. San Pablo",
    });
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    
    try {
      // Get current user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error("User not authenticated");

      // Update user metadata in Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: profileForm.fullName,
        },
      });

      if (authError) throw authError;

      // Update resident profile in database
      const { error: dbError } = await supabase
        .from("residents")
        .update({
          full_name: profileForm.fullName,
          phone_number: profileForm.phone,
          address: profileForm.address,
        })
        .eq("id", authUser.id);

      if (dbError) throw dbError;

      // Update user profile in app context
      setUser({
        ...user!,
        name: profileForm.fullName,
        phone: profileForm.phone,
        address: profileForm.address,
      });

      setSavingProfile(false);
      setSavedProfile(true);
      setToastMessage("Profile updated successfully.");
      setTimeout(() => setSavedProfile(false), 2500);
    } catch (error: any) {
      setSavingProfile(false);
      setToastMessage(error.message || "Failed to update profile. Please try again.");
    }
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPass !== passwordForm.confirm) {
      setToastMessage("Passwords do not match. Please try again.");
      return;
    }
    setSavingPassword(true);
    setTimeout(() => {
      setSavingPassword(false);
      setPasswordForm({ current: "", newPass: "", confirm: "" });
      setToastMessage("Password changed successfully.");
    }, 800);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/");
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-slate-800">Account Settings</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Manage your profile, notifications, and security preferences
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
        {/* Profile Card */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-[#1e3a5f]" />
            <h2 className="text-slate-700 text-base">Personal Information</h2>
          </div>
          <div className="p-5">
            {/* Avatar section */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
              <div className="w-16 h-16 bg-[#1e3a5f] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-2xl">
                  {profileForm.fullName?.charAt(0) || "R"}
                </span>
              </div>
              <div>
                <p className="text-slate-800">{profileForm.fullName}</p>
                <p className="text-slate-500 text-sm">{profileForm.email}</p>
                <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full mt-1">
                  <Shield className="w-3 h-3" />
                  Resident Account
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block uppercase tracking-wide">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block uppercase tracking-wide">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block uppercase tracking-wide">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                      className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block uppercase tracking-wide">
                    Barangay
                  </label>
                  <div className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-800">
                    {profileForm.barangay}
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block uppercase tracking-wide">
                  Home Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <textarea
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    rows={2}
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile || savedProfile}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm transition-all ${
                    savedProfile
                      ? "bg-emerald-500 text-white"
                      : "bg-[#1e3a5f] hover:bg-[#162d4a] text-white"
                  } disabled:opacity-80`}
                >
                  {savingProfile ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : savedProfile ? (
                    <>
                      <Check className="w-4 h-4" />
                      Saved!
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.section>

        {/* Notification Preferences */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#1e3a5f]" />
            <h2 className="text-slate-700 text-base">Notification Preferences</h2>
          </div>
          <div className="p-5 space-y-4">
            {[
              {
                key: "statusUpdates" as const,
                label: "Status Updates",
                desc: "Notify me when my complaint status changes",
              },
              {
                key: "resolutionAlerts" as const,
                label: "Resolution Alerts",
                desc: "Notify me when my complaint is resolved or rejected",
              },
              {
                key: "weeklyDigest" as const,
                label: "Weekly Digest",
                desc: "Receive a weekly summary of all your complaint activity",
              },
              {
                key: "systemAnnouncements" as const,
                label: "System Announcements",
                desc: "Receive important system updates and maintenance notices",
              },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-4 py-2">
                <div>
                  <p className="text-sm text-slate-800">{item.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                </div>
                <button
                  onClick={() =>
                    setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                  }
                  className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                    notifications[item.key] ? "bg-[#1e3a5f]" : "bg-slate-200"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      notifications[item.key] ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Security */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#1e3a5f]" />
            <h2 className="text-slate-700 text-base">Security</h2>
          </div>
          <div className="p-5">
            <form onSubmit={handleSavePassword} className="space-y-4">
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block uppercase tracking-wide">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    placeholder="Enter current password"
                    className="w-full px-3.5 py-2.5 pr-10 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block uppercase tracking-wide">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      value={passwordForm.newPass}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })}
                      placeholder="Min. 8 characters"
                      className="w-full px-3.5 py-2.5 pr-10 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-slate-500 mb-1.5 block uppercase tracking-wide">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                    placeholder="Re-enter new password"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={
                    savingPassword ||
                    !passwordForm.current ||
                    !passwordForm.newPass ||
                    !passwordForm.confirm
                  }
                  className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#162d4a] text-white px-5 py-2.5 rounded-xl text-sm transition-all disabled:opacity-40"
                >
                  {savingPassword ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.section>

        {/* Account Actions */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-slate-700 text-base">Account Actions</h2>
          </div>
          <div className="p-5 space-y-3">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm"
            >
              <LogOut className="w-4 h-4" />
              Sign Out of Account
            </button>
            <button
              onClick={() => setShowDeleteWarning(!showDeleteWarning)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors text-sm"
            >
              <AlertTriangle className="w-4 h-4" />
              Delete Account
            </button>
            {showDeleteWarning && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-700 leading-relaxed">
                  Deleting your account is permanent and cannot be undone. All your complaint history
                  will be removed. Please contact{" "}
                  <span className="font-medium">support@spc.gov.ph</span> if you need to proceed with
                  account deletion.
                </p>
              </div>
            )}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
