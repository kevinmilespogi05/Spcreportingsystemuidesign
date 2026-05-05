import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, Shield, FileText, Users, BarChart3, ChevronRight, Lock, AlertCircle, Ban } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "../../context/AppContext";
import { registerUser, loginUser, validateEmail, validatePassword } from "../../../lib/authService";
import { TermsModal } from "./TermsModal";
import { PrivacyModal } from "./PrivacyModal";

type Tab = "login" | "signup";
type Role = "resident" | "admin";

export function AuthPage() {
  const [tab, setTab] = useState<Tab>("login");
  const [role, setRole] = useState<Role>("resident");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { user, setUser } = useApp();
  const navigate = useNavigate();

  // If already authenticated, redirect to the appropriate dashboard
  useEffect(() => {
    if (user) {
      navigate(user.role === "admin" ? "/admin" : "/resident", { replace: true });
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    try {
      const result = await loginUser(
        {
          email: loginForm.email,
          password: loginForm.password,
        },
        role
      );

      if (result.success && result.user) {
        setUser({
          name: result.user.name,
          email: result.user.email,
          role: result.user.role as "resident" | "admin",
        });
        navigate(result.user.role === "resident" ? "/resident" : "/admin");
      } else {
        setErrorMessage(result.error || result.message);
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Validate terms acceptance
    if (!termsAccepted) {
      setErrorMessage("You must agree to the Terms of Service and Privacy Policy");
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerUser({
        fullName: signupForm.fullName,
        email: signupForm.email,
        password: signupForm.password,
      });

      if (result.success) {
        setSuccessMessage(result.message);
        // Clear form
        setSignupForm({ fullName: "", email: "", password: "" });
        setTermsAccepted(false);
        // Switch to login after successful registration
        setTimeout(() => {
          setTab("login");
          setSuccessMessage("");
        }, 2000);
      } else {
        setErrorMessage(result.error || result.message);
      }
    } catch (error) {
      console.error("Signup error:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0f2744] via-[#1e3a5f] to-[#1a4f8a] relative overflow-hidden flex-col justify-between p-12">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)`,
              backgroundSize: "60px 60px",
            }}
          />
        </div>
        <div className="absolute top-32 right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-48 h-48 bg-blue-400/10 rounded-full blur-2xl" />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center border border-white/20">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white/60 text-xs tracking-widest uppercase">Municipal Government</p>
              <h1 className="text-white text-xl tracking-tight">SPC Reporting System</h1>
            </div>
          </div>
        </div>

        {/* Center content */}
        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="text-white text-4xl leading-tight mb-4">
              Your Voice,<br />
              <span className="text-blue-300">Your Community</span>
            </h2>
            <p className="text-blue-100/70 text-base leading-relaxed max-w-sm">
              Report issues, track resolutions, and stay connected with your local government in a secure and transparent platform.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="space-y-4">
            {[
              { icon: FileText, label: "Submit & Track Complaints", desc: "Monitor your reports in real-time" },
              { icon: BarChart3, label: "Transparent Status Updates", desc: "Know exactly where your report stands" },
              { icon: Users, label: "Community-Driven Governance", desc: "Collaborate for better public service" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0 border border-white/10">
                  <item.icon className="w-4 h-4 text-blue-200" />
                </div>
                <div>
                  <p className="text-white text-sm">{item.label}</p>
                  <p className="text-blue-200/60 text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center gap-2 text-blue-200/50 text-xs">
          <Lock className="w-3 h-3" />
          <span>Secured with 256-bit encryption · Official Government Platform</span>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 px-6 py-12 min-h-screen overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-[#1e3a5f] rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-slate-800 font-semibold">SPC Reporting System</span>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8">
            {/* Tab Toggle */}
            <div className="flex bg-slate-100 rounded-xl p-1 mb-8">
              {(["login", "signup"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setErrorMessage(""); setSuccessMessage(""); }}
                  className={`flex-1 py-2 rounded-lg text-sm transition-all duration-200 ${tab === t
                      ? "bg-white text-slate-800 shadow-sm font-medium"
                      : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                  {t === "login" ? "Sign In" : "Create Account"}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {tab === "login" ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-6">
                    <h2 className="text-slate-800 mb-1">Welcome back</h2>
                    <p className="text-slate-500 text-sm">Sign in to access your account</p>
                  </div>

                  {/* Error / Ban notification */}
                  {errorMessage && (() => {
                    const isBanned = errorMessage.toLowerCase().includes("banned");
                    return isBanned ? (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-5 rounded-xl border border-amber-300 bg-amber-50 overflow-hidden"
                      >
                        <div className="flex items-center gap-2 bg-amber-100 px-4 py-2.5 border-b border-amber-200">
                          <Ban className="w-4 h-4 text-amber-700 flex-shrink-0" />
                          <p className="text-sm font-semibold text-amber-800">Account Suspended</p>
                        </div>
                        <div className="px-4 py-3 space-y-1">
                          <p className="text-sm text-amber-800">
                            Your account has been <strong>banned</strong> by an administrator.
                          </p>
                          <p className="text-xs text-amber-600 leading-relaxed">
                            You are no longer able to access the SPC Reporting System. If you believe this is a mistake, please contact your barangay office or local government unit for assistance.
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200 flex gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-red-700">{errorMessage}</p>
                      </div>
                    );
                  })()}

                  {/* Role Selector */}
                  <div className="mb-5">
                    <label className="text-sm text-slate-600 mb-2 block">Sign in as</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(["resident", "admin"] as Role[]).map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${role === r
                              ? "border-[#1e3a5f] bg-[#1e3a5f]/5 text-[#1e3a5f]"
                              : "border-slate-200 text-slate-500 hover:border-slate-300"
                            }`}
                        >
                          {r === "resident" ? (
                            <Users className="w-4 h-4" />
                          ) : (
                            <Shield className="w-4 h-4" />
                          )}
                          <span className="text-sm capitalize">{r}</span>
                          {role === r && (
                            <div className="ml-auto w-2 h-2 bg-[#1e3a5f] rounded-full" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="text-sm text-slate-600 mb-1.5 block">Email Address</label>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <label className="text-sm text-slate-600">Password</label>
                        <button type="button" className="text-xs text-blue-600 hover:text-blue-800">Forgot password?</button>
                      </div>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#1e3a5f] hover:bg-[#162d4a] text-white py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          Sign In
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-6">
                    <h2 className="text-slate-800 mb-1">Create Account</h2>
                    <p className="text-slate-500 text-sm">Join the community reporting platform</p>
                  </div>

                  {/* Error Message */}
                  {errorMessage && (
                    <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200 flex gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-700">{errorMessage}</p>
                    </div>
                  )}

                  {/* Success Message */}
                  {successMessage && (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200 flex gap-2">
                      <div className="w-4 h-4 bg-green-600 rounded-full flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-green-700">{successMessage}</p>
                    </div>
                  )}

                  <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                      <label className="text-sm text-slate-600 mb-1.5 block">Full Name</label>
                      <input
                        type="text"
                        placeholder="Juan dela Cruz"
                        value={signupForm.fullName}
                        onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-600 mb-1.5 block">Email Address</label>
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={signupForm.email}
                        onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-600 mb-1.5 block">Password</label>
                      <p className="text-xs text-slate-500 mb-2">
                        Must contain 8+ characters, uppercase, lowercase, and a number
                      </p>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Min. 8 characters"
                          value={signupForm.password}
                          onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                          className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={termsAccepted}
                        onChange={(e) => setTermsAccepted(e.target.checked)}
                        className="mt-0.5 accent-[#1e3a5f] cursor-pointer"
                      />
                      <label htmlFor="terms" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
                        I agree to the{" "}
                        <button
                          type="button"
                          onClick={() => setShowTermsModal(true)}
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          Terms of Service
                        </button>
                        {" "}and{" "}
                        <button
                          type="button"
                          onClick={() => setShowPrivacyModal(true)}
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          Privacy Policy
                        </button>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || !termsAccepted}
                      className="w-full bg-[#1e3a5f] hover:bg-[#162d4a] disabled:bg-slate-300 text-white py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-center text-xs text-slate-400 mt-6">
              {tab === "login" ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => { setTab(tab === "login" ? "signup" : "login"); setErrorMessage(""); setSuccessMessage(""); }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {tab === "login" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            © 2026 Municipal Government · Official Platform
          </p>
        </div>
      </div>

      {/* Modals */}
      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
      <PrivacyModal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} />
    </div>
  );
}
