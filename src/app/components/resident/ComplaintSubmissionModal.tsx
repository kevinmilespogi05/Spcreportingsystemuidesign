import { useState, useRef } from "react";
import { X, ChevronRight, ChevronLeft, Upload, Check, MapPin, FileText, Tag, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { COMPLAINT_CATEGORIES, ComplaintCategory, Complaint } from "../../data/mockData";
import { useApp } from "../../context/AppContext";

interface ComplaintSubmissionModalProps {
  onClose: () => void;
}

const steps = [
  { id: 1, label: "Category", icon: Tag },
  { id: 2, label: "Details", icon: FileText },
  { id: 3, label: "Attachments", icon: ImageIcon },
  { id: 4, label: "Review", icon: Check },
];

export function ComplaintSubmissionModal({ onClose }: ComplaintSubmissionModalProps) {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState<ComplaintCategory | "">("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { residentComplaints, setResidentComplaints, complaints, setComplaints, setToastMessage, user } = useApp();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const canProceed = () => {
    if (step === 1) return category !== "";
    if (step === 2) return description.trim().length > 20;
    return true;
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const newId = `SPC-2024-0${Math.floor(Math.random() * 90) + 10}`;
      const newComplaint: Complaint = {
        id: newId,
        residentName: user?.name || "Ana Cruz",
        residentEmail: user?.email || "ana.cruz@email.com",
        category: category as ComplaintCategory,
        description,
        location,
        dateSubmitted: new Date().toISOString().split("T")[0],
        status: "Pending",
      };
      setResidentComplaints([newComplaint, ...residentComplaints]);
      setComplaints([newComplaint, ...complaints]);
      setIsSubmitting(false);
      setToastMessage(`Complaint ${newId} submitted successfully! You'll receive updates via notifications.`);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0f2744] to-[#1e3a5f] px-6 py-5">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-white text-xl">Submit New Complaint</h2>
              <p className="text-blue-200/70 text-sm mt-0.5">Help us improve your community</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-0">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      step > s.id
                        ? "bg-emerald-400 text-white"
                        : step === s.id
                        ? "bg-white text-[#1e3a5f]"
                        : "bg-white/20 text-white/50"
                    }`}
                  >
                    {step > s.id ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <s.icon className="w-4 h-4" />
                    )}
                  </div>
                  <span
                    className={`text-xs mt-1 ${
                      step === s.id ? "text-white" : "text-white/50"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-1 mb-4 transition-all ${
                      step > s.id ? "bg-emerald-400" : "bg-white/20"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 min-h-[300px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-slate-800 mb-1">Select Category</h3>
                <p className="text-slate-500 text-sm mb-5">
                  Choose the category that best describes your concern
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {COMPLAINT_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`text-left px-3.5 py-3 rounded-xl border-2 text-sm transition-all ${
                        category === cat
                          ? "border-[#1e3a5f] bg-[#1e3a5f]/5 text-[#1e3a5f]"
                          : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <span className="block">{cat}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div>
                  <h3 className="text-slate-800 mb-1">Provide Details</h3>
                  <p className="text-slate-500 text-sm mb-5">
                    Describe your concern clearly and specifically
                  </p>
                </div>

                <div>
                  <label className="text-sm text-slate-600 mb-1.5 block">
                    Selected Category
                  </label>
                  <div className="px-3.5 py-2.5 bg-slate-100 rounded-xl text-sm text-slate-700 border border-slate-200">
                    {category}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-slate-600 mb-1.5 block">
                    Description <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the issue in detail. Include relevant information like how long the problem has existed, how it affects the community, etc."
                    rows={5}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all resize-none"
                  />
                  <p className="text-xs text-slate-400 mt-1 text-right">
                    {description.length} characters (min. 20)
                  </p>
                </div>

                <div>
                  <label className="text-sm text-slate-600 mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    Location / Address
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., 123 Rizal Street, Brgy. San Jose"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-slate-800 mb-1">Add Attachments</h3>
                <p className="text-slate-500 text-sm mb-5">
                  Upload photos or documents to support your complaint (optional)
                </p>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-[#1e3a5f]/50 hover:bg-slate-50 transition-all group"
                >
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-[#1e3a5f]/10 transition-colors">
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-[#1e3a5f] transition-colors" />
                  </div>
                  {fileName ? (
                    <>
                      <p className="text-slate-700 text-sm font-medium">{fileName}</p>
                      <p className="text-slate-400 text-xs mt-1">Click to change file</p>
                    </>
                  ) : (
                    <>
                      <p className="text-slate-600 text-sm">Click to upload or drag & drop</p>
                      <p className="text-slate-400 text-xs mt-1">PNG, JPG, PDF up to 10MB</p>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  className="hidden"
                />

                {fileName && (
                  <div className="flex items-center gap-2 mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-sm text-emerald-700">{fileName} ready to upload</span>
                    <button
                      onClick={() => setFileName(null)}
                      className="ml-auto text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <p className="text-xs text-slate-400 mt-4 text-center">
                  Adding photos significantly helps officials assess and resolve issues faster
                </p>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-slate-800 mb-1">Review & Submit</h3>
                <p className="text-slate-500 text-sm mb-5">
                  Confirm your complaint details before submitting
                </p>

                <div className="space-y-3">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-xs text-slate-500 uppercase tracking-wide">Category</span>
                      <span className="text-sm text-slate-800 text-right max-w-[60%]">{category}</span>
                    </div>
                    <div className="h-px bg-slate-200" />
                    <div className="flex justify-between items-start gap-4">
                      <span className="text-xs text-slate-500 uppercase tracking-wide flex-shrink-0">Description</span>
                      <p className="text-sm text-slate-700 text-right leading-relaxed">
                        {description.length > 120 ? description.slice(0, 120) + "..." : description}
                      </p>
                    </div>
                    {location && (
                      <>
                        <div className="h-px bg-slate-200" />
                        <div className="flex justify-between items-start">
                          <span className="text-xs text-slate-500 uppercase tracking-wide">Location</span>
                          <span className="text-sm text-slate-800 text-right">{location}</span>
                        </div>
                      </>
                    )}
                    {fileName && (
                      <>
                        <div className="h-px bg-slate-200" />
                        <div className="flex justify-between items-start">
                          <span className="text-xs text-slate-500 uppercase tracking-wide">Attachment</span>
                          <span className="text-sm text-slate-800">{fileName}</span>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                    <p className="text-xs text-blue-700 leading-relaxed">
                      By submitting, you confirm that the information provided is accurate and truthful.
                      Your complaint will be assigned a tracking ID upon submission.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={step === 1 ? onClose : handleBack}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors py-2 px-3 rounded-lg hover:bg-slate-100"
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 1 ? "Cancel" : "Back"}
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              Step {step} of {steps.length}
            </span>
          </div>

          {step < 4 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-1.5 text-sm bg-[#1e3a5f] hover:bg-[#162d4a] text-white py-2 px-5 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-5 rounded-xl transition-all disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Submit Complaint
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
