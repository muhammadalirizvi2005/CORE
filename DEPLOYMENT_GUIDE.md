# CORE App Deployment Guide

## Project Overview
This is a **Student Productivity App** built with:
- **Frontend**: Vite + React + TypeScript + Tailwind CSS
- **Backend**: Supabase (database, authentication)
- **OAuth Server**: Node.js/Express (for Google Calendar & Canvas LMS integration)

## Deployment Strategy: Single Platform

### Option A: Recommended Approach ⭐
Deploy everything on Vercel using Serverless Functions:
- **Frontend** → Vercel static hosting
- **OAuth Server** → Vercel Serverless Functions
- **Single platform, single domain, simpler setup**

### Option B: Alternative Approach
Deploy as two separate services:
1. **Frontend** → Vercel (static hosting)  
2. **OAuth Server** → Railway/Render (Node.js hosting)

---

## 🚀 OPTION A: All-in-One Vercel Deployment (Recommended)

### Why Choose This Option:
- ✅ **Single platform** - One dashboard, one domain
- ✅ **Simpler OAuth setup** - No cross-domain issues
- ✅ **Free hosting** - No need for multiple accounts
- ✅ **Auto-deploys** - Push to GitHub = instant deployment
- ✅ **Perfect for students** - Less complexity, easier debugging

### Step 1: Deploy to Vercel

#### 1.1 Install Vercel CLI:
```bash
npm install -g vercel
```

#### 1.2 From your project root, run:
```bash
vercel
```
Follow the prompts to connect your GitHub repo and deploy.

#### 1.3 Set environment variables in Vercel dashboard:
Go to your project settings in Vercel and add:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CANVAS_CLIENT_ID=your_canvas_client_id (optional)
CANVAS_CLIENT_SECRET=your_canvas_client_secret (optional)
APP_URL=https://your-app.vercel.app
```

### Step 2: Update Frontend Code
The OAuth serverless function is already created at `/api/oauth/callback.js`. 

You just need to update your Settings component to use the same domain:

In `src/components/Settings.tsx`, find these lines:
```typescript
const oauthServer = import.meta.env.VITE_OAUTH_SERVER;
```

Replace with:
```typescript
const oauthServer = window.location.origin; // Uses same domain
```

### Step 3: Set OAuth Redirect URIs
In your Google Cloud Console and Canvas settings, set:
- Google: `https://your-app.vercel.app/api/oauth/callback`
- Canvas: `https://your-app.vercel.app/api/oauth/callback`

### Step 4: Deploy Again
```bash
vercel --prod
```

**That's it!** Your entire app is now running on Vercel.

---

## 🚀 OPTION B: Two-Service Deployment (Alternative)

## 🔧 OPTION B: Two-Service Deployment (Alternative)

If you prefer separating services (more complex but educational):

### Step 1: Deploy OAuth Server First

#### 1.1 Choose a Node.js hosting platform:
- **Railway** (recommended - free tier, easy setup)
- **Render** (free tier available)
- **Heroku** (paid but reliable)

#### 1.2 Prepare OAuth Server for deployment:

Create `server/oauth-server/package.json`:
```json
{
  "name": "core-oauth-server",
  "version": "1.0.0",
  "description": "OAuth server for CORE app",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "node index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "node-fetch": "^2.6.7",
    "body-parser": "^1.20.2"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

#### 1.3 Deploy to Railway (Example):
1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repo
3. Select the `server/oauth-server` folder as the root
4. Set these environment variables in Railway:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   CANVAS_CLIENT_ID=your_canvas_client_id (optional)
   CANVAS_CLIENT_SECRET=your_canvas_client_secret (optional)
   APP_URL=https://your-frontend-url.vercel.app
   SERVER_BASE=https://your-oauth-server.railway.app
   PORT=3000
   ```
5. Deploy

**Note the OAuth server URL** (e.g., `https://your-oauth-server.railway.app`) - you'll need this for the frontend.

### Step 2: Deploy Frontend to Vercel

#### 2.1 Install Vercel CLI:
```bash
npm install -g vercel
```

#### 2.2 From your project root, run:
```bash
vercel
```

