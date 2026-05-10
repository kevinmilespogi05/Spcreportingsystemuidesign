import { CheckCircle, Clock, Mail } from "lucide-react";

interface RegistrationThankYouProps {
  onClose: () => void;
}

export function RegistrationThankYou({ onClose }: RegistrationThankYouProps) {
  return (
    <div className="bg-white rounded-[2rem] shadow-2xl shadow-slate-300/25 border border-slate-100 p-10 text-center w-full">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
        <CheckCircle className="w-10 h-10 text-green-600" />
      </div>

      <h2 className="text-3xl font-semibold text-slate-800 mb-4">
        Registration Submitted!
      </h2>

      <p className="text-slate-600 mb-8 leading-relaxed">
        Thank you for registering with the SPC Reporting System. Your account is currently under review.
      </p>

      <div className="space-y-4 mb-10">
        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-3xl border border-blue-200">
          <Clock className="w-6 h-6 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-left">
            <p className="text-sm font-semibold text-blue-800 mb-1">Review Process</p>
            <p className="text-xs text-blue-700">
              Our administrators will review your government-issued ID and account information within 1-2 business days.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-green-50 rounded-3xl border border-green-200">
          <Mail className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
          <div className="text-left">
            <p className="text-sm font-semibold text-green-800 mb-1">Email Notification</p>
            <p className="text-xs text-green-700">
              You will receive an email notification once your account is approved or if additional information is needed.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full bg-[#1e3a5f] hover:bg-[#162d4a] text-white py-3.5 rounded-3xl text-sm font-semibold transition-all"
      >
        Return to Login
      </button>

      <p className="text-xs text-slate-400 mt-5">
        Questions? Contact your local barangay office or municipal government.
      </p>
    </div>
  );
}