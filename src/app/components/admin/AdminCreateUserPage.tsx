import { useState } from "react";
import { Eye, EyeOff, Loader } from "lucide-react";
import { motion } from "motion/react";
import { useApp } from "../../context/AppContext";
import { createUserAsAdmin, validateEmail, validatePassword } from "../../../lib/authService";
import { UserCreationSuccessModal } from "./UserCreationSuccessModal";

interface FormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  userType: "resident" | "admin";
}

interface FormErrors {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

interface CreatedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  password: string;
}

export function AdminCreateUserPage() {
  const { setToastMessage } = useApp();
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    userType: "resident",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [createdUser, setCreatedUser] = useState<CreatedUser | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleUserTypeChange = (type: "resident" | "admin") => {
    setFormData((prev) => ({
      ...prev,
      userType: type,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.message;
      }
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await createUserAsAdmin({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        userType: formData.userType,
      });

      if (response.success && response.user) {
        setCreatedUser(response.user as CreatedUser);
        setShowSuccessModal(true);
        setToastMessage("User account created successfully");
      } else {
        setErrors({
          general: response.error || "Failed to create user account",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setErrors({
        general: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Reset form
    setFormData({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      userType: "resident",
    });
    setErrors({});
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 sticky top-0 z-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create User Account</h1>
          <p className="text-slate-600 text-sm mt-1">
            Add a new user account for residents or administrators
          </p>
        </div>
      </div>

      {/* Form Container - Centered */}
      <div className="flex-1 flex items-center justify-center px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-2xl"
        >
          {/* Form Card */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* General Error */}
              {errors.general && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm"
                >
                  ✕ {errors.general}
                </motion.div>
              )}

              {/* Form Fields Grid */}
              <div className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition-colors ${
                      errors.fullName
                        ? "border-red-500 focus:ring-red-500"
                        : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                    }`}
                  />
                  {errors.fullName && (
                    <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                      <span>⚠</span> {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="user@example.com"
                    className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition-colors ${
                      errors.email
                        ? "border-red-500 focus:ring-red-500"
                        : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                      <span>⚠</span> {errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min. 8 characters"
                      className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition-colors pr-10 ${
                        errors.password
                          ? "border-red-500 focus:ring-red-500"
                          : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                      <span>⚠</span> {errors.password}
                    </p>
                  )}
                  <p className="text-slate-500 text-xs mt-2 px-0.5">
                    Must contain uppercase, lowercase, and numbers
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className={`w-full px-3.5 py-2.5 bg-white border rounded-lg text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition-colors pr-10 ${
                        errors.confirmPassword
                          ? "border-red-500 focus:ring-red-500"
                          : "border-slate-300 focus:ring-blue-500 focus:border-blue-500"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                      <span>⚠</span> {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-200" />

              {/* User Type Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-3">
                  Account Type <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  {(["resident", "admin"] as const).map((type) => (
                    <label
                      key={type}
                      className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                        formData.userType === type
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="userType"
                        value={type}
                        checked={formData.userType === type}
                        onChange={() => handleUserTypeChange(type)}
                        className="w-4 h-4 text-blue-600 cursor-pointer"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-semibold text-slate-900 capitalize">
                          {type}
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {type === "resident"
                            ? "Can submit complaints and track their status"
                            : "Can manage system, residents, and view reports"}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-900 text-sm">
              <span className="font-semibold">ℹ️ Note:</span> After creating an account, share the generated credentials securely with the new user. They can change their password after first login.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && createdUser && (
        <UserCreationSuccessModal
          user={createdUser}
          onClose={handleSuccessModalClose}
        />
      )}
    </div>
  );
}
