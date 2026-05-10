import { supabase } from "./supabase";
import { uploadToCloudinary } from "./cloudinaryService";

interface RegistrationData {
  fullName: string;
  email: string;
  password: string;
  idType: string;
  idFrontFile: File | null;
  idBackFile: File | null;
}

interface RegistrationResponse {
  success: boolean;
  message: string;
  error?: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  error?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

// Validate email format
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const validatePassword = (password: string): {
  isValid: boolean;
  message: string;
} => {
  if (password.length < 8) {
    return {
      isValid: false,
      message: "Password must be at least 8 characters long",
    };
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one uppercase letter",
    };
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one lowercase letter",
    };
  }

  // Check for at least one number
  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: "Password must contain at least one number",
    };
  }

  return { isValid: true, message: "" };
};

// Validate registration data
export const validateRegistrationData = (
  data: RegistrationData
): { isValid: boolean; error?: string } => {
  if (!data.fullName || !data.fullName.trim()) {
    return { isValid: false, error: "Full name is required" };
  }

  if (!data.email || !data.email.trim()) {
    return { isValid: false, error: "Email is required" };
  }

  if (!validateEmail(data.email)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }

  if (!data.password) {
    return { isValid: false, error: "Password is required" };
  }

  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    return { isValid: false, error: passwordValidation.message };
  }

  return { isValid: true };
};

// Register user - ONLY saves after all validation passes
export const registerUser = async (
  data: RegistrationData
): Promise<RegistrationResponse> => {
  try {
    // Validate input first
    const validation = validateRegistrationData(data);
    if (!validation.isValid) {
      return {
        success: false,
        message: "Validation failed",
        error: validation.error,
      };
    }

    const normalizedEmail = data.email.toLowerCase().trim();

    // ── Duplicate email pre-check ──────────────────────────────────────────
    // Query the residents table before attempting auth.signUp.
    // Supabase auth.signUp silently succeeds on duplicate emails when
    // email confirmation is disabled, so we must check explicitly.
    const { data: existing, error: lookupError } = await supabase
      .from("residents")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (lookupError) {
      console.error("Email lookup error:", lookupError);
      // Non-fatal: continue with signup if lookup fails unexpectedly
    } else if (existing) {
      return {
        success: false,
        message: "Registration failed",
        error: "This email address is already registered. Please sign in instead.",
      };
    }
    // ───────────────────────────────────────────────────────────────────────

    // Upload ID images to Cloudinary
    let idFrontUrl = null;
    let idBackUrl = null;

    if (data.idFrontFile) {
      const frontUpload = await uploadToCloudinary(data.idFrontFile, "ID Front");
      if (!frontUpload.success) {
        return {
          success: false,
          message: "Registration failed",
          error: "Failed to upload ID front image. Please try again.",
        };
      }
      idFrontUrl = frontUpload.secure_url;
    }

    if (data.idBackFile) {
      const backUpload = await uploadToCloudinary(data.idBackFile, "ID Back");
      if (!backUpload.success) {
        return {
          success: false,
          message: "Registration failed",
          error: "Failed to upload ID back image. Please try again.",
        };
      }
      idBackUrl = backUpload.secure_url;
    }

    // Create auth user
    const { data: authData, error: authError } =
      await supabase.auth.signUp({
        email: normalizedEmail,
        password: data.password,
      });

    if (authError) {
      console.error("Auth error:", authError);
      const msg = authError.message.toLowerCase();
      if (msg.includes("already registered") || msg.includes("already exists")) {
        return {
          success: false,
          message: "Registration failed",
          error: "This email address is already registered. Please sign in instead.",
        };
      }
      return {
        success: false,
        message: "Registration failed",
        error: authError.message || "An error occurred during registration",
      };
    }

    if (!authData.user) {
      return {
        success: false,
        message: "Registration failed",
        error: "Failed to create user account",
      };
    }

    // Now insert the resident record - ONLY after auth user is created
    const { error: insertError } = await supabase.from("residents").insert([
      {
        id: authData.user.id,
        full_name: data.fullName.trim(),
        email: normalizedEmail,
        role: "resident",
        status: "active",
        // New fields for user verification
        account_status: "pending_approval",
        id_type: data.idType,
        id_front_url: idFrontUrl,
        id_back_url: idBackUrl,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    if (insertError) {
      console.error("Insert error:", insertError);
      // Handle unique constraint violation from DB as a fallback
      if (insertError.code === "23505") {
        return {
          success: false,
          message: "Registration failed",
          error: "This email address is already registered. Please sign in instead.",
        };
      }
      return {
        success: false,
        message: "Registration failed",
        error: "Failed to save resident information. Please try again.",
      };
    }

    return {
      success: true,
      message: "Registration submitted successfully! Your account is pending approval.",
    };
  } catch (error) {
    console.error("Unexpected registration error:", error);
    return {
      success: false,
      message: "Registration failed",
      error: "An unexpected error occurred. Please try again.",
    };
  }
};


// Login user
// Create user as admin - for admin user creation feature
interface CreateUserAsAdminData {
  fullName: string;
  email: string;
  password: string;
  userType: "resident" | "admin";
}

interface CreateUserAsAdminResponse {
  success: boolean;
  message: string;
  error?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    password?: string; // Returned only for admin confirmation
  };
}

export const createUserAsAdmin = async (
  data: CreateUserAsAdminData
): Promise<CreateUserAsAdminResponse> => {
  try {
    // Validate input
    if (!data.fullName || !data.fullName.trim()) {
      return {
        success: false,
        message: "Validation failed",
        error: "Full name is required",
      };
    }

    if (!data.email || !data.email.trim()) {
      return {
        success: false,
        message: "Validation failed",
        error: "Email is required",
      };
    }

    if (!validateEmail(data.email)) {
      return {
        success: false,
        message: "Validation failed",
        error: "Please enter a valid email address",
      };
    }

    if (!data.password) {
      return {
        success: false,
        message: "Validation failed",
        error: "Password is required",
      };
    }

    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      return {
        success: false,
        message: "Validation failed",
        error: passwordValidation.message,
      };
    }

    if (!["resident", "admin"].includes(data.userType)) {
      return {
        success: false,
        message: "Validation failed",
        error: "Invalid user type",
      };
    }

    // Create auth user
    const { data: authData, error: authError } =
      await supabase.auth.signUp({
        email: data.email.toLowerCase(),
        password: data.password,
      });

    if (authError) {
      console.error("Auth error during admin user creation:", authError);
      if (authError.message.includes("already registered")) {
        return {
          success: false,
          message: "User creation failed",
          error: "Email is already registered",
        };
      }
      return {
        success: false,
        message: "User creation failed",
        error: authError.message || "An error occurred during user creation",
      };
    }

    if (!authData.user) {
      return {
        success: false,
        message: "User creation failed",
        error: "Failed to create user account",
      };
    }

    // Insert resident record with appropriate role
    const { error: insertError } = await supabase.from("residents").insert([
      {
        id: authData.user.id,
        full_name: data.fullName.trim(),
        email: data.email.toLowerCase(),
        role: data.userType,
        status: "active",
        account_status: "approved", // Admin-created users are automatically approved
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    if (insertError) {
      console.error("Insert error during admin user creation:", insertError);
      return {
        success: false,
        message: "User creation failed",
        error: "Failed to save user information. Please try again.",
      };
    }

    return {
      success: true,
      message: "User account created successfully",
      user: {
        id: authData.user.id,
        name: data.fullName.trim(),
        email: data.email.toLowerCase(),
        role: data.userType,
        password: data.password, // Return password for admin confirmation
      },
    };
  } catch (error) {
    console.error("Unexpected error during user creation:", error);
    return {
      success: false,
      message: "User creation failed",
      error: "An unexpected error occurred. Please try again.",
    };
  }
};

export const loginUser = async (
  data: LoginData
): Promise<LoginResponse> => {
  try {
    // Validate input
    if (!data.email || !data.email.trim()) {
      return {
        success: false,
        message: "Validation failed",
        error: "Email is required",
      };
    }

    if (!data.password) {
      return {
        success: false,
        message: "Validation failed",
        error: "Password is required",
      };
    }

    if (!validateEmail(data.email)) {
      return {
        success: false,
        message: "Validation failed",
        error: "Please enter a valid email address",
      };
    }

    // Sign in with Supabase auth
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: data.email.toLowerCase(),
        password: data.password,
      });

    if (authError) {
      console.error("Auth login error:", authError);
      return {
        success: false,
        message: "Login failed",
        error:
          authError.message === "Invalid login credentials"
            ? "Invalid email or password"
            : authError.message || "An error occurred during login",
      };
    }

    if (!authData.user) {
      return {
        success: false,
        message: "Login failed",
        error: "Failed to get user information",
      };
    }

    // Get resident data
    const { data: resident, error: residentError } = await supabase
      .from("residents")
      .select("id, full_name, email, role, status, account_status, rejection_reason")
      .eq("id", authData.user.id)
      .single();

    if (residentError || !resident) {
      return {
        success: false,
        message: "Login failed",
        error: "User account not found. Please contact support.",
      };
    }

    // Check account status
    if (resident.account_status === "pending_approval") {
      return {
        success: false,
        message: "Login failed",
        error: "Your account is pending approval. You will receive an email once reviewed.",
      };
    }

    if (resident.account_status === "rejected") {
      return {
        success: false,
        message: "Login failed",
        error: `Your registration was rejected${resident.rejection_reason ? `: ${resident.rejection_reason}` : ''}. Contact admin for questions.`,
      };
    }

    // Check if resident is banned
    if (resident.status === "banned") {
      return {
        success: false,
        message: "Login failed",
        error: "Your account has been banned. Please contact support for assistance.",
      };
    }

    return {
      success: true,
      message: "Login successful",
      user: {
        id: resident.id,
        name: resident.full_name || resident.email?.split("@")[0] || "User",
        email: resident.email,
        role: resident.role,
      },
    };
  } catch (error) {
    console.error("Unexpected login error:", error);
    return {
      success: false,
      message: "Login failed",
      error: "An unexpected error occurred. Please try again.",
    };
  }
};
