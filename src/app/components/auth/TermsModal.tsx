import { X, ChevronUp } from "lucide-react";
import { useState } from "react";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

export function TermsModal({ isOpen, onClose, onAccept }: TermsModalProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl max-h-[90vh] w-full max-w-2xl flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-900">Terms of Service</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1">
          <div className="p-6 space-y-6 text-sm text-slate-700 leading-relaxed">
            <section>
              <h3 className="font-bold text-slate-900 mb-2">
                1. Acceptance of Terms
              </h3>
              <p>
                By accessing and using the SPC Reporting System, you accept and
                agree to be bound by the terms and provision of this agreement. If
                you do not agree to abide by the above, please do not use this
                service.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-slate-900 mb-2">
                2. User Responsibilities
              </h3>
              <div className="space-y-2">
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
              <h3 className="font-bold text-slate-900 mb-2">
                3. Permitted Use
              </h3>
              <p>
                The SPC Reporting System is intended solely for submitting and
                managing complaints about municipal services, infrastructure, and
                government operations. You agree to use this system only for its
                intended purpose.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-slate-900 mb-2">
                4. Prohibited Activities
              </h3>
              <p className="mb-2">You agree NOT to:</p>
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
            </section>

            <section>
              <h3 className="font-bold text-slate-900 mb-2">
                5. Admin Rights and Moderation
              </h3>
              <p>
                System administrators have the right to review, manage, and remove
                complaints that violate these terms. Administrators may close
                accounts that are used for abuse, harassment, or system
                interference. Decisions made by administrators are final and
                binding.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-slate-900 mb-2">
                6. Disclaimer of Warranties
              </h3>
              <p>
                The SPC Reporting System is provided "as is" without warranty of
                any kind. We do not guarantee that the system will be available at
                all times or that all complaints will result in immediate action.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-slate-900 mb-2">
                7. System Updates and Changes
              </h3>
              <p>
                The Municipal Government reserves the right to update, modify, or
                discontinue the SPC Reporting System at any time. Features and
                functionality may be changed without prior notice to better serve
                the community.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-slate-900 mb-2">
                8. Limitation of Liability
              </h3>
              <p>
                The Municipal Government and its officers shall not be liable for
                any damages resulting from the use or inability to use this system,
                including but not limited to data loss, lost profits, or
                interruptions in service.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-slate-900 mb-2">
                9. Governing Law
              </h3>
              <p>
                These Terms of Service are governed by the laws of the
                jurisdiction in which the Municipal Government operates.
              </p>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 flex-shrink-0 bg-slate-50 rounded-b-2xl">
          <button
            onClick={() => {
              onAccept?.();
              onClose();
            }}
            className="w-full bg-[#1e3a5f] hover:bg-[#162d4a] text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
