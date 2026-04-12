import { X } from "lucide-react";

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl max-h-[90vh] w-full max-w-2xl flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-900">Privacy Policy</h2>
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
              <h3 className="font-bold text-slate-900 mb-2">1. Introduction</h3>
              <p>
                The SPC Reporting System ("we", "us", "our", or the "Municipality")
                is committed to protecting your privacy. This Privacy Policy
                explains how we collect, use, disclose, and safeguard your
                information when you use our reporting platform.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-slate-900 mb-2">
                2. Information We Collect
              </h3>
              <div className="space-y-2">
                <p>
                  <strong>Account Information:</strong> When you register, we
                  collect your full name, email address, and phone number (if
                  provided).
                </p>
                <p>
                  <strong>Complaint Information:</strong> We collect details about
                  complaints you submit, including title, description, location,
                  category, attachments (photos/documents), and supporting
                  information.
                </p>
                <p>
                  <strong>Usage Data:</strong> We automatically log your IP address,
                  browser type, pages visited, timestamps, and other technical
                  information to improve system performance and security.
                </p>
                <p>
                  <strong>Contact Information:</strong> If you contact us, we may
                  collect your communication details and any information you
                  provide in messages.
                </p>
              </div>
            </section>

            <section>
              <h3 className="font-bold text-slate-900 mb-2">
                3. How We Use Your Information
              </h3>
              <p className="mb-2">We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Create and manage your user account</li>
                <li>Process and respond to your complaints</li>
                <li>Send you updates about the status of your complaints</li>
                <li>
                  Communicate with you regarding system maintenance or important
                  updates
                </li>
                <li>Improve and optimize the platform's functionality</li>
                <li>Analyze complaint trends and public service issues</li>
                <li>Investigate and prevent fraud and system abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h3 className="font-bold text-slate-900 mb-2">
                4. Data Storage and Security
              </h3>
              <p className="mb-2">
                Your information is stored securely using industry-standard
                encryption protocols (256-bit SSL/TLS). We use Supabase, a secure
                cloud database platform, to store all personal and complaint data.
              </p>
              <p>
                While we implement robust security measures, we cannot guarantee
                absolute security. We encourage you to use strong passwords and
                report any suspicious activity immediately.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-slate-900 mb-2">
                5. Disclosure of Information
              </h3>
              <div className="space-y-2">
                <p>
                  <strong>Government Officials:</strong> Your complaint information
                  may be shared with relevant government departments and officials
                  responsible for addressing reported issues.
                </p>
                <p>
                  <strong>Legal Compliance:</strong> We may disclose information if
                  required by law, court order, or to comply with government
                  requests.
                </p>
                <p>
                  <strong>Third Parties:</strong> We do NOT share, sell, or disclose
                  your personal information to third parties for marketing purposes.
                </p>
              </div>
            </section>

            <section>
              <h3 className="font-bold text-slate-900 mb-2">6. Data Retention</h3>
              <p>
                We retain your account information and complaint records for as long
                as necessary to fulfill the purposes outlined in this policy,
                comply with legal obligations, and resolve any disputes. Deleted
                complaints may be retained in backups for limited periods.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-slate-900 mb-2">
                7. Your Rights and Choices
              </h3>
              <p className="mb-2">You have the right to:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  Access your personal information and request corrections
                </li>
                <li>Request deletion of your account and associated data</li>
                <li>Opt out of non-essential communications</li>
                <li>
                  Request information about how your data is being used or shared
                </li>
              </ul>
              <p className="pt-2">
                To exercise these rights, please contact the Municipality's Data
                Protection Officer.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-slate-900 mb-2">
                8. Cookies and Tracking
              </h3>
              <p>
                The SPC Reporting System uses session cookies to maintain your login
                status and provide a seamless user experience. You can control cookie
                settings through your browser preferences.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-slate-900 mb-2">
                9. Third-Party Services
              </h3>
              <p>
                Our system uses Supabase for data storage and authentication.
                Supabase has its own privacy policy that governs how they handle
                data. We are not responsible for the privacy practices of third-party
                services.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-slate-900 mb-2">
                10. Changes to Privacy Policy
              </h3>
              <p>
                We may update this Privacy Policy from time to time. We will notify
                users of significant changes via email or system notifications.
                Continued use of the platform constitutes acceptance of updated
                terms.
              </p>
            </section>

            <section>
              <h3 className="font-bold text-slate-900 mb-2">11. Contact Us</h3>
              <p>
                If you have questions or concerns about this Privacy Policy or our
                privacy practices, please contact the Municipality's Data Protection
                Officer or submit an inquiry through the system.
              </p>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 flex-shrink-0 bg-slate-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full bg-[#1e3a5f] hover:bg-[#162d4a] text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
