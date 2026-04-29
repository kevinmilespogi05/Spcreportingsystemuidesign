# SPC Reporting System - Deployment Checklist

## Pre-Deployment ✓

### Frontend (Netlify)
- [ ] `.env.production` file created with all env vars
- [ ] `netlify.toml` configured
- [ ] `npm run build` passes locally
- [ ] `dist/` folder contains build output
- [ ] Code pushed to GitHub main branch
- [ ] All sensitive keys are in Netlify env vars, not in code

### Backend (Render) 
- [ ] Backend repository created and pushed to GitHub
- [ ] `package.json` contains all dependencies
- [ ] `npm start` script defined
- [ ] Environment variables documented
- [ ] `.env.example` file created (without real secrets)

### Database (Supabase)
- [ ] Project created: `dxpwbiniosymofctctrf`
- [ ] `residents` table created
- [ ] `complaints` table created
- [ ] RLS policies configured
- [ ] Backup taken

### Images (Cloudinary)
- [ ] Account created: `dzqtdl5aa`
- [ ] Upload preset created: `cars-g-uploads`
- [ ] Upload restrictions set (if needed)

---

## Deployment Steps

### Step 1: Deploy Frontend to Netlify
- [ ] Log in to Netlify
- [ ] Connect GitHub repository
- [ ] Configure build settings:
  - Build command: `npm run build`
  - Publish directory: `dist`
- [ ] Add environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_CLOUDINARY_CLOUD_NAME`
  - `VITE_CLOUDINARY_UPLOAD_PRESET`
  - `VITE_API_URL` (backend URL)
- [ ] Trigger build and wait for completion
- [ ] Get Netlify URL: `https://[your-site].netlify.app`

### Step 2: Deploy Backend to Render
- [ ] Log in to Render
- [ ] Create new Web Service
- [ ] Connect GitHub backend repository
- [ ] Configure:
  - Build command: `npm install`
  - Start command: `npm start`
- [ ] Add all environment variables (see BACKEND_SETUP.md)
- [ ] Update CORS_ORIGIN with Netlify URL
- [ ] Deploy and wait for completion
- [ ] Get Render URL: `https://spc-reporting-backend.onrender.com`

### Step 3: Update Frontend CORS
- [ ] Update backend CORS to include Netlify URL
- [ ] Redeploy backend

---

## Post-Deployment Testing

### Frontend Tests
- [ ] Load https://[your-site].netlify.app
- [ ] Register new resident account
- [ ] Login with new account
- [ ] View resident dashboard
- [ ] Submit complaint
- [ ] Upload image to complaint
- [ ] Check admin panel loads
- [ ] Test all navigation

### Backend Tests
- [ ] Backend health check: `curl https://spc-reporting-backend.onrender.com/health`
- [ ] Test API endpoints with Postman or curl
- [ ] Check Render logs for errors
- [ ] Verify Supabase connection

### Database Tests
- [ ] Check new records in Supabase
- [ ] Verify RLS policies work
- [ ] Test data retrieval

### Image Upload Tests
- [ ] Upload image in complaint form
- [ ] Check Cloudinary Media Library
- [ ] Verify image displays in app

---

## Monitoring & Maintenance

### Daily
- [ ] Monitor Netlify build status
- [ ] Monitor Render uptime
- [ ] Check for errors in Render logs

### Weekly
- [ ] Review Netlify analytics
- [ ] Review Render metrics (CPU, Memory)
- [ ] Check Supabase usage

### Monthly
- [ ] Backup Supabase database
- [ ] Review security logs
- [ ] Update dependencies: `npm update`

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Frontend build fails | Check console output, verify all dependencies installed |
| API requests fail | Check VITE_API_URL, verify backend CORS settings |
| Database connection fails | Verify SUPABASE_URL and SUPABASE_ANON_KEY in .env |
| Images not uploading | Check Cloudinary credentials, verify upload preset is public |
| CORS errors | Update backend CORS config with Netlify URL |

---

## Success Indicators ✓

- [ ] App loads without errors
- [ ] Can register and login
- [ ] Can submit complaints
- [ ] Can upload images
- [ ] Admin panel accessible
- [ ] No console errors
- [ ] API responds correctly
- [ ] Database records visible

---

## URLs After Deployment

| Service | URL |
|---------|-----|
| Frontend | https://[your-site].netlify.app |
| Backend API | https://spc-reporting-backend.onrender.com |
| Supabase Dashboard | https://app.supabase.com/projects/dxpwbiniosymofctctrf |
| Cloudinary Dashboard | https://cloudinary.com/console |

