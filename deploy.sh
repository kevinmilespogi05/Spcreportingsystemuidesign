#!/bin/bash

# SPC Reporting System - Quick Deployment Script
# This script prepares your frontend for deployment

echo "🚀 SPC Reporting System - Deployment Preparation"
echo "=================================================="

# Step 1: Install dependencies
echo "📦 Installing dependencies..."
npm install

# Step 2: Build for production
echo "🔨 Building for production..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Check errors above."
    exit 1
fi

# Step 3: Preview build
echo "✅ Build successful!"
echo ""
echo "📋 Next Steps:"
echo "1. Make sure .env.production is configured"
echo "2. Commit your code:"
echo "   git add ."
echo "   git commit -m 'Prepare for production deployment'"
echo "   git push origin main"
echo "3. Go to Netlify Dashboard"
echo "4. Connect your GitHub repository"
echo "5. Set build settings:"
echo "   - Build command: npm run build"
echo "   - Publish directory: dist"
echo "6. Add environment variables in Netlify settings"
echo "7. Deploy!"
echo ""
echo "📚 For detailed instructions, see DEPLOYMENT_GUIDE.md"
echo ""
echo "Local preview (optional):"
echo "  npm run preview"
echo ""
