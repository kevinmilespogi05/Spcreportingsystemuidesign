# Supabase Registration System - Setup Guide

## Quick Start

Follow these steps to set up the Supabase registration system:

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Wait for the project to be initialized
4. Go to **Settings** → **API**
5. Copy your:
   - **Project URL** (VITE_SUPABASE_URL)
   - **Anon Public Key** (VITE_SUPABASE_ANON_KEY)

### 2. Update Environment Variables

Edit `.env` file and add your credentials:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Create Database Schema

Go to **Supabase Dashboard** → **SQL Editor** and run this SQL:

```sql
-- Create residents table
CREATE TABLE residents (
  id UUID PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone_number VARCHAR(20),
  address TEXT,
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'resident',
  status VARCHAR(20) DEFAULT 'active',
  -- New fields for user verification and approval workflow
  account_status VARCHAR(20) DEFAULT 'pending_approval',
  approval_date TIMESTAMP NULL,
  approved_by UUID NULL REFERENCES residents(id),
  rejection_reason TEXT NULL,
  -- Government ID verification fields
  id_type VARCHAR(50) NULL,
  id_front_url TEXT NULL,
  id_back_url TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX idx_residents_email ON residents(email);

-- Create index on created_at for sorting
CREATE INDEX idx_residents_created_at ON residents(created_at DESC);

-- Enable Row Level Security (Optional but recommended)
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all resident profiles (needed for complaints joining)
CREATE POLICY "Authenticated users can view resident profiles"
  ON residents FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON residents FOR UPDATE
  USING (auth.uid() = id);

-- Allow authenticated users to update (app-level auth enforces admin role check for ban/status changes)
CREATE POLICY "Authenticated users can update resident status"
  ON residents FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to update resident approval fields (app-level auth enforces admin role check)
CREATE POLICY "Authenticated users can update resident approval fields"
  ON residents FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Create complaints table
CREATE TABLE complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id UUID NOT NULL REFERENCES residents(id) ON DELETE CASCADE,
  complaint_code VARCHAR(50) NOT NULL UNIQUE,
  category VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(255),
  image_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'Pending',
  remarks TEXT,
  -- AI-powered analysis fields
  ai_image_status VARCHAR(20) DEFAULT 'pending',
  ai_image_confidence NUMERIC(3,2) DEFAULT 0,
  ai_image_explanation TEXT NULL,
  ai_category_suggestion VARCHAR(100) NULL,
  ai_severity_level VARCHAR(20) NULL,
  ai_urgency_level VARCHAR(20) NULL,
  ai_duplicate_flag BOOLEAN DEFAULT false,
  ai_duplicate_matches JSONB NULL,
  ai_recommended_department VARCHAR(100) NULL,
  ai_priority_level VARCHAR(20) NULL,
  ai_response_timeline TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Create sequence for complaint code generation
CREATE SEQUENCE complaint_code_seq START 1000 INCREMENT 1;

-- Create function to generate complaint code
CREATE OR REPLACE FUNCTION generate_complaint_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.complaint_code := 'SPC-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || LPAD((nextval('complaint_code_seq') % 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate complaint code before insert
CREATE TRIGGER complaint_code_trigger
BEFORE INSERT ON complaints
FOR EACH ROW
EXECUTE FUNCTION generate_complaint_code();

-- Create indexes for performance
CREATE INDEX idx_complaints_resident_id ON complaints(resident_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_category ON complaints(category);
CREATE INDEX idx_complaints_created_at ON complaints(created_at DESC);

-- Enable Row Level Security for complaints
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view complaints (app-level auth handles filtering)
CREATE POLICY "Authenticated users can view complaints"
  ON complaints FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Allow residents to create their own complaints
CREATE POLICY "Residents can create complaints"
  ON complaints FOR INSERT
  WITH CHECK (auth.uid() = resident_id);

-- Allow authenticated users to update (app-level auth enforces admin role check)
CREATE POLICY "Authenticated users can update complaints"
  ON complaints FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Allow authenticated users to delete (app-level auth enforces admin role check)
CREATE POLICY "Authenticated users can delete complaints"
  ON complaints FOR DELETE
  USING (auth.uid() IS NOT NULL);
```

---

## Database Migration: Add User Verification & AI Fields

If you already have the basic schema set up, run this migration to add the new fields for user verification and AI-powered features:

```sql
-- Add user verification and approval fields to residents table
ALTER TABLE residents ADD COLUMN account_status VARCHAR(20) DEFAULT 'pending_approval';
ALTER TABLE residents ADD COLUMN approval_date TIMESTAMP NULL;
ALTER TABLE residents ADD COLUMN approved_by UUID NULL REFERENCES residents(id);
ALTER TABLE residents ADD COLUMN rejection_reason TEXT NULL;
ALTER TABLE residents ADD COLUMN id_type VARCHAR(50) NULL;
ALTER TABLE residents ADD COLUMN id_front_url TEXT NULL;
ALTER TABLE residents ADD COLUMN id_back_url TEXT NULL;

-- Add AI-powered analysis fields to complaints table
ALTER TABLE complaints ADD COLUMN ai_image_status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE complaints ADD COLUMN ai_image_confidence NUMERIC(3,2) DEFAULT 0;
ALTER TABLE complaints ADD COLUMN ai_image_explanation TEXT NULL;
ALTER TABLE complaints ADD COLUMN ai_category_suggestion VARCHAR(100) NULL;
ALTER TABLE complaints ADD COLUMN ai_severity_level VARCHAR(20) NULL;
ALTER TABLE complaints ADD COLUMN ai_urgency_level VARCHAR(20) NULL;
ALTER TABLE complaints ADD COLUMN ai_duplicate_flag BOOLEAN DEFAULT false;
ALTER TABLE complaints ADD COLUMN ai_duplicate_matches JSONB NULL;
ALTER TABLE complaints ADD COLUMN ai_recommended_department VARCHAR(100) NULL;
ALTER TABLE complaints ADD COLUMN ai_priority_level VARCHAR(20) NULL;
ALTER TABLE complaints ADD COLUMN ai_response_timeline TEXT NULL;

-- Update existing residents to have approved status (for backward compatibility)
UPDATE residents SET account_status = 'approved' WHERE status = 'active';

-- Add RLS policy for approval field updates
CREATE POLICY "Authenticated users can update resident approval fields"
  ON residents FOR UPDATE
  USING (auth.uid() IS NOT NULL);
```

**Migration Notes:**
- Existing active residents will be set to `account_status = 'approved'` for backward compatibility
- New registrations will default to `account_status = 'pending_approval'`
- All AI fields default to appropriate values for existing complaints
- Run this migration in your Supabase SQL Editor

---

### 4. Enable Email Authentication in Supabase

1. Go to **Supabase Dashboard** → **Authentication** → **Providers**
2. Enable **Email** provider
3. (Optional) Configure email templates under **Email Templates**

### 5. Test the Registration Flow

1. Start the dev server: `npm run dev`
2. Go to `/` (Login page)
3. Click "Create Account"
4. Fill in:
   - Full Name
   - Email
   - Password (must have 8+ chars, uppercase, lowercase, number)
   - Accept Terms & Privacy
5. Click "Create Account"
6. You should see a success message and be redirected to login
7. Try logging in with your new credentials

---

## Architecture & Key Security Features

### ✅ What This System Does Right:

1. **No Early User Creation**: User is only saved to database AFTER all validations pass
2. **Supabase Auth Integration**: Passwords are hashed securely using Supabase's auth system
3. **Duplicate Email Prevention**: Checked before creation attempt
4. **Strong Password Validation**: Enforces complexity requirements
5. **Terms Agreement Required**: Checkbox must be checked before registration
6. **Error Handling**: Clear error messages for each validation failure
7. **Session Security**: Uses Supabase's built-in session management

### 🔒 Database Security:

- Email is UNIQUE (database constraint prevents duplicates at DB level)
- Row Level Security policies protect user data
- Passwords never stored in residents table (handled by Supabase Auth)
- Timestamps for audit trails
- User ID linked to auth.uid() for integrity

### 📋 Registration Flow:

