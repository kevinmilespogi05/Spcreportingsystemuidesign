# Backend Template for SPC Reporting System

This is a template for the Node.js/Express backend that should be deployed on Render.

## Quick Setup

### 1. Create Backend Repository
```bash
git init spc-reporting-backend
cd spc-reporting-backend
```

### 2. Backend Structure
```
spc-reporting-backend/
├── src/
│   ├── server.js           # Express app setup
│   ├── routes/
│   │   ├── auth.js         # Authentication routes
│   │   ├── residents.js    # Resident profile routes
│   │   ├── complaints.js   # Complaint routes
│   │   └── admin.js        # Admin routes
│   ├── middleware/
│   │   ├── auth.js         # Auth middleware
│   │   └── errorHandler.js # Error handling
│   ├── services/
│   │   ├── supabase.js     # Supabase integration
│   │   └── cloudinary.js   # Cloudinary integration
│   └── utils/
│       └── logger.js       # Logging utility
├── .env.example
├── package.json
├── render.yaml
└── README.md
```

### 3. Environment Variables (.env)
```env
# Server
NODE_ENV=production
PORT=3000

# Supabase
SUPABASE_URL=https://dxpwbiniosymofctctrf.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Cloudinary
CLOUDINARY_CLOUD_NAME=dzqtdl5aa
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS
CORS_ORIGIN=https://[your-netlify-site].netlify.app,http://localhost:3000
```

### 4. Deploy to Render
1. Push to GitHub
2. Connect to Render (render.com)
3. Create new Web Service
4. Select GitHub repo
5. Configure environment variables
6. Deploy!

## Required Endpoints

See DEPLOYMENT_GUIDE.md Part 4 for API specifications.

## Local Testing

```bash
npm install
npm start
# Server runs on http://localhost:3000
```

## Monitoring

- Check Render dashboard for logs
- Monitor database queries in Supabase
- Track API usage metrics

