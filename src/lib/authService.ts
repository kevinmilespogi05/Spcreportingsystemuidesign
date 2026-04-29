import { supabase } from "./supabase";

interface RegistrationData {
  fullName: string;
  email: string;
  password: string;
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
      message: "Registration successful! Please sign in with your credentials.",
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
  data: LoginData,
  role: "resident" | "admin"
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

    // Get resident data - try to fetch but don't fail if it doesn't exist
    const { data: resident, error: residentError } = await supabase
      .from("residents")
      .select("id, full_name, email, role, status")
      .eq("id", authData.user.id)
      .single();

    // Check if resident is banned
    if (resident && resident.status === "banned") {
      return {
        success: false,
        message: "Login failed",
        error: "Your account has been banned. Please contact support for assistance.",
      };
    }

    // Verify the user's role matches the selected role
    if (resident && resident.role !== role) {
      return {
        success: false,
        message: "Login failed",
        error: `This account is registered as a ${resident.role}, not a ${role}. Please select the correct role and try again.`,
      };
    }

    // Use resident data if available, otherwise use auth data
    const userData = resident || {
      id: authData.user.id,
      full_name: authData.user.user_metadata?.full_name || "",
      email: authData.user.email || "",
      role: role,
    };

    return {
      success: true,
      message: "Login successful",
      user: {
        id: userData.id,
        name: userData.full_name || userData.email?.split("@")[0] || "User",
        email: userData.email,
        role: userData.role || role,
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
