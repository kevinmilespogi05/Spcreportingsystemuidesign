interface RegistrationFormStep3Props {
  termsAccepted: boolean;
  privacyAccepted: boolean;
  onTermsChange: (accepted: boolean) => void;
  onPrivacyChange: (accepted: boolean) => void;
  onShowTerms: () => void;
  onShowPrivacy: () => void;
  errors: Record<string, string>;
}

export function RegistrationFormStep3({
  termsAccepted,
  privacyAccepted,
  onTermsChange,
  onPrivacyChange,
  onShowTerms,
  onShowPrivacy,
  errors,
}: RegistrationFormStep3Props) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-slate-800 mb-2">Terms & Privacy Agreement</h3>
        <p className="text-sm text-slate-600 mb-6">
          Please review and accept our terms of service and privacy policy to continue with your registration.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl bg-slate-50/50">
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => onTermsChange(e.target.checked)}
            className="mt-0.5 accent-[#1e3a5f] cursor-pointer"
          />
          <div className="flex-1">
            <label htmlFor="terms" className="text-sm text-slate-700 font-medium cursor-pointer mb-1 block">
              I agree to the Terms of Service
            </label>
            <p className="text-xs text-slate-600 leading-relaxed mb-2">
              I have read and agree to abide by the terms and conditions that govern the use of this platform.
            </p>
            <button
              type="button"
              onClick={onShowTerms}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Read Terms of Service
            </button>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 border border-slate-200 rounded-xl bg-slate-50/50">
          <input
            type="checkbox"
            id="privacy"
            checked={privacyAccepted}
            onChange={(e) => onPrivacyChange(e.target.checked)}
            className="mt-0.5 accent-[#1e3a5f] cursor-pointer"
          />
          <div className="flex-1">
            <label htmlFor="privacy" className="text-sm text-slate-700 font-medium cursor-pointer mb-1 block">
              I agree to the Privacy Policy
            </label>
            <p className="text-xs text-slate-600 leading-relaxed mb-2">
              I understand how my personal information will be collected, used, and protected.
            </p>
            <button
              type="button"
              onClick={onShowPrivacy}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Read Privacy Policy
            </button>
          </div>
        </div>
      </div>

      {(errors.terms || errors.privacy) && (
        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
          <p className="text-xs text-red-700">
            {errors.terms || errors.privacy}
          </p>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <div className="w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center mt-0.5">
            <span className="text-white text-xs">!</span>
          </div>
          <div>
            <p className="text-sm text-amber-800 font-medium mb-1">Account Approval Required</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              After registration, your account will be reviewed by administrators. You will receive an email notification once your account is approved or if additional information is needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}