# SPC Reporting System - Deployment Guide

Complete guide for deploying the system across Render (backend), Netlify (frontend), Supabase (database), and Cloudinary (images).

---

## 📋 Pre-Deployment Checklist

### Required Accounts
- [ ] Render account (render.com)
- [ ] Netlify account (netlify.com)
- [ ] Supabase account (already created - dxpwbiniosymofctctrf.supabase.co)
- [ ] Cloudinary account (already created - dzqtdl5aa)
- [ ] GitHub account with repositories

### GitHub Setup
```bash
# Both frontend and backend should be in separate GitHub repos
# Frontend: https://github.com/your-username/spc-reporting-frontend
# Backend: https://github.com/your-username/spc-reporting-backend
```

---

## 🗄️ PART 1: SUPABASE DATABASE (Already Configured)

### Verify Setup
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select project: **dxpwbiniosymofctctrf**
3. Verify tables exist:
   - `residents` - User profiles
   - `complaints` - Complaint records
4. Check Row Level Security policies are enabled

### Database Backup
```bash
# Export your database schema and data before deploying
# In Supabase Dashboard: Database → Backups → Manual Backup
```

---

## 🖼️ PART 2: CLOUDINARY IMAGE STORAGE (Already Configured)

### Verify Setup
1. Go to [Cloudinary Dashboard](https://cloudinary.com/console)
2. Cloud Name: `dzqtdl5aa`
3. Verify upload preset: `cars-g-uploads`
4. Upload Preset Settings:
   - **Format**: Auto-convert to optimized format
   - **Transformations**: Auto image optimization
   - **Folder**: `/spc-reporting` (recommended)

### Frontend Configuration
Already set in `.env`:
```
VITE_CLOUDINARY_CLOUD_NAME=dzqtdl5aa
VITE_CLOUDINARY_UPLOAD_PRESET=cars-g-uploads
```

---

## 🚀 PART 3: FRONTEND DEPLOYMENT (Netlify)

### Step 1: Prepare Frontend for Production

#### 3.1 Update Environment Variables
Create `.env.production`:
```env
VITE_SUPABASE_URL=https://dxpwbiniosymofctctrf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4cHdiaW5pb3N5bW9mY3RjdHJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5NDk5NDIsImV4cCI6MjA5MTUyNTk0Mn0.D9sQqWV6RWr_55xGMoKmRiECniniZ8y69yIUywY1m2Y
VITE_CLOUDINARY_CLOUD_NAME=dzqtdl5aa
VITE_CLOUDINARY_UPLOAD_PRESET=cars-g-uploads
VITE_API_URL=https://spc-reporting-backend.onrender.com
VITE_GEMINI_API_KEY=your-gemini-api-key
```

#### 3.2 Build Test Locally
```bash
npm run build
npm run preview
```

#### 3.3 Push to GitHub
```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### Step 2: Deploy to Netlify

#### 3.4 Connect GitHub Repository
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Select **GitHub**
4. Authorize and select: `spc-reporting-frontend`
5. Click **"Deploy site"**

#### 3.5 Configure Build Settings
1. Go to **Site settings** → **Build & deploy**
2. Set Build command: `npm run build`
3. Set Publish directory: `dist`
4. Click **"Save"**

#### 3.6 Add Environment Variables
1. Go to **Site settings** → **Build environment**
2. Add these variables:
```
VITE_SUPABASE_URL = https://dxpwbiniosymofctctrf.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4cHdiaW5pb3N5bW9mY3RjdHJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5NDk5NDIsImV4cCI6MjA5MTUyNTk0Mn0.D9sQqWV6RWr_55xGMoKmRiECniniZ8y69yIUywY1m2Y
VITE_CLOUDINARY_CLOUD_NAME = dzqtdl5aa
VITE_CLOUDINARY_UPLOAD_PRESET = cars-g-uploads
VITE_API_URL = https://spc-reporting-backend.onrender.com
VITE_GEMINI_API_KEY = your-gemini-api-key
NETLIFY_GEMINI_API_KEY = your-gemini-api-key
```
3. Click **"Save"**

#### 3.7 Trigger Deploy
1. Go to **Deploys**
2. Click **"Trigger deploy"**
3. Wait for build to complete ✅
4. Your site will be available at: `https://[your-site-name].netlify.app`

#### 3.8 Configure Domain (Optional)
1. Go to **Site settings** → **Domain management**
2. Click **"Add domain"**
3. Add custom domain if you have one

### Step 3: Verify Frontend Deployment
- [ ] Site loads without errors
- [ ] Can login/register
- [ ] Supabase connection works
- [ ] Images upload to Cloudinary
- [ ] All pages accessible

---

## 🔧 PART 4: BACKEND DEPLOYMENT (Render)

### Note: You need to have your backend repository ready

If you need a backend server, create a Node.js/Express API with these endpoints:

#### 4.1 Required Backend Endpoints
```
POST   /api/auth/register        - User registration
POST   /api/auth/login           - User login
GET    /api/residents/:id        - Get resident profile
PUT    /api/residents/:id        - Update resident profile
GET    /api/complaints           - List complaints
POST   /api/complaints           - Create complaint
PUT    /api/complaints/:id       - Update complaint status
DELETE /api/complaints/:id       - Delete complaint
GET    /api/admin/analytics      - Admin analytics
POST   /api/admin/users          - Create admin user
```

#### 4.2 Backend Environment Variables
```env
SUPABASE_URL=https://dxpwbiniosymofctctrf.supabase.co
SUPABASE_KEY=your-service-key
CLOUDINARY_CLOUD_NAME=dzqtdl5aa
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
PORT=3000
NODE_ENV=production
```

#### 4.3 Deploy to Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New"** → **"Web Service"**
3. Connect GitHub repository: `spc-reporting-backend`
4. Configure:
   - **Name**: `spc-reporting-backend`
   - **Runtime**: `Node`
   - **Build command**: `npm install`
   - **Start command**: `npm start`
5. Add environment variables from 4.2
6. Click **"Create Web Service"**
7. Wait for deployment to complete

#### 4.4 Get Backend URL
Once deployed, your backend will be at: `https://spc-reporting-backend.onrender.com`

### Step 4: Verify Backend Deployment
- [ ] Backend runs without errors
- [ ] `/health` endpoint responds
- [ ] Can connect to Supabase
- [ ] CORS allows Netlify frontend

---

## 🔐 PART 5: SECURITY & CORS CONFIGURATION

### Backend CORS Setup
```javascript
// In your Express backend
const cors = require('cors');

app.use(cors({
  origin: [
    'https://[your-netlify-site].netlify.app',
    'http://localhost:3000'
  ],
  credentials: true
}));
```

### Supabase RLS Policies
Verify RLS is enabled and policies allow:
- Public: Read residents (for complaints reference)
- Authenticated: Read own profile, update own profile
- Admin: Full CRUD on all tables

### Cloudinary API Security
- Keep API secret safe (use backend only, not frontend)
- Use unsigned uploads with upload preset for frontend
- Restrict upload folder: `/spc-reporting`

---

## 🧪 PART 6: POST-DEPLOYMENT TESTING

### Test Frontend (Netlify)
```bash
# Test in production URL
1. Visit https://[your-site].netlify.app
2. Register new account
3. Upload complaint image
4. Check admin dashboard
5. Verify all features work
```

### Test Backend (Render)
```bash
# Test API endpoints
curl https://spc-reporting-backend.onrender.com/health

# Test complaint creation
curl -X POST https://spc-reporting-backend.onrender.com/api/complaints \
  -H "Content-Type: application/json" \
  -d '{"category":"Maintenance","description":"Test"}'
```

### Test Database (Supabase)
1. Go to Supabase Dashboard
2. Check: **Table Editor** → Verify new records from app
3. Check: **Realtime** → Monitor live updates

### Test Image Upload (Cloudinary)
1. Upload image in app
2. Go to Cloudinary Dashboard
3. Verify image in Media Library
4. Check transformations applied

---

## 📊 PART 7: MONITORING & LOGS

### Monitor Frontend (Netlify)
- **Netlify Dashboard** → **Analytics**
- **Netlify Dashboard** → **Logs** → View build/function logs

### Monitor Backend (Render)
- **Render Dashboard** → **Logs** → View real-time logs
- **Render Dashboard** → **Metrics** → CPU, Memory, Requests

### Monitor Database (Supabase)
- **Supabase Dashboard** → **Database** → View schema
- **Supabase Dashboard** → **Logs** → SQL logs

### Monitor Images (Cloudinary)
- **Cloudinary Dashboard** → **Media Library** → View uploads
- **Cloudinary Dashboard** → **Analytics** → Usage stats

---

## 🔄 PART 8: CI/CD SETUP (Automated Deploys)

### Netlify Automatic Deploys
Already enabled! Pushes to `main` branch trigger automatic builds.

### Render Automatic Deploys (Backend)
1. **Render Dashboard** → **Service Settings**
2. Enable: **Auto-Deploy**
3. Select branch: `main`
4. Now every push to main triggers deployment

---

## 🆘 TROUBLESHOOTING

### Frontend Not Loading
```
Check: Netlify build logs
- Are env vars set correctly?
- Does npm run build pass locally?
- Check console errors in browser DevTools
```

### API Requests Failing
```
Check: CORS configuration
- Is VITE_API_URL pointing to correct backend?
- Is backend CORS allowing Netlify origin?
- Check Render logs for errors
```

### Database Connection Failing
```
Check: Environment variables
- Is SUPABASE_URL correct?
- Is SUPABASE_KEY correct?
- RLS policies enabled?
- Check Supabase logs
```

### Images Not Uploading
```
Check: Cloudinary configuration
- Is VITE_CLOUDINARY_CLOUD_NAME correct?
- Is upload preset public (unsigned)?
- Check Cloudinary logs
```

---

## 📝 Post-Deployment Checklist

### Before Going Live
- [ ] Frontend deployed on Netlify
- [ ] Backend deployed on Render
- [ ] Supabase database configured
- [ ] Cloudinary uploads working
- [ ] CORS properly configured
- [ ] Environment variables set everywhere
- [ ] SSL/HTTPS verified
- [ ] Performance tested
- [ ] Security reviewed

### After Going Live
- [ ] Monitor Netlify analytics
- [ ] Monitor Render logs
- [ ] Monitor Supabase usage
- [ ] Set up error tracking (Sentry/LogRocket)
- [ ] Backup database regularly
- [ ] Monitor Cloudinary usage

---

## 🎯 Quick Reference URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | https://[your-site].netlify.app | User-facing app |
| Backend API | https://spc-reporting-backend.onrender.com | API endpoints |
| Supabase | https://app.supabase.com | Database management |
| Cloudinary | https://cloudinary.com/console | Image management |

---

## 📞 Support

- **Netlify Support**: https://support.netlify.com
- **Render Support**: https://render.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Cloudinary Docs**: https://cloudinary.com/documentation

