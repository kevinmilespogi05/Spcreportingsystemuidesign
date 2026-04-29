# Render Backend Configuration
# This file configures how the backend deploys on Render

services:
  - type: web
    name: spc-reporting-backend
    runtime: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: SUPABASE_URL
        value: https://dxpwbiniosymofctctrf.supabase.co
      - key: SUPABASE_ANON_KEY
        fromDatabase:
          name: spc-reporting
          property: SUPABASE_ANON_KEY
      - key: SUPABASE_SERVICE_KEY
        sync: false
      - key: CLOUDINARY_CLOUD_NAME
        value: dzqtdl5aa
      - key: CLOUDINARY_API_KEY
        sync: false
      - key: CLOUDINARY_API_SECRET
        sync: false
      - key: CORS_ORIGIN
        value: https://[your-netlify-site].netlify.app,http://localhost:3000
      - key: PORT
        value: '3000'
