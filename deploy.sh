#!/bin/bash

# Quick deployment script for CORE app
# Run this from the project root directory

echo "🚀 CORE App Deployment Helper"
echo "==============================="

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "server/oauth-server" ]; then
    echo "❌ Error: Run this script from the CORE project root directory"
    exit 1
fi

echo "📋 Pre-deployment checklist:"
echo "1. ✅ Supabase project created and configured"
echo "2. ✅ Google OAuth credentials obtained"
echo "3. ✅ Canvas LMS credentials obtained (optional)"
echo "4. ✅ Environment variables ready"
echo ""

read -p "Have you completed the checklist above? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please complete the checklist first. See DEPLOYMENT_GUIDE.md for details."
    exit 1
fi

echo "🏗️  Building frontend..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed. Please fix errors and try again."
    exit 1
fi

echo ""
echo "🎯 Next steps:"
echo "1. Deploy OAuth server to Railway/Render/Heroku"
echo "2. Deploy frontend to Vercel: 'vercel'"
echo "3. Set environment variables in both platforms"
echo "4. Test all functionality"
echo ""
echo "📖 See DEPLOYMENT_GUIDE.md for detailed instructions"