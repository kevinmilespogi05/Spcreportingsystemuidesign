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

const isComplaintCategory = (value: string): value is ComplaintCategory => {
  return COMPLAINT_CATEGORIES.includes(value as ComplaintCategory);
};

const steps = [
  { id: 1, label: "Details", icon: FileText },
  { id: 2, label: "Category", icon: Tag },
  { id: 3, label: "Attachments", icon: ImageIcon },
  { id: 4, label: "Review", icon: Check },
];

export function ComplaintSubmissionModal({ onClose }: ComplaintSubmissionModalProps) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<ComplaintCategory | "">("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // AI Integration states
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [aiConfidence, setAiConfidence] = useState<number>(0);
  const [aiSeverity, setAiSeverity] = useState<string>("");
  const [aiUrgency, setAiUrgency] = useState<string>("");
  const [isLoadingAiSuggestion, setIsLoadingAiSuggestion] = useState(false);
  const [imageVerificationStatus, setImageVerificationStatus] = useState<string | null>(null);
  const [imageVerificationExplanation, setImageVerificationExplanation] = useState<string>("");
  const [isDuplicateWarning, setIsDuplicateWarning] = useState(false);
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [duplicateSimilarIds, setDuplicateSimilarIds] = useState<string[]>([]);
  const [ignoreDuplicateWarning, setIgnoreDuplicateWarning] = useState(false);
  
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
   * Call the AI categorization API to suggest a category based on title + description
   */
  const getAiCategorySuggestion = async (titleText: string, descriptionText: string) => {
    setIsLoadingAiSuggestion(true);
    try {
      const response = await fetch("/.netlify/functions/categorize-complaint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: titleText,
          description: descriptionText,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      
      const data = await response.json();
      if (data.suggestedCategory) {
        const suggestedCategory = data.suggestedCategory as string;
        setAiSuggestion(suggestedCategory);
        setAiConfidence(data.confidence || 0);
        setAiSeverity(data.severity || "");
        setAiUrgency(data.urgency || "");
        if (isComplaintCategory(suggestedCategory)) {
          setCategory(suggestedCategory);
        }
        console.log("[ComplaintModal] AI suggestion:", data);
      }
    } catch (error) {
      // If API fails (e.g., in dev with vite), use mock AI suggestion based on keywords
      console.warn("[ComplaintModal] AI API failed, using keyword-based suggestion:", error);
      const combinedText = `${titleText} ${descriptionText}`.toLowerCase();
      
      // Simple keyword matching for demo purposes
      let suggested = "Other";
      let severity = "medium";
      let urgency = "medium";
      
      if (combinedText.includes("road") || combinedText.includes("pothole") || combinedText.includes("pavement")) {
        suggested = "Road & Infrastructure";
        severity = "high";
      } else if (combinedText.includes("trash") || combinedText.includes("garbage") || combinedText.includes("waste")) {
        suggested = "Waste Management";
        severity = "medium";
      } else if (combinedText.includes("crime") || combinedText.includes("theft") || combinedText.includes("safe")) {
        suggested = "Public Safety";
        severity = "high";
        urgency = "high";
      } else if (combinedText.includes("noise") || combinedText.includes("loud") || combinedText.includes("sound")) {
        suggested = "Noise Complaint";
        severity = "low";
      } else if (combinedText.includes("light") || combinedText.includes("dark") || combinedText.includes("street light")) {
        suggested = "Street Lighting";
        severity = "medium";
      } else if (combinedText.includes("water") || combinedText.includes("drain") || combinedText.includes("flood")) {
        suggested = "Water & Drainage";
        severity = "high";
      } else if (combinedText.includes("health") || combinedText.includes("disease") || combinedText.includes("pest")) {
        suggested = "Public Health";
        severity = "high";
      }
      
      setAiSuggestion(suggested);
      setAiConfidence(0.72); // Mock confidence
      setAiSeverity(severity);
      setAiUrgency(urgency);
      if (isComplaintCategory(suggested)) {
        setCategory(suggested);
      }
      console.log("[ComplaintModal] Using mock AI suggestion:", { suggested, severity, urgency });
    } finally {
      setIsLoadingAiSuggestion(false);
    }
  };

  /**
   * Verify image using AI after upload
   */
  const verifyImageWithAi = async (imgUrl: string) => {
    try {
      const response = await fetch("/.netlify/functions/verify-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: imgUrl,
          category: category || "Uncategorized",
          description: description || "",
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      
      const data = await response.json();
      setImageVerificationStatus(data.status);
      setImageVerificationExplanation(data.explanation || "");
      console.log("[ComplaintModal] Image verification:", data);
    } catch (error) {
      // If verification service fails, do not mark as valid automatically.
      console.warn("[ComplaintModal] Image verification API failed, marking for manual review:", error);
      setImageVerificationStatus("needs_review");
      setImageVerificationExplanation("Automatic verification is unavailable right now. Staff will manually review this image.");
    }
  };

  /**
   * Detect duplicates before submission
   */
  const detectDuplicatesBeforeSubmit = async () => {
    try {
      const response = await fetch("/.netlify/functions/detect-duplicates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          location: location || "",
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      
      const data = await response.json();
      if (data.isDuplicate && data.matchCount > 0) {
        setIsDuplicateWarning(true);
        setDuplicateCount(data.matchCount);
        setDuplicateSimilarIds(data.similarIds || []);
        console.log("[ComplaintModal] Duplicate warning:", data);
        return false; // Don't proceed with submit yet
      }
      return true; // Safe to proceed
    } catch (error) {
      // If API fails, proceed anyway (no duplicates found)
      console.warn("[ComplaintModal] Duplicate detection API failed, proceeding:", error);
      return true;
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
    const uploadedUrl = await uploadFile(selectedFile);
    
    // Verify image with AI after successful upload
    if (uploadedUrl) {
      await verifyImageWithAi(uploadedUrl);
    }
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
    if (step < 4) {
      // When moving from step 1 to step 2, get AI suggestion
      if (step === 1) {
        getAiCategorySuggestion(title, description);
      }
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const canProceed = () => {
    if (step === 1) return title.trim().length > 0 && description.trim().length >= 20;
    if (step === 2) return category !== "";
    // Block navigation on step 3 while uploading to ensure imageUrl is set
    if (step === 3) return !isUploading;
    return true;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // First, check for duplicates (unless user already acknowledged warning)
      if (!ignoreDuplicateWarning) {
        const canSubmit = await detectDuplicatesBeforeSubmit();
        if (!canSubmit) {
          setIsSubmitting(false);
          return; // User will see the duplicate warning and can decide
        }
      }

      // Safety net: if a file was selected but auto-upload failed or errored,
      // attempt upload one more time before saving to Supabase.
      let finalImageUrl = imageUrl;
      if (file && !finalImageUrl && !isUploading) {
        console.log("[ComplaintModal] Retrying upload before submit...");
        finalImageUrl = await uploadFile(file);
      }

      console.log("[ComplaintModal] Submitting complaint with imageUrl:", finalImageUrl);

      // Combine title and description for submission
      const fullDescription = `${title}\n\n${description}`;

      const response = await createComplaint({
        category: category as ComplaintCategory,
        description: fullDescription,
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
                className="space-y-4"
              >
                <div>
                  <h3 className="text-slate-800 mb-1">Provide Details</h3>
                  <p className="text-slate-500 text-sm mb-5">
                    Describe your concern clearly and specifically (our AI will suggest a category)
                  </p>
                </div>

                <div>
                  <label className="text-sm text-slate-600 mb-1.5 block">
                    Title <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Brief summary of your concern (e.g., Broken streetlight near school)"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]/20 focus:border-[#1e3a5f] transition-all"
                  />
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
                  <h3 className="text-slate-800 mb-1">Select Category</h3>
                  <p className="text-slate-500 text-sm mb-5">
                    Choose the category that best describes your concern
                  </p>
                </div>

                {/* AI Suggestion Section */}
                {isLoadingAiSuggestion && (
                  <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <Loader className="w-4 h-4 text-blue-600 animate-spin" />
                    <span className="text-sm text-blue-700">AI is analyzing your complaint...</span>
                  </div>
                )}

                {aiSuggestion && !isLoadingAiSuggestion && (
                  <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
                        🤖 AI Suggestion
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded">
                        {Math.round(aiConfidence * 100)}% confident
                      </span>
                    </div>
                    <p className="text-sm text-emerald-900 font-medium mb-2">{aiSuggestion}</p>
                    <div className="flex gap-2 text-xs">
                      {aiSeverity && (
                        <span className="px-2 py-1 bg-white/60 text-slate-700 rounded border border-emerald-200">
                          Severity: {aiSeverity}
                        </span>
                      )}
                      {aiUrgency && (
                        <span className="px-2 py-1 bg-white/60 text-slate-700 rounded border border-emerald-200">
                          Urgency: {aiUrgency}
                        </span>
                      )}
                    </div>
                    {isComplaintCategory(aiSuggestion) && category !== aiSuggestion && (
                      <button
                        onClick={() => setCategory(aiSuggestion)}
                        className="mt-3 text-xs font-medium text-emerald-800 bg-white border border-emerald-300 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-all"
                      >
                        Use This Category
                      </button>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  {COMPLAINT_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`text-left px-3.5 py-3 rounded-xl border-2 text-sm transition-all ${
                        category === cat
                          ? "border-[#1e3a5f] bg-[#1e3a5f]/5 text-[#1e3a5f]"
                          : aiSuggestion === cat
                          ? "border-emerald-400 bg-emerald-50 text-emerald-700 hover:border-emerald-500"
                          : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {category === cat && (
                        <span className="inline-block mr-1">✓</span>
                      )}
                      <span className="block">{cat}</span>
                    </button>
                  ))}
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
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span className="text-sm text-emerald-700">Image uploaded successfully</span>
                        </div>
                        
                        {/* AI Image Verification Status */}
                        {imageVerificationStatus && (
                          <div className={`p-3 rounded-xl border ${
                            imageVerificationStatus === 'valid' 
                              ? 'bg-emerald-50 border-emerald-200' 
                              : imageVerificationStatus === 'needs_review'
                              ? 'bg-amber-50 border-amber-200'
                              : 'bg-red-50 border-red-200'
                          }`}>
                            <div className="flex items-start gap-2">
                              {imageVerificationStatus === 'valid' && (
                                <>
                                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-sm font-medium text-emerald-900">Image is relevant and clear</p>
                                    {imageVerificationExplanation && (
                                      <p className="text-xs text-emerald-700 mt-1">{imageVerificationExplanation}</p>
                                    )}
                                  </div>
                                </>
                              )}
                              {imageVerificationStatus === 'needs_review' && (
                                <>
                                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-sm font-medium text-amber-900">Image needs review by staff</p>
                                    {imageVerificationExplanation && (
                                      <p className="text-xs text-amber-700 mt-1">{imageVerificationExplanation}</p>
                                    )}
                                  </div>
                                </>
                              )}
                              {imageVerificationStatus === 'rejected' && (
                                <>
                                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-sm font-medium text-red-900">Image cannot be used</p>
                                    {imageVerificationExplanation && (
                                      <p className="text-xs text-red-700 mt-1">{imageVerificationExplanation}</p>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        )}
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
                      <span className="text-xs text-slate-500 uppercase tracking-wide flex-shrink-0">Title</span>
                      <p className="text-sm text-slate-700 text-right leading-relaxed">
                        {title.length > 100 ? title.slice(0, 100) + "..." : title}
                      </p>
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

                  {isDuplicateWarning && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <div className="flex items-start gap-3 mb-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-amber-900 mb-1">
                            ⚠️ Similar complaints detected
                          </p>
                          <p className="text-xs text-amber-800 mb-2">
                            We found {duplicateCount} similar complaint{duplicateCount !== 1 ? 's' : ''} that may address your concern.
                            Please review before submitting.
                          </p>
                          {duplicateSimilarIds.length > 0 && (
                            <p className="text-xs text-amber-700">
                              <span className="font-medium">Similar IDs:</span> {duplicateSimilarIds.slice(0, 3).join(', ')}
                            </p>
                          )}
                        </div>
                      </div>
                      {!ignoreDuplicateWarning && (
                        <button
                          onClick={() => setIgnoreDuplicateWarning(true)}
                          className="w-full text-xs font-medium text-amber-700 bg-white border border-amber-300 hover:bg-amber-50 py-2 px-3 rounded-lg transition-all"
                        >
                          I understand, continue anyway →
                        </button>
                      )}
                    </div>
                  )}

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
              disabled={isSubmitting || isUploading || (isDuplicateWarning && !ignoreDuplicateWarning)}
              className="flex items-center gap-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-5 rounded-xl transition-all disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {ignoreDuplicateWarning ? "Submitting..." : "Submitting..."}
                </>
              ) : isUploading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : ignoreDuplicateWarning ? (
                <>
                  <Check className="w-4 h-4" />
                  Submit Anyway
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
