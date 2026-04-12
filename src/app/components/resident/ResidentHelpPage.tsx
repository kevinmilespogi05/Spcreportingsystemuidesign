import { useState } from "react";
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  ExternalLink,
  Search,
  BookOpen,
  Tag,
  Upload,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const faqs = [
  {
    question: "How do I submit a complaint?",
    answer:
      "Click the 'Submit New Complaint' button on your dashboard. You'll be guided through a 4-step process: selecting a category, providing details and location, optionally uploading attachments, and reviewing before submitting.",
  },
  {
    question: "How long does it take to resolve a complaint?",
    answer:
      "Resolution times vary by category and complexity. Simple issues like street lighting are typically resolved within 3–7 business days. Infrastructure repairs may take 2–4 weeks. You'll receive notifications at each status change.",
  },
  {
    question: "Can I edit or cancel a complaint after submission?",
    answer:
      "Once submitted, complaints cannot be edited to maintain record integrity. If you submitted incorrect information, you may add a note by contacting the support team or submit a new complaint with the correct details.",
  },
  {
    question: "How will I know when my complaint status changes?",
    answer:
      "You'll receive in-app notifications (the bell icon in the top right) whenever your complaint status is updated. Make sure to check your notification panel regularly for updates.",
  },
  {
    question: "What happens if my complaint is rejected?",
    answer:
      "If your complaint is rejected, the admin will provide a reason in the remarks field. Common reasons include duplicate complaints, outside of jurisdiction, or insufficient information. You may resubmit with the required information.",
  },
  {
    question: "Can I attach photos to my complaint?",
    answer:
      "Yes! Step 3 of the complaint submission process allows you to upload photos (JPG, PNG) or documents (PDF) up to 10MB. Including photos significantly helps officials assess and resolve issues faster.",
  },
  {
    question: "What categories of complaints can I submit?",
    answer:
      "You can submit complaints in 8 categories: Road & Infrastructure, Waste Management, Public Safety, Noise Complaint, Street Lighting, Water & Drainage, Public Health, and Other.",
  },
  {
    question: "Is my personal information kept confidential?",
    answer:
      "Yes. Your personal information is only accessible to authorized government personnel handling your complaint. It is never shared with other residents or third parties.",
  },
];

const howToSteps = [
  {
    icon: Tag,
    step: 1,
    title: "Choose a Category",
    desc: "Select the category that best matches your concern from 8 available options.",
  },
  {
    icon: FileText,
    step: 2,
    title: "Provide Details",
    desc: "Describe your concern clearly. Include the location and how long the issue has existed.",
  },
  {
    icon: Upload,
    step: 3,
    title: "Add Attachments",
    desc: "Optionally upload photos or documents to support your complaint. This speeds up resolution.",
  },
  {
    icon: Eye,
    step: 4,
    title: "Review & Submit",
    desc: "Review your complaint details and submit. You'll receive a tracking ID immediately.",
  },
];

const contactInfo = [
  {
    icon: Phone,
    label: "Hotline",
    value: "(02) 8700-1234",
    sub: "Monday–Friday, 8AM–5PM",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Mail,
    label: "Email Support",
    value: "support@spc.gov.ph",
    sub: "Response within 24 hours",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: MapPin,
    label: "Office Address",
    value: "Municipal Hall, Brgy. Centro",
    sub: "Open Mon–Fri, 8AM–5PM",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    icon: MessageSquare,
    label: "SMS Feedback",
    value: "0917-100-2345",
    sub: "For urgent concerns",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
];

export function ResidentHelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-slate-800">Help & Support</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Find answers to common questions and learn how to use the SPC system
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6 space-y-8">
        {/* How to Submit Guide */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-[#1e3a5f]" />
            <h2 className="text-slate-700">How to Submit a Complaint</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {howToSteps.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm relative overflow-hidden"
              >
                <div className="absolute top-3 right-3 text-slate-100 text-4xl leading-none select-none">
                  {item.step}
                </div>
                <div className="w-9 h-9 bg-[#1e3a5f]/10 rounded-xl flex items-center justify-center mb-3">
                  <item.icon className="w-4.5 h-4.5 text-[#1e3a5f]" />
                </div>
                <p className="text-slate-800 text-sm mb-1">{item.title}</p>
                <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Status Guide */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h2 className="text-slate-700 mb-4">Understanding Complaint Statuses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                status: "Pending",
                icon: Clock,
                color: "text-amber-600",
                bg: "bg-amber-50",
                border: "border-amber-200",
                desc: "Your complaint has been received and is waiting for admin review and assignment.",
              },
              {
                status: "In Progress",
                icon: CheckCircle2,
                color: "text-blue-600",
                bg: "bg-blue-50",
                border: "border-blue-200",
                desc: "Your complaint has been assigned to a team and action is currently being taken.",
              },
              {
                status: "Resolved",
                icon: CheckCircle2,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
                border: "border-emerald-200",
                desc: "The issue has been addressed and resolved. Please verify and provide feedback.",
              },
              {
                status: "Rejected",
                icon: HelpCircle,
                color: "text-red-600",
                bg: "bg-red-50",
                border: "border-red-200",
                desc: "Your complaint was rejected. Check the admin remarks for the reason and next steps.",
              },
            ].map((item) => (
              <div
                key={item.status}
                className={`flex gap-3 p-3.5 rounded-xl border ${item.border} ${item.bg}`}
              >
                <div className={`flex-shrink-0 mt-0.5 ${item.color}`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className={`text-sm ${item.color} mb-0.5`}>{item.status}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-5 h-5 text-[#1e3a5f]" />
            <h2 className="text-slate-700">Frequently Asked Questions</h2>
          </div>

          {/* Search FAQs */}
          <div className="relative mb-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all shadow-sm"
            />
          </div>

          <div className="space-y-2">
            {filteredFaqs.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                <p className="text-slate-500 text-sm">No questions match your search.</p>
              </div>
            ) : (
              filteredFaqs.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
                >
                  <button
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="text-sm text-slate-800">{faq.question}</span>
                    {openFaq === i ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-4 border-t border-slate-100">
                          <p className="text-sm text-slate-600 leading-relaxed pt-3">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </div>
        </section>

        {/* Contact Information */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Phone className="w-5 h-5 text-[#1e3a5f]" />
            <h2 className="text-slate-700">Contact Us</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {contactInfo.map((info, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-start gap-3"
              >
                <div className={`w-10 h-10 ${info.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <info.icon className={`w-5 h-5 ${info.color}`} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-0.5">{info.label}</p>
                  <p className="text-sm text-slate-800">{info.value}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{info.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Footer note */}
        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <ExternalLink className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-700">
            For urgent public safety concerns, please contact the local emergency hotline at{" "}
            <span className="font-medium">911</span> or the barangay hall directly.
          </p>
        </div>
      </div>
    </div>
  );
}
