import { Copy, Check, X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface UserCreationSuccessModalProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    password: string;
  };
  onClose: () => void;
}

export function UserCreationSuccessModal({
  user,
  onClose,
}: UserCreationSuccessModalProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: "spring", damping: 20 }}
        className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
      >
        {/* Close Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            Account Created Successfully! 🎉
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-6">
          {/* Success Message */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <p className="text-emerald-700 text-sm">
              A new {user.role} account has been created. Share these credentials with the user.
            </p>
          </div>

          {/* User Details */}
          <div className="space-y-3 bg-slate-50 rounded-lg p-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Full Name
              </label>
              <div className="flex items-center justify-between bg-white border border-slate-200 rounded p-3">
                <span className="text-slate-900 font-medium">{user.name}</span>
                <button
                  onClick={() => handleCopy(user.name, "name")}
                  className="text-slate-500 hover:text-slate-700 transition-colors"
                >
                  {copiedField === "name" ? (
                    <Check size={18} className="text-emerald-600" />
                  ) : (
                    <Copy size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Email
              </label>
              <div className="flex items-center justify-between bg-white border border-slate-200 rounded p-3">
                <span className="text-slate-900 font-medium break-all">{user.email}</span>
                <button
                  onClick={() => handleCopy(user.email, "email")}
                  className="text-slate-500 hover:text-slate-700 transition-colors flex-shrink-0 ml-2"
                >
                  {copiedField === "email" ? (
                    <Check size={18} className="text-emerald-600" />
                  ) : (
                    <Copy size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Temporary Password
              </label>
              <div className="flex items-center justify-between bg-white border border-slate-200 rounded p-3">
                <span className="text-slate-900 font-medium break-all font-mono text-sm">
                  {user.password}
                </span>
                <button
                  onClick={() => handleCopy(user.password, "password")}
                  className="text-slate-500 hover:text-slate-700 transition-colors flex-shrink-0 ml-2"
                >
                  {copiedField === "password" ? (
                    <Check size={18} className="text-emerald-600" />
                  ) : (
                    <Copy size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* User Type */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Account Type
              </label>
              <div className="bg-white border border-slate-200 rounded p-3">
                <span className="text-slate-900 font-medium capitalize">
                  {user.role}
                </span>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-amber-700 text-sm">
              ⚠️ Make sure to share this password securely. The user should change it after their first login.
            </p>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Done
        </button>
      </motion.div>
    </motion.div>
  );
}
