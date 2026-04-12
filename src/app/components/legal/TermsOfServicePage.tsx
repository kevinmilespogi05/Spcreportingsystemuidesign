import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router";

export function TermsOfServicePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-slate-900">
            Terms of Service
          </h1>
          <p className="text-slate-500 mt-2">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-slate-700 leading-relaxed">
              By accessing and using the SPC Reporting System, you accept and
              agree to be bound by the terms and provision of this agreement. If
              you do not agree to abide by the above, please do not use this
              service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              2. User Responsibilities
            </h2>
            <div className="text-slate-700 leading-relaxed space-y-2">
              <p>
                <strong>Accurate Information:</strong> You must provide accurate,
                current, and complete information during registration. You are
                responsible for maintaining the confidentiality of your account
                credentials.
              </p>
              <p>
                <strong>Account Responsibility:</strong> You are fully
                responsible for all activities that occur under your account. You
                agree to immediately notify the system administrators of any
                unauthorized use of your account.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              3. Permitted Use
            </h2>
            <p className="text-slate-700 leading-relaxed mb-3">
              The SPC Reporting System is intended solely for submitting and
              managing complaints about municipal services, infrastructure, and
              government operations. You agree to use this system only for its
              intended purpose.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              4. Prohibited Activities
            </h2>
            <div className="text-slate-700 leading-relaxed space-y-2">
              <p>You agree NOT to:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Submit false, misleading, or duplicate complaints</li>
                <li>
                  Harass, threaten, or defame any individual or government
                  official
                </li>
                <li>
                  Attempt to gain unauthorized access to the system or other
                  users' accounts
                </li>
                <li>
                  Share access credentials with third parties or use others'
                  accounts
                </li>
                <li>Interfere with the normal operation of the system</li>
                <li>Submit obscene, offensive, or abusive content</li>
                <li>Spam or repeatedly submit frivolous complaints</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              5. Admin Rights and Moderation
            </h2>
            <p className="text-slate-700 leading-relaxed">
              System administrators have the right to review, manage, and remove
              complaints that violate these terms. Administrators may close
              accounts that are used for abuse, harassment, or system
              interference. Decisions made by administrators are final and
              binding.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              6. Disclaimer of Warranties
            </h2>
            <p className="text-slate-700 leading-relaxed">
              The SPC Reporting System is provided "as is" without warranty of
              any kind. We do not guarantee that the system will be available at
              all times or that all complaints will result in immediate action.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              7. System Updates and Changes
            </h2>
            <p className="text-slate-700 leading-relaxed">
              The Municipal Government reserves the right to update, modify, or
              discontinue the SPC Reporting System at any time. Features and
              functionality may be changed without prior notice to better serve
              the community.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              8. Limitation of Liability
            </h2>
            <p className="text-slate-700 leading-relaxed">
              The Municipal Government and its officers shall not be liable for
              any damages resulting from the use or inability to use this system,
              including but not limited to data loss, lost profits, or
              interruptions in service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              9. Governing Law
            </h2>
            <p className="text-slate-700 leading-relaxed">
              These Terms of Service are governed by the laws of the
              jurisdiction in which the Municipal Government operates.
            </p>
          </section>

          <section className="pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              By using the SPC Reporting System, you acknowledge that you have
              read, understood, and agree to be bound by all terms and conditions
              outlined in this document.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
