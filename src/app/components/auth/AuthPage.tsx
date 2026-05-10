import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, Shield, FileText, Users, BarChart3, ChevronRight, Lock, AlertCircle, Ban, ChevronLeft, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "../../context/AppContext";
import { registerUser, loginUser, validateEmail, validatePassword } from "../../../lib/authService";
import { TermsModal } from "./TermsModal";
import { PrivacyModal } from "./PrivacyModal";
import { RegistrationFormStep1 } from "./RegistrationFormStep1";
import { RegistrationFormStep2 } from "./RegistrationFormStep2";
import { RegistrationFormStep3 } from "./RegistrationFormStep3";
import { RegistrationFormStep4 } from "./RegistrationFormStep4";
import { RegistrationThankYou } from "./RegistrationThankYou";

type Tab = "login" | "signup";
type RegistrationStep = 1 | 2 | 3 | 4;

export function AuthPage() {
  const [tab, setTab] = useState<Tab>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  // Registration wizard state
  const [registrationStep, setRegistrationStep] = useState<RegistrationStep>(1);
  const [registrationErrors, setRegistrationErrors] = useState<Record<string, string>>({});

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({
    fullName: "",
    email: "",
    password: "",
    idType: "",
    idFrontFile: null as File | null,
    idBackFile: null as File | null,
    idFrontPreview: "",
    idBackPreview: "",
    termsAccepted: false,
    privacyAccepted: false,
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
      const result = await loginUser({
        email: loginForm.email,
        password: loginForm.password,
      });

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

    // Validate current step
    const errors = validateCurrentStep();
    if (Object.keys(errors).length > 0) {
      setRegistrationErrors(errors);
      return;
    }

    // If not the final step, move to next step
    if (registrationStep < 4) {
      setRegistrationStep((prev) => (prev + 1) as RegistrationStep);
      setRegistrationErrors({});
      return;
    }

    // Final step - submit registration
    setIsLoading(true);

    try {
      const result = await registerUser({
        fullName: signupForm.fullName,
        email: signupForm.email,
        password: signupForm.password,
        idType: signupForm.idType,
        idFrontFile: signupForm.idFrontFile,
        idBackFile: signupForm.idBackFile,
      });

      if (result.success) {
        setShowThankYou(true);
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

  const validateCurrentStep = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    switch (registrationStep) {
      case 1:
        if (!signupForm.fullName.trim()) {
          errors.fullName = "Full name is required";
        }
        if (!signupForm.email.trim()) {
          errors.email = "Email is required";
        } else if (!validateEmail(signupForm.email)) {
          errors.email = "Please enter a valid email address";
        }
        if (!signupForm.password) {
          errors.password = "Password is required";
        } else if (!validatePassword(signupForm.password)) {
          errors.password = "Password must be at least 8 characters with uppercase, lowercase, and number";
        }
        break;

      case 2:
        if (!signupForm.idType) {
          errors.idType = "Please select a government-issued ID type";
        }
        if (!signupForm.idFrontFile) {
          errors.idFrontFile = "ID front image is required";
        }
        break;

      case 3:
        if (!signupForm.termsAccepted) {
          errors.terms = "You must agree to the Terms of Service";
        }
        if (!signupForm.privacyAccepted) {
          errors.privacy = "You must agree to the Privacy Policy";
        }
        break;
    }

    return errors;
  };

  const handleRegistrationFieldChange = (field: string, value: any) => {
    setSignupForm(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (registrationErrors[field]) {
      setRegistrationErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handlePrevStep = () => {
    if (registrationStep > 1) {
      setRegistrationStep((prev) => (prev - 1) as RegistrationStep);
      setRegistrationErrors({});
    }
  };

  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    setErrorMessage("");
    setSuccessMessage("");
    setRegistrationErrors({});
    if (newTab === "signup") {
      setRegistrationStep(1);
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

          <AnimatePresence mode="wait">
            {showThankYou ? (
              <motion.div
                key="thankyou"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.24 }}
              >
                <RegistrationThankYou
                  onClose={() => {
                    setShowThankYou(false);
                    handleTabChange("login");
                    setSignupForm({
                      fullName: "",
                      email: "",
                      password: "",
                      idType: "",
                      idFrontFile: null,
                      idBackFile: null,
                      idFrontPreview: "",
                      idBackPreview: "",
                      termsAccepted: false,
                      privacyAccepted: false,
                    });
                    setRegistrationStep(1);
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="auth"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 p-8"
              >
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

                      {/* Role Selector - REMOVED */}
                      {/* Users will be automatically directed based on their database role after login */}

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

                  {/* Step Indicator */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      {[1, 2, 3, 4].map((step) => (
                        <div key={step} className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                            step < registrationStep
                              ? "bg-green-500 text-white"
                              : step === registrationStep
                              ? "bg-[#1e3a5f] text-white"
                              : "bg-slate-200 text-slate-500"
                          }`}>
                            {step < registrationStep ? <Check className="w-3 h-3" /> : step}
                          </div>
                          {step < 4 && (
                            <div className={`w-12 h-0.5 mx-2 ${
                              step < registrationStep ? "bg-green-500" : "bg-slate-200"
                            }`} />
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Account</span>
                      <span>Identity</span>
                      <span>Terms</span>
                      <span>Review</span>
                    </div>
                  </div>

                  {/* Error Message */}
                  {errorMessage && (
                    <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-200 flex gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-700">{errorMessage}</p>
                    </div>
                  )}

                  <form onSubmit={handleSignup} className="space-y-6">
                    <AnimatePresence mode="wait">
                      {registrationStep === 1 && (
                        <motion.div
                          key="step1"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <RegistrationFormStep1
                            formData={{
                              fullName: signupForm.fullName,
                              email: signupForm.email,
                              password: signupForm.password,
                            }}
                            onChange={handleRegistrationFieldChange}
                            showPassword={showPassword}
                            setShowPassword={setShowPassword}
                            errors={registrationErrors}
                          />
                        </motion.div>
                      )}

                      {registrationStep === 2 && (
                        <motion.div
                          key="step2"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <RegistrationFormStep2
                            formData={{
                              idType: signupForm.idType,
                              idFrontFile: signupForm.idFrontFile,
                              idBackFile: signupForm.idBackFile,
                              idFrontPreview: signupForm.idFrontPreview,
                              idBackPreview: signupForm.idBackPreview,
                            }}
                            onChange={handleRegistrationFieldChange}
                            errors={registrationErrors}
                          />
                        </motion.div>
                      )}

                      {registrationStep === 3 && (
                        <motion.div
                          key="step3"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <RegistrationFormStep3
                            termsAccepted={signupForm.termsAccepted}
                            privacyAccepted={signupForm.privacyAccepted}
                            onTermsChange={(accepted) => handleRegistrationFieldChange("termsAccepted", accepted)}
                            onPrivacyChange={(accepted) => handleRegistrationFieldChange("privacyAccepted", accepted)}
                            onShowTerms={() => setShowTermsModal(true)}
                            onShowPrivacy={() => setShowPrivacyModal(true)}
                            errors={registrationErrors}
                          />
                        </motion.div>
                      )}

                      {registrationStep === 4 && (
                        <motion.div
                          key="step4"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                        >
                          <RegistrationFormStep4
                            formData={{
                              fullName: signupForm.fullName,
                              email: signupForm.email,
                              password: signupForm.password,
                              idType: signupForm.idType,
                              idFrontPreview: signupForm.idFrontPreview,
                              idBackPreview: signupForm.idBackPreview,
                            }}
                            termsAccepted={signupForm.termsAccepted}
                            privacyAccepted={signupForm.privacyAccepted}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex gap-3">
                      {registrationStep > 1 && (
                        <button
                          type="button"
                          onClick={handlePrevStep}
                          className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </button>
                      )}

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 bg-[#1e3a5f] hover:bg-[#162d4a] disabled:bg-slate-300 text-white py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            {registrationStep === 4 ? "Creating Account..." : "Processing..."}
                          </>
                        ) : (
                          <>
                            {registrationStep === 4 ? "Create Account" : "Next"}
                            <ChevronRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-center text-xs text-slate-400 mt-6">
              {tab === "login" ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => handleTabChange(tab === "login" ? "signup" : "login")}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {tab === "login" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-center text-xs text-slate-400 mt-6">
        © 2026 Municipal Government · Official Platform
      </p>
        </div>
      </div>

      {/* Modals */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={() => setSignupForm(prev => ({ ...prev, termsAccepted: true }))}
      />
      <PrivacyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        onAccept={() => setSignupForm(prev => ({ ...prev, privacyAccepted: true }))}
      />

    </div>
  );
}
