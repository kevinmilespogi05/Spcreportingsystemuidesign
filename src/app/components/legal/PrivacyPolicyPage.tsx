import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router";

export function PrivacyPolicyPage() {
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
          <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
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
              1. Introduction
            </h2>
            <p className="text-slate-700 leading-relaxed">
              The SPC Reporting System ("we", "us", "our", or the "Municipality")
              is committed to protecting your privacy. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your
              information when you use our reporting platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              2. Information We Collect
            </h2>
            <div className="text-slate-700 leading-relaxed space-y-3">
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
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              3. How We Use Your Information
            </h2>
            <div className="text-slate-700 leading-relaxed space-y-2">
              <p>We use the information we collect to:</p>
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
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              4. Data Storage and Security
            </h2>
            <p className="text-slate-700 leading-relaxed mb-3">
              Your information is stored securely using industry-standard
              encryption protocols (256-bit SSL/TLS). We use Supabase, a secure
              cloud database platform, to store all personal and complaint data.
            </p>
            <p className="text-slate-700 leading-relaxed">
              While we implement robust security measures, we cannot guarantee
              absolute security. We encourage you to use strong passwords and
              report any suspicious activity immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              5. Disclosure of Information
            </h2>
            <div className="text-slate-700 leading-relaxed space-y-3">
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
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              6. Data Retention
            </h2>
            <p className="text-slate-700 leading-relaxed">
              We retain your account information and complaint records for as long
              as necessary to fulfill the purposes outlined in this policy,
              comply with legal obligations, and resolve any disputes. Deleted
              complaints may be retained in backups for limited periods.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              7. Your Rights and Choices
            </h2>
            <div className="text-slate-700 leading-relaxed space-y-2">
              <p>You have the right to:</p>
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
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              8. Cookies and Tracking
            </h2>
            <p className="text-slate-700 leading-relaxed">
              The SPC Reporting System uses session cookies to maintain your login
              status and provide a seamless user experience. You can control cookie
              settings through your browser preferences.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              9. Third-Party Services
            </h2>
            <p className="text-slate-700 leading-relaxed">
              Our system uses Supabase for data storage and authentication.
              Supabase has its own privacy policy that governs how they handle
              data. We are not responsible for the privacy practices of third-party
              services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              10. Changes to Privacy Policy
            </h2>
            <p className="text-slate-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify
              users of significant changes via email or system notifications.
              Continued use of the platform constitutes acceptance of updated
              terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              11. Contact Us
            </h2>
            <p className="text-slate-700 leading-relaxed">
              If you have questions or concerns about this Privacy Policy or our
              privacy practices, please contact the Municipality's Data Protection
              Officer or submit an inquiry through the system.
            </p>
          </section>

          <section className="pt-6 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              By using the SPC Reporting System, you acknowledge that you have
              read and understood this Privacy Policy and consent to the practices
              described herein.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
