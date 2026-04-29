import { useState, useRef } from "react";
import { X, ChevronRight, ChevronLeft, Upload, Check, MapPin, FileText, Tag, Image as ImageIcon, AlertCircle, Loader } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useApp } from "../../context/AppContext";
import { uploadToCloudinary, generatePreviewUrl, validateImageFile } from "../../../lib/cloudinaryService";

interface ComplaintSubmissionModalProps {
  onClose: () => void;
}

const COMPLAINT_CATEGORIES = [
  "Road & Infrastructure",
  "Waste Management",
  "Public Safety",
  "Noise Complaint",
  "Street Lighting",
  "Water & Drainage",
  "Public Health",
  "Other",
] as const;

type ComplaintCategory = (typeof COMPLAINT_CATEGORIES)[number];

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
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createComplaint, setToastMessage } = useApp();

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  /**
   * Upload a file to Cloudinary and update imageUrl state.
   * Returns the secure_url on success, or null on failure.
   */
  const uploadFile = async (fileToUpload: File): Promise<string | null> => {
    setIsUploading(true);
    setUploadError(null);

    try {
      console.log("[ComplaintModal] Starting upload:", { cloudName, uploadPreset, fileName: fileToUpload.name });
      const response = await uploadToCloudinary(fileToUpload, cloudName, uploadPreset);
      console.log("[ComplaintModal] Upload response:", response);

      if (response.success && response.secure_url) {
        setImageUrl(response.secure_url);
        console.log("[ComplaintModal] Upload succeeded, imageUrl set:", response.secure_url);
        return response.secure_url;
      } else {
        const errorMsg = response.error || "Failed to upload image";
        console.error("[ComplaintModal] Upload failed:", errorMsg);
        setUploadError(errorMsg);
        return null;
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Upload failed. Please try again.";
      console.error("[ComplaintModal] Upload error:", error);
      setUploadError(errorMsg);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Auto-upload to Cloudinary as soon as the user selects a file.
   * This ensures imageUrl is populated before the user reaches the Submit step.
   */
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file
    const validation = validateImageFile(selectedFile);
    if (!validation.isValid) {
      setUploadError(validation.error || "Invalid file");
      return;
    }

    // Clear previous state
    setUploadError(null);
    setImageUrl(null);
    setFile(selectedFile);

    // Generate local data-URL preview immediately for visual feedback
    try {
      const previewUrl = await generatePreviewUrl(selectedFile);
      setPreview(previewUrl);
    } catch {
      setUploadError("Could not generate preview");
      return;
    }

    // Auto-upload to Cloudinary right away — no manual button click needed
    await uploadFile(selectedFile);
  };

  const handleRemoveImage = () => {
    setFile(null);
    setPreview(null);
    setImageUrl(null);
    setUploadError(null);
    // Reset the file input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const canProceed = () => {
    if (step === 1) return category !== "";
    if (step === 2) return description.trim().length >= 20;
    // Block navigation on step 3 while uploading to ensure imageUrl is set
    if (step === 3) return !isUploading;
    return true;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Safety net: if a file was selected but auto-upload failed or errored,
      // attempt upload one more time before saving to Supabase.
      let finalImageUrl = imageUrl;
      if (file && !finalImageUrl && !isUploading) {
        console.log("[ComplaintModal] Retrying upload before submit...");
        finalImageUrl = await uploadFile(file);
      }

      console.log("[ComplaintModal] Submitting complaint with imageUrl:", finalImageUrl);

      const response = await createComplaint({
        category: category as ComplaintCategory,
        description,
        location: location || undefined,
        imageUrl: finalImageUrl || undefined,
      });

      if (response.success) {
        setToastMessage(response.message);
        onClose();
      } else {
        setToastMessage(response.error || "Failed to submit complaint. Please try again.");
      }
    } catch (error) {
      setToastMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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
                  Upload a photo to support your complaint (optional)
                </p>

                {!preview ? (
                  /* No file selected yet — show drop zone */
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-[#1e3a5f]/50 hover:bg-slate-50 transition-all group"
                  >
                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-[#1e3a5f]/10 transition-colors">
                      <Upload className="w-6 h-6 text-slate-400 group-hover:text-[#1e3a5f] transition-colors" />
                    </div>
                    <p className="text-slate-600 text-sm">Click to upload or drag &amp; drop</p>
                    <p className="text-slate-400 text-xs mt-1">PNG, JPG, GIF, WebP up to 5MB</p>
                  </div>
                ) : (
                  /* File selected — show preview + upload status */
                  <div className="space-y-4">
                    {/* Image Preview */}
                    <div className="relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200 aspect-video flex items-center justify-center">
                      <img
                        src={preview}
                        alt="Preview"
                        className={`w-full h-full object-cover transition-opacity ${isUploading ? "opacity-60" : "opacity-100"}`}
                      />
                      {/* Uploading overlay */}
                      {isUploading && (
                        <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center gap-2">
                          <Loader className="w-7 h-7 text-white animate-spin" />
                          <span className="text-white text-sm font-medium">Uploading to cloud...</span>
                        </div>
                      )}
                    </div>

                    {/* Upload status badge */}
                    {isUploading ? (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                        <Loader className="w-4 h-4 text-blue-600 animate-spin flex-shrink-0" />
                        <span className="text-sm text-blue-700">Uploading image to cloud storage…</span>
                      </div>
                    ) : imageUrl ? (
                      <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span className="text-sm text-emerald-700">Image uploaded successfully</span>
                      </div>
                    ) : uploadError ? (
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-red-700">{uploadError}</p>
                        </div>
                        {/* Retry button — shown only on upload error */}
                        <button
                          onClick={() => file && uploadFile(file)}
                          className="w-full flex items-center justify-center gap-2 text-sm bg-[#1e3a5f] hover:bg-[#162d4a] text-white py-2 px-4 rounded-xl transition-all"
                        >
                          <Upload className="w-4 h-4" />
                          Retry Upload
                        </button>
                      </div>
                    ) : null}

                    <button
                      onClick={handleRemoveImage}
                      disabled={isUploading}
                      className="w-full text-sm border border-slate-200 text-slate-600 hover:text-slate-700 hover:bg-slate-50 py-2 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Change Image
                    </button>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                />

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
                <h3 className="text-slate-800 mb-1">Review &amp; Submit</h3>
                <p className="text-slate-500 text-sm mb-5">
                  Confirm your complaint details before submitting
                </p>

                <div className="space-y-3">
                  {/* Show the Cloudinary-hosted image in the review step */}
                  {imageUrl && (
                    <div className="rounded-xl overflow-hidden bg-slate-100 border border-slate-200 aspect-video flex items-center justify-center">
                      <img
                        src={imageUrl}
                        alt="Complaint attachment"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Fallback: local preview while upload is still running */}
                  {!imageUrl && preview && isUploading && (
                    <div className="relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200 aspect-video">
                      <img src={preview} alt="Uploading..." className="w-full h-full object-cover opacity-60" />
                      <div className="absolute inset-0 flex items-center justify-center gap-2">
                        <Loader className="w-5 h-5 animate-spin text-slate-600" />
                        <span className="text-slate-700 text-sm">Uploading…</span>
                      </div>
                    </div>
                  )}

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
                    {imageUrl && (
                      <>
                        <div className="h-px bg-slate-200" />
                        <div className="flex justify-between items-start">
                          <span className="text-xs text-slate-500 uppercase tracking-wide">Attachment</span>
                          <span className="text-sm text-emerald-600">✓ Image attached</span>
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
              disabled={isSubmitting || isUploading}
              className="flex items-center gap-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-5 rounded-xl transition-all disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : isUploading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Uploading...
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