```
User Input
    ↓
Validate Required Fields
    ↓
Validate Email Format
    ↓
Validate Password Strength
    ↓
Check for Duplicate Email
    ↓
Create Auth User (Supabase Auth)
    ↓
Create Resident Record (if auth succeeds)
    ↓
Success! Redirect to Login
```

---

## Files Added

- `src/lib/supabase.ts` - Supabase client configuration
- `src/lib/authService.ts` - Registration service with validation
- `src/app/components/legal/TermsOfServicePage.tsx` - Terms page
- `src/app/components/legal/PrivacyPolicyPage.tsx` - Privacy policy page
- Updated `src/app/components/auth/AuthPage.tsx` - New registration UI with error handling
- Updated `src/app/routes.tsx` - Added legal pages routes

---

## Error Handling

The system handles these errors gracefully:

| Error | Message | User Action |
|-------|---------|------------|
| Name missing | "Full name is required" | Enter name |
| Email missing | "Email is required" | Enter email |
| Invalid email | "Please enter a valid email address" | Use valid email |
| Password too short | "Password must be at least 8 characters long" | Enter longer password |
| No uppercase | "Password must contain at least one uppercase letter" | Add uppercase letter |
| No lowercase | "Password must contain at least one lowercase letter" | Add lowercase letter |
| No number | "Password must contain at least one number" | Add number |
| Email exists | "Email already exists. Please use a different email or try signing in." | Use different email or login |
| Terms not accepted | "You must agree to the Terms of Service and Privacy Policy" | Check terms box |

---

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Check that `.env` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart dev server after updating `.env`

### Error: "Email already exists"
- This is expected! Try a different email
- Or if it's a new email, check your Supabase database for duplicate entries

### Error: "Failed to create user account"
- Check Supabase project status
- Verify Email auth provider is enabled
- Check browser console for detailed error

### Registration works but user not appearing in database
- Check Supabase **Database** → **residents** table
- Make sure Row Level Security policies allow viewing own records
- Try refreshing the page

---

## Next Steps (Optional Enhancements)

1. **Email Verification**: Send verification email after signup
2. **Password Reset**: Implement forgot password flow
3. **Profile Completion**: Ask for phone/address after initial signup
4. **Admin Invitations**: Separate flow for creating admin accounts
5. **Social Auth**: Add Google/GitHub login options
6. **2FA**: Two-factor authentication for security

---

## Cloudinary Image Upload Setup

The complaint system supports image uploads using Cloudinary for secure, scalable image storage.

### 1. Create a Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com) and sign up (free tier available)
2. Go to your **Dashboard**
3. Copy your:
   - **Cloud Name** (under Account settings)
   - Create an **Upload Preset** (Settings → Upload → Upload presets → Add upload preset)
     - Choose "Unsigned" for client-side uploads
     - Note the preset name

### 2. Add Cloudinary Environment Variables

Edit `.env` file and add your Cloudinary credentials:

```
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### 3. Image Upload Features

The complaint system now includes:

- **Preview Before Upload**: Users see a preview of the image before submitting
- **Secure Upload**: Images are validated (max 5MB, PNG/JPG/GIF/WebP/PDF)
- **Optimized Storage**: Cloudinary automatically optimizes images for web
- **Fallback Handling**: Components gracefully handle complaints without images
- **Display in All Views**:
  - ResidentComplaintsPage: Thumbnail in list, full image in expanded view
  - AdminDashboard: Full image in complaint detail panel
  - ComplaintDetailPanel: Full image display for admin review

### 4. Testing Images

Upload support is fully integrated. To test:

1. Log in as a resident
2. Click "New Complaint"
3. Complete the form steps
4. On the "Attachments" step, upload an image file
5. Preview displays before upload
6. Click "Upload Image" to store in Cloudinary
7. Complete submission
8. View the complaint in the list - image thumbnail will appear
9. Admin can view full image in the detail panel

### 5. Image URLs Storage

- Images are uploaded to Cloudinary by the browser
- Cloudinary returns a secure URL (`secure_url`)
- URL is stored in the `image_url` field in the complaints table
- URLs persist across the system lifetime
- Images are publicly accessible via the secure URL

---
## Admin Complaint Management

### Delete Functionality

Admins can permanently delete complaints from the system. This feature is available in the Complaint Detail Panel.

#### How to Delete a Complaint

1. Log in as an admin
2. Go to **Complaints** section
3. Click on any complaint to open the Detail Panel
4. Scroll to the footer
5. Click **"Delete Complaint"** button
6. Confirm the deletion in the popup
7. The complaint is permanently removed from the database

#### Security

- Only admins can delete complaints (enforced at the app level)
- Delete operation requires authentication
- RLS policy ensures only authenticated users can delete (`auth.uid() IS NOT NULL`)
- Role verification happens in the service layer (`complaintService.ts`)
- Deletion is permanent - no recovery possible

#### API

The delete functionality is implemented via:
- `deleteComplaint(complaintId)` - Service function in `complaintService.ts`
- `DELETE` query on `complaints` table
- Role check on `residents` table to verify admin status

---
## Admin Resident Management

### Ban Residents

Admins can ban residents from the system, preventing them from submitting or viewing complaints.

#### How to Ban a Resident

1. Log in as an admin
2. Go to **Residents** section
3. Find the resident in the table
4. Click the **Ban icon** (🚫) in the Actions column
5. Confirm the ban in the popup dialog
6. The resident's status changes to "Banned" (shown with red badge)
7. Banned residents can no longer access the complaint system

#### Resident Status Display

The Residents page shows each resident's status:
- **Active** (green badge) - Normal, active resident
- **Banned** (red badge) - Resident is banned and cannot submit complaints

#### View Complaint History

Click the **Eye icon** in the Actions column or expand a resident row to see their complaint history. You can:
- View all complaints submitted by the resident
- Click any complaint to open full details modal
- See complaint code, category, status, submitted date, location, description, remarks, and attachments

#### Modal Details

- **Complaint Code**: Unique identifier for the complaint
- **Category**: Type of complaint (e.g., "Maintenance", "Safety")
- **Status**: Current status (Pending, In Progress, Resolved, Rejected)
- **Submitted Date**: When the complaint was created
- **Location**: Physical location of the issue
- **Description**: Full complaint details
- **Admin Remarks**: Any notes added by admins
- **Attachment**: Image file if uploaded by resident

#### Security

- Only admins can ban residents (enforced at the app level)
- Ban operation requires authentication
- RLS policy ensures only authenticated users can update resident status (`auth.uid() IS NOT NULL`)
- Role verification happens in the service layer (`complaintService.ts`)
- Banned residents are still in the database but cannot access the system

#### API

The ban functionality is implemented via:
- `banResident(residentId)` - Service function in `complaintService.ts`
- `UPDATE` query on `residents` table to set `status = 'banned'`
- Role check on `residents` table to verify admin status
- Prevents self-banning (admins cannot ban themselves)
- Prevents re-banning (already banned residents show no ban button)

### Unban Residents

Admins can unban residents to restore their access to the system.

#### How to Unban a Resident

1. Log in as an admin
2. Go to **Banned Residents** section in the sidebar
3. Find the resident in the list (searchable by name or email)
4. Click the **Unlock icon** (🔓) in the Actions column
5. Confirm the unban in the popup dialog
6. The resident's status changes to "Active" and they can login again

#### Banned Residents Management Page

The Banned Residents page displays:
- List of all banned residents in the system
- Resident name and email
- Date when they were banned
- Search functionality to find specific residents
- Unban button for each banned resident
- Total count of banned residents

#### Features

- **Search**: Filter banned residents by name or email
- **Unban**: Restore access for banned residents
- **Confirmation Dialog**: Requires confirmation before unbanning
- **Real-time Updates**: List updates after successful unban
- **Toast Notifications**: Clear feedback on ban/unban actions

#### Security

- Only admins can unban residents (enforced at the app level)
- Unban operation requires authentication
- RLS policy ensures only authenticated users can update resident status
- Role verification happens in the service layer (`complaintService.ts`)
- Prevents unbanning non-banned residents
- Cannot unban yourself if system behavior changes

#### API

The unban functionality is implemented via:
- `unbanResident(residentId)` - Service function in `complaintService.ts`
- `UPDATE` query on `residents` table to set `status = 'active'`
- Role check on `residents` table to verify admin status
- Validates that resident is actually banned before unbanning
- Returns clear error messages for validation failures

### Login Security: Banned User Blocking

**BUG FIX**: The system now properly checks if a user is banned during login and prevents access.

#### How It Works

1. User enters email and password
2. System verifies credentials with Supabase Auth
3. **NEW**: System checks `residents.status` field
4. If status = 'banned', login is rejected with error message
5. If status = 'active', login proceeds normally

#### User Experience

- **For Active Residents**: Login works normally, redirected to dashboard
- **For Banned Residents**: Login shows error message: "Your account has been banned. Please contact support for assistance."
- **No Session Created**: Banned users cannot create auth sessions even if they have valid credentials

#### Implementation

The ban check happens in the `loginUser()` function in `authService.ts`:

```typescript
// Check if resident is banned
if (resident && resident.status === "banned") {
  return {
    success: false,
    message: "Login failed",
    error: "Your account has been banned. Please contact support for assistance.",
  };
}
```

#### Security Benefits

- Banning is immediately effective (no delay or cache issues)
- Banned users cannot create new sessions
- Prevents banned users from accessing their dashboard
- All complaints from banned users remain in the system for auditing
- Ban status is checked on every login attempt

### Login Security: Role-Based Access Control

**FEATURE**: The system validates that a user's account role matches the selected login role.

#### How It Works

1. User selects **Resident** or **Admin** role on login page
2. User enters email and password
3. System verifies credentials with Supabase Auth
4. **NEW**: System checks user's role in `residents.role` field
5. If user's role matches selected role → Login allowed
6. If user's role doesn't match selected role → Login rejected with error

#### Login Page Role Selection

The login page displays two prominent buttons:
- **Resident** (👥 icon) - For regular residents filing complaints
- **Admin** (🛡️ icon) - For administrators managing the system

Users must:
1. Click on their role button (button highlights when selected)
2. Enter email and password
3. System validates the selected role matches their database role

#### User Experience

**Scenario 1: Resident trying to login as Resident (ALLOWED)**
```
Selected Role: Resident
User Database Role: resident
Result: ✅ Login successful → Redirected to /resident dashboard
```

**Scenario 2: Admin trying to login as Admin (ALLOWED)**
```
Selected Role: Admin
User Database Role: admin
Result: ✅ Login successful → Redirected to /admin dashboard
```

**Scenario 3: Resident trying to login as Admin (BLOCKED)**
```
Selected Role: Admin
User Database Role: resident
Result: ❌ Error: "This account is registered as a resident, not an admin. Please select the correct role and try again."
```

**Scenario 4: Admin trying to login as Resident (BLOCKED)**
```
Selected Role: Resident
User Database Role: admin
Result: ❌ Error: "This account is registered as an admin, not a resident. Please select the correct role and try again."
```

#### Implementation

The role validation happens in the `loginUser()` function in `authService.ts`:

```typescript
// Verify the user's role matches the selected role
if (resident && resident.role !== role) {
  return {
    success: false,
    message: "Login failed",
    error: `This account is registered as a ${resident.role}, not a ${role}. Please select the correct role and try again.`,
  };
}
```

#### Security Benefits

- Prevents admins from accidentally accessing resident features
- Prevents residents from accidentally accessing admin features
- Provides clear feedback about account type
- Enforces role separation at authentication layer
- Prevents role-based bypasses or confusion
- Each role gets correct dashboard and feature set

#### Error Handling

Clear error messages guide users:
- If wrong role selected: Error explains their account type and suggests correct role
- If banned: Directed to contact support
- If invalid credentials: Standard "invalid email or password" message
- All errors include actionable guidance

---
## Support

For issues with:
- **Supabase**: Check [Supabase Docs](https://supabase.com/docs)
- **Authentication**: Review [Supabase Auth](https://supabase.com/docs/guides/auth)
- **Database**: See [Supabase PostgreSQL](https://supabase.com/docs/guides/database)
- **Cloudinary**: Visit [Cloudinary Docs](https://cloudinary.com/documentation)
- **Image Upload**: Check [Cloudinary Upload API](https://cloudinary.com/documentation/image_upload_api)