#### 2.3 Set environment variables in Vercel dashboard:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OAUTH_SERVER=https://your-oauth-server.railway.app
```

#### 2.4 Update OAuth server's APP_URL:
Go back to Railway and update:
```
APP_URL=https://your-frontend.vercel.app
```

---

## 🚀 OPTION B: All-in-One Vercel Deployment

If you prefer everything on Vercel, use the serverless function I created.

### Step 1: Set up environment variables in Vercel:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CANVAS_CLIENT_ID=your_canvas_client_id (optional)
CANVAS_CLIENT_SECRET=your_canvas_client_secret (optional)
APP_URL=https://your-app.vercel.app
```

### Step 2: Update your code to use the Vercel API:
In your Settings component, replace:
```typescript
const oauthServer = import.meta.env.VITE_OAUTH_SERVER;
```
with:
```typescript
const oauthServer = window.location.origin; // Uses same domain
```

### Step 3: Deploy:
```bash
vercel
```

---

## 📋 Pre-Deployment Checklist

### Required OAuth Credentials:

#### Google OAuth Setup:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `https://your-oauth-server.railway.app/oauth/google/callback` (Option A)
   - `https://your-app.vercel.app/api/oauth/callback` (Option B)

#### Canvas LMS Setup (Optional):
1. Contact your school's Canvas admin
2. Request OAuth developer key
3. Provide redirect URI based on your deployment option

### Supabase Setup:
1. Ensure all migrations are applied
2. Verify Row Level Security (RLS) policies
3. Get your project URL and keys from Supabase dashboard

---

## 🔧 Environment Variables Summary

### For Frontend (.env):
```
VITE_SUPABASE_URL=https://abcdefgh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_OAUTH_SERVER=https://your-oauth-server.railway.app  # Option A only
```

### For OAuth Server (.env):
```
SUPABASE_URL=https://abcdefgh.supabase.co
SUPABASE_SERVICE_ROLE_KEY=service_role_key_here
GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_secret
CANVAS_CLIENT_ID=canvas_key_here
CANVAS_CLIENT_SECRET=canvas_secret_here
APP_URL=https://your-frontend.vercel.app
SERVER_BASE=https://your-oauth-server.railway.app
PORT=3000
```

---

## 🚨 Security Notes

1. **Never commit secrets** - Use platform environment variables
2. **Service Role Key** is highly privileged - keep it secure
3. **CORS**: OAuth server allows all origins (`*`) - restrict in production
4. **HTTPS**: Both services must use HTTPS for OAuth to work
5. **Domain verification**: Update OAuth redirect URIs when deploying

---

## 🧪 Testing Deployment

1. **Frontend loads**: Check if the app loads without console errors
2. **Database connection**: Try logging in/registering
3. **OAuth flows**: Test Google Calendar and Canvas connections
4. **All features**: Test tasks, wellness tracker, study groups, etc.

---

## 🆘 Troubleshooting

### Common Issues:

**OAuth redirect mismatch:**
- Verify redirect URIs in Google/Canvas match your deployed URLs
- Check `APP_URL` and `SERVER_BASE` environment variables

**CORS errors:**
- Ensure OAuth server allows your frontend domain
- Check browser network tab for specific error details

**Database connection fails:**
- Verify Supabase URL and keys
- Check if RLS policies allow your operations

**Build failures:**
- Ensure all dependencies are in `package.json`
- Check for TypeScript errors: `npm run build`

---

## 📞 Quick Deploy Commands

### Railway (OAuth Server):
```bash
cd server/oauth-server
# Create package.json (see above)
# Push to GitHub
# Connect Railway to your repo
# Set environment variables
# Deploy
```

### Vercel (Frontend):
```bash
# From project root
vercel
# Follow prompts
# Set environment variables in dashboard
```

---

## 🎯 Success Criteria

✅ Frontend deploys successfully  
✅ Users can register/login  
✅ Tasks and data persist in Supabase  
✅ Google Calendar OAuth works  
✅ Canvas LMS OAuth works (if configured)  
✅ All app features functional  
✅ No console errors  
✅ Mobile responsive  

---

**Estimated deployment time**: 2-3 hours for first-time setup

**Recommended approach**: Option A (separate services) for better security and debugging

**Need help?** Check the deployment platform docs:
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Supabase Docs](https://supabase.com/docs)