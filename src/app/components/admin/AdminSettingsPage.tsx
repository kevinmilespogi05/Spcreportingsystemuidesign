import { useState } from "react";
import {
  Settings,
  Bell,
  Shield,
  Database,
  Users,
  Globe,
  Save,
  Check,
  RefreshCw,
  AlertTriangle,
  Info,
  Mail,
  Clock,
  Sliders,
  Lock,
} from "lucide-react";
import { motion } from "motion/react";
import { useApp } from "../../context/AppContext";

export function AdminSettingsPage() {
  const { setToastMessage } = useApp();

  const [generalSettings, setGeneralSettings] = useState({
    systemName: "SPC Reporting System",
    municipality: "San Pedro City",
    timezone: "Asia/Manila",
    language: "en",
    maxFileSize: "10",
    autoArchiveDays: "90",
  });

  const [notifSettings, setNotifSettings] = useState({
    autoNotifyOnSubmit: true,
    autoNotifyOnUpdate: true,
    autoNotifyOnResolve: true,
    adminDailyDigest: false,
    smsAlerts: false,
    emailAlerts: true,
  });

  const [slaSettings, setSlaSettings] = useState({
    pendingWarningDays: "3",
    pendingEscalateDays: "7",
    targetResolutionDays: "14",
  });

  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savedGeneral, setSavedGeneral] = useState(false);
  const [savingSLA, setSavingSLA] = useState(false);
  const [savedSLA, setSavedSLA] = useState(false);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGeneral(true);
    setTimeout(() => {
      setSavingGeneral(false);
      setSavedGeneral(true);
      setToastMessage("System settings saved successfully.");
      setTimeout(() => setSavedGeneral(false), 2500);
    }, 800);
  };

  const handleSaveSLA = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSLA(true);
    setTimeout(() => {
      setSavingSLA(false);
      setSavedSLA(true);
      setToastMessage("SLA settings updated.");
      setTimeout(() => setSavedSLA(false), 2500);
    }, 600);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-slate-800">System Settings</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Configure system preferences, notifications, and SLA policies
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        {/* General Settings */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Settings className="w-4 h-4 text-[#1e3a5f]" />
            <h2 className="text-slate-700 text-base">General Settings</h2>
          </div>
          <form onSubmit={handleSaveGeneral} className="p-5 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block uppercase tracking-wide">
                  System Name
                </label>
                <input
                  type="text"
                  value={generalSettings.systemName}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, systemName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block uppercase tracking-wide">
                  Municipality / LGU
                </label>
                <input
                  type="text"
                  value={generalSettings.municipality}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, municipality: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block uppercase tracking-wide">
                  <Globe className="w-3.5 h-3.5 inline mr-1" />Timezone
                </label>
                <select
                  value={generalSettings.timezone}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
                >
                  <option value="Asia/Manila">Asia/Manila (UTC+8)</option>
                  <option value="UTC">UTC</option>
                  <option value="Asia/Singapore">Asia/Singapore (UTC+8)</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block uppercase tracking-wide">
                  System Language
                </label>
                <select
                  value={generalSettings.language}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, language: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
                >
                  <option value="en">English</option>
                  <option value="fil">Filipino</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block uppercase tracking-wide">
                  Max File Upload Size (MB)
                </label>
                <input
                  type="number"
                  value={generalSettings.maxFileSize}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, maxFileSize: e.target.value })}
                  min="1"
                  max="50"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-slate-500 mb-1.5 block uppercase tracking-wide">
                  Auto-Archive After (Days)
                </label>
                <input
                  type="number"
                  value={generalSettings.autoArchiveDays}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, autoArchiveDays: e.target.value })}
                  min="30"
                  max="365"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingGeneral || savedGeneral}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm transition-all ${
                  savedGeneral
                    ? "bg-emerald-500 text-white"
                    : "bg-[#1e3a5f] hover:bg-[#162d4a] text-white"
                } disabled:opacity-80`}
              >
                {savingGeneral ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
                ) : savedGeneral ? (
                  <><Check className="w-4 h-4" />Saved!</>
                ) : (
                  <><Save className="w-4 h-4" />Save Settings</>
                )}
              </button>
            </div>
          </form>
        </motion.section>

        {/* Notification Settings */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#1e3a5f]" />
            <h2 className="text-slate-700 text-base">Notification Settings</h2>
          </div>
          <div className="p-5 space-y-1">
            <p className="text-xs text-slate-400 mb-3">
              Automatic notifications sent to residents when complaint status changes
            </p>
            {[
              { key: "autoNotifyOnSubmit" as const, label: "Notify on Submission", desc: "Send confirmation when a complaint is submitted", icon: Mail },
              { key: "autoNotifyOnUpdate" as const, label: "Notify on Status Update", desc: "Alert residents when complaint status changes", icon: RefreshCw },
              { key: "autoNotifyOnResolve" as const, label: "Notify on Resolution", desc: "Send resolution notice with admin remarks", icon: Check },
              { key: "adminDailyDigest" as const, label: "Admin Daily Digest", desc: "Send daily summary to administrators", icon: Clock },
              { key: "emailAlerts" as const, label: "Email Notifications", desc: "Enable email-based notification channel", icon: Mail },
              { key: "smsAlerts" as const, label: "SMS Alerts", desc: "Enable SMS for urgent updates (requires integration)", icon: Bell },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0"
              >
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <item.icon className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-800">{item.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setNotifSettings((prev) => ({ ...prev, [item.key]: !prev[item.key] }))
                  }
                  className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ml-4 ${
                    notifSettings[item.key] ? "bg-[#1e3a5f]" : "bg-slate-200"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      notifSettings[item.key] ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </motion.section>

        {/* SLA Settings */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#1e3a5f]" />
            <h2 className="text-slate-700 text-base">SLA & Escalation Policy</h2>
          </div>
          <form onSubmit={handleSaveSLA} className="p-5 space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">
                SLA policies define when complaints are flagged and escalated based on pending duration.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { key: "pendingWarningDays" as const, label: "Warning After (Days)", desc: "Highlight pending complaints after N days", icon: AlertTriangle, iconColor: "text-amber-500" },
                { key: "pendingEscalateDays" as const, label: "Escalate After (Days)", desc: "Mark as overdue after N days", icon: Clock, iconColor: "text-red-500" },
                { key: "targetResolutionDays" as const, label: "Target Resolution (Days)", desc: "Expected days for full resolution", icon: Check, iconColor: "text-emerald-500" },
              ].map((field) => (
                <div key={field.key}>
                  <label className="text-xs text-slate-500 mb-1.5 block uppercase tracking-wide flex items-center gap-1">
                    <field.icon className={`w-3.5 h-3.5 ${field.iconColor}`} />
                    {field.label}
                  </label>
                  <input
                    type="number"
                    value={slaSettings[field.key]}
                    onChange={(e) => setSlaSettings({ ...slaSettings, [field.key]: e.target.value })}
                    min="1"
                    max="60"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
                  />
                  <p className="text-xs text-slate-400 mt-1">{field.desc}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingSLA || savedSLA}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm transition-all ${
                  savedSLA
                    ? "bg-emerald-500 text-white"
                    : "bg-[#1e3a5f] hover:bg-[#162d4a] text-white"
                } disabled:opacity-80`}
              >
                {savingSLA ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
                ) : savedSLA ? (
                  <><Check className="w-4 h-4" />Saved!</>
                ) : (
                  <><Save className="w-4 h-4" />Update SLA Policy</>
                )}
              </button>
            </div>
          </form>
        </motion.section>

        {/* Security & Access */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#1e3a5f]" />
            <h2 className="text-slate-700 text-base">Security & Access Control</h2>
          </div>
          <div className="p-5 space-y-3">
            {[
              { label: "Two-Factor Authentication", desc: "Require 2FA for admin accounts", enabled: true, icon: Lock },
              { label: "Session Timeout", desc: "Auto-logout after 30 minutes of inactivity", enabled: true, icon: Clock },
              { label: "Audit Logging", desc: "Log all admin actions for accountability", enabled: true, icon: Database },
              { label: "Public Registration", desc: "Allow new residents to self-register", enabled: true, icon: Users },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-800">{item.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full ${item.enabled ? "text-emerald-700 bg-emerald-50 border border-emerald-200" : "text-slate-500 bg-slate-100 border border-slate-200"}`}>
                  {item.enabled ? "Enabled" : "Disabled"}
                </span>
              </div>
            ))}
          </div>
        </motion.section>

        {/* System Maintenance */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Database className="w-4 h-4 text-[#1e3a5f]" />
            <h2 className="text-slate-700 text-base">System Maintenance</h2>
          </div>
          <div className="p-5 space-y-3">
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                These actions affect system data. Proceed with caution. Irreversible actions will require confirmation.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: "Clear Cache", desc: "Flush system cache", icon: RefreshCw, variant: "default" },
                { label: "Export Data", desc: "Download all complaints", icon: Database, variant: "default" },
                { label: "Archive Old Records", desc: "Archive resolved complaints", icon: Database, variant: "warning" },
              ].map((action, i) => (
                <button
                  key={i}
                  onClick={() => setToastMessage(`${action.label} initiated successfully.`)}
                  className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all hover:shadow-sm ${
                    action.variant === "warning"
                      ? "border-amber-200 hover:border-amber-300 hover:bg-amber-50"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    action.variant === "warning" ? "bg-amber-50" : "bg-slate-100"
                  }`}>
                    <action.icon className={`w-4 h-4 ${action.variant === "warning" ? "text-amber-600" : "text-slate-500"}`} />
                  </div>
                  <div>
                    <p className={`text-sm ${action.variant === "warning" ? "text-amber-700" : "text-slate-700"}`}>
                      {action.label}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{action.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.section>

        {/* System Info */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="bg-slate-50 rounded-xl border border-slate-200 p-5"
        >
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">System Information</p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            {[
              { label: "Version", value: "v2.4.1" },
              { label: "Build", value: "2024-04-06" },
              { label: "Environment", value: "Production" },
              { label: "Database", value: "Connected" },
              { label: "Last Backup", value: "Today, 3:00 AM" },
              { label: "Uptime", value: "99.8%" },
            ].map((info) => (
              <div key={info.label} className="flex items-center justify-between">
                <span className="text-slate-400">{info.label}</span>
                <span className="text-slate-700">{info.value}</span>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}
