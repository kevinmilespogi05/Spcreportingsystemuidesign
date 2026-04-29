# 🚀 Quick Start: Deploy SPC Reporting System (10 Minutes)

## What You're Deploying
- ✅ **Frontend**: React app → Netlify
- ✅ **Backend**: Node.js API → Render
- ✅ **Database**: PostgreSQL → Supabase (already configured)
- ✅ **Images**: Cloudinary (already configured)

---

## STEP 1: Prepare Frontend (3 minutes)

### 1.1 Install Dependencies
```bash
npm install
```

### 1.2 Test Build Locally
```bash
npm run build
npm run preview
# Should see the app running locally
```

If build fails, check for TypeScript or dependency errors.

### 1.3 Verify .env.production
Already created with correct values:
```env
VITE_SUPABASE_URL=https://dxpwbiniosymofctctrf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_CLOUDINARY_CLOUD_NAME=dzqtdl5aa
VITE_CLOUDINARY_UPLOAD_PRESET=cars-g-uploads
VITE_API_URL=https://spc-reporting-backend.onrender.com
```

### 1.4 Commit & Push to GitHub
```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

---

## STEP 2: Deploy Frontend to Netlify (2 minutes)

### 2.1 Connect to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Click **"Add new site"** → **"Import existing project"**
3. Choose **GitHub**
4. Authorize Netlify with GitHub
5. Select your repository: `spc-reporting-frontend`
6. Click **"Deploy"**

### 2.2 Configure in Netlify
1. Go to **Site settings** → **Build & deploy**
2. Verify:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Click **"Deploy"**

### 2.3 Add Environment Variables
1. Go to **Site settings** → **Build environment**
2. Add these variables (without quotes):
```
VITE_SUPABASE_URL = https://dxpwbiniosymofctctrf.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_CLOUDINARY_CLOUD_NAME = dzqtdl5aa
VITE_CLOUDINARY_UPLOAD_PRESET = cars-g-uploads
VITE_API_URL = https://spc-reporting-backend.onrender.com
```
3. Trigger redeploy: **Deploys** → **Trigger deploy**

### 2.4 Get Your Frontend URL
Once deployed (watch the Netlify build logs), you'll get:
```
https://[your-site-name].netlify.app
```

---

## STEP 3: Deploy Backend to Render (3 minutes)

### Note: You Need a Backend Repository First!

If you don't have one, contact the backend team or see `BACKEND_SETUP.md`

### 3.1 Push Backend to GitHub
Ensure your backend repo is ready:
```
- package.json with "start" script
- server.js or index.js entry point
- All dependencies listed
```

### 3.2 Deploy to Render
1. Go to [render.com](https://render.com)
2. Click **"New"** → **"Web Service"**
3. Connect GitHub repository (backend repo)
4. Configure:
   - **Name**: `spc-reporting-backend`
   - **Runtime**: `Node`
   - **Build command**: `npm install`
   - **Start command**: `npm start`

### 3.3 Add Environment Variables in Render
1. Scroll to **Environment**
2. Add these variables:
```
SUPABASE_URL = https://dxpwbiniosymofctctrf.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY = [get from Supabase settings]
CLOUDINARY_CLOUD_NAME = dzqtdl5aa
CLOUDINARY_API_KEY = [get from Cloudinary settings]
CLOUDINARY_API_SECRET = [get from Cloudinary settings]
CORS_ORIGIN = https://[your-netlify-site].netlify.app
NODE_ENV = production
PORT = 3000
```

### 3.4 Deploy
Click **"Create Web Service"** and wait for deployment.

Once done, you'll have:
```
https://spc-reporting-backend.onrender.com
```

---

## STEP 4: Test Everything (2 minutes)

### 4.1 Test Frontend
- Open https://[your-site].netlify.app
- Try to register
- Try to login
- Submit a complaint
- Upload an image

### 4.2 Test Backend
```bash
# In terminal
curl https://spc-reporting-backend.onrender.com/health
# Should return: {"status": "ok"}
```

### 4.3 Test Database
1. Go to Supabase Dashboard
2. Check **Table Editor**
3. Should see new records from your test

### 4.4 Test Images
1. Check Cloudinary Media Library
2. Should see uploaded images

---

## 🎉 Success!

If everything works:
- ✅ Frontend loads
- ✅ Can register/login
- ✅ Can submit complaints
- ✅ Images upload
- ✅ Admin panel works

You're live! 🚀

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Netlify build fails | Check console logs in Netlify |
| API requests fail | Check VITE_API_URL in Netlify env vars |
| Images not uploading | Check Cloudinary credentials |
| CORS error | Update backend CORS_ORIGIN with Netlify URL |
| Database connection fails | Check Supabase credentials |

---

## Documentation
- Full guide: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- Checklist: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
- Backend setup: [BACKEND_SETUP.md](BACKEND_SETUP.md)

---

## Important Notes

⚠️ **Free Tier Considerations**
- Netlify: Free tier includes 300 build minutes/month
- Render: Free tier may spin down after 15 minutes of inactivity
- Supabase: Free tier has limits on database size
- Cloudinary: Free tier has limited storage

For production, consider upgrading to paid plans.

---

## Next Steps

1. ✅ Follow steps above
2. ✅ Test all features
3. ✅ Monitor logs
4. ✅ Set up backups for database
5. ✅ Monitor Cloudinary usage

Deployment complete! 🎊

