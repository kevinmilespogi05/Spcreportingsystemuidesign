import { Eye, EyeOff } from "lucide-react";

interface RegistrationFormStep1Props {
  formData: {
    fullName: string;
    email: string;
    password: string;
  };
  onChange: (field: string, value: string) => void;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  errors: Record<string, string>;
}

export function RegistrationFormStep1({
  formData,
  onChange,
  showPassword,
  setShowPassword,
  errors,
}: RegistrationFormStep1Props) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm text-slate-600 mb-1.5 block">Full Name</label>
        <input
          type="text"
          placeholder="Juan dela Cruz"
          value={formData.fullName}
          onChange={(e) => onChange("fullName", e.target.value)}
          className={`w-full px-3.5 py-2.5 text-sm border rounded-xl bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all ${
            errors.fullName ? "border-red-300" : "border-slate-200"
          }`}
        />
        {errors.fullName && (
          <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>
        )}
      </div>

      <div>
        <label className="text-sm text-slate-600 mb-1.5 block">Email Address</label>
        <input
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={(e) => onChange("email", e.target.value)}
          className={`w-full px-3.5 py-2.5 text-sm border rounded-xl bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all ${
            errors.email ? "border-red-300" : "border-slate-200"
          }`}
        />
        {errors.email && (
          <p className="text-xs text-red-600 mt-1">{errors.email}</p>
        )}
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
            value={formData.password}
            onChange={(e) => onChange("password", e.target.value)}
            className={`w-full px-3.5 py-2.5 text-sm border rounded-xl bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all pr-10 ${
              errors.password ? "border-red-300" : "border-slate-200"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-600 mt-1">{errors.password}</p>
        )}
      </div>
    </div>
  );
}