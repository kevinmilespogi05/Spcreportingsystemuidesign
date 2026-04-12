/**
 * Cloudinary Image Upload Service
 * Handles image uploads to Cloudinary and returns secure URLs for storage
 */

export interface CloudinaryUploadResponse {
  success: boolean;
  secure_url?: string;
  public_id?: string;
  error?: string;
  message: string;
}

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  error?: {
    message: string;
  };
}

/**
 * Upload image to Cloudinary
 * @param file - File to upload
 * @param cloudName - Cloudinary cloud name (from environment variables)
 * @param uploadPreset - Cloudinary upload preset (from environment variables)
 * @returns Object with success status and secure URL or error
 */
export const uploadToCloudinary = async (
  file: File,
  cloudName: string,
  uploadPreset: string
): Promise<CloudinaryUploadResponse> => {
  try {
    // Validate file
    if (!file) {
      return {
        success: false,
        message: "Validation failed",
        error: "File is required",
      };
    }

    // Validate environment variables
    if (!cloudName || !uploadPreset) {
      console.error("Cloudinary config missing:", { cloudName, uploadPreset });
      return {
        success: false,
        message: "Upload configuration error",
        error: "Cloudinary is not configured. Please add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to .env",
      };
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        message: "File size too large",
        error: "File must be less than 5MB",
      };
    }

    // Validate file type (images and PDFs only)
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        message: "Invalid file type",
        error: "Please upload an image (JPG, PNG, GIF, WebP) or PDF",
      };
    }

    // Create FormData for upload
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    console.log("Uploading to Cloudinary:", {
      cloudName,
      uploadPreset,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Cloudinary error response:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
    }

    const data: CloudinaryResponse = await response.json();

    console.log("Cloudinary upload response:", data);

    // Check for Cloudinary errors
    if (data.error) {
      console.error("Cloudinary API error:", data.error);
      return {
        success: false,
        message: "Upload failed",
        error: data.error.message || "Failed to upload to Cloudinary",
      };
    }

    if (!data.secure_url) {
      console.error("No secure_url in response:", data);
      return {
        success: false,
        message: "Upload failed",
        error: "No URL returned from upload",
      };
    }

    console.log("Upload successful:", data.secure_url);

    return {
      success: true,
      secure_url: data.secure_url,
      public_id: data.public_id,
      message: "Image uploaded successfully",
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return {
      success: false,
      message: "Upload failed",
      error:
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during upload",
    };
  }
};

/**
 * Generate preview URL from file using FileReader
 * @param file - File to preview
 * @returns Promise that resolves to data URL
 */
export const generatePreviewUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        resolve(result);
      } else {
        reject(new Error("Failed to generate preview"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

/**
 * Validate image file before upload
 * @param file - File to validate
 * @returns Object with validation result and error message
 */
export const validateImageFile = (
  file: File
): { isValid: boolean; error?: string } => {
  // Check file existence
  if (!file) {
    return { isValid: false, error: "File is required" };
  }

  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { isValid: false, error: "File must be less than 5MB" };
  }

  // Check file type
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
  ];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "Please upload an image (JPG, PNG, GIF, WebP) or PDF",
    };
  }

  return { isValid: true };
};
