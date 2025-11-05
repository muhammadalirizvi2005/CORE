# 🚀 CORE App - Quick Deployment Reference

## 📁 What You're Deploying
- **Student Productivity App** with task management, wellness tracking, study groups
- **Tech Stack**: React + TypeScript + Vite + Supabase + Node.js OAuth server
- **Single-platform deployment** on Vercel for simplicity

## 🎯 Recommended Deployment (Option A) ⭐

### All-in-One Vercel Deployment
```bash
1. Install: npm install -g vercel
2. From project root: vercel
3. Set environment variables in Vercel dashboard
4. Update Settings.tsx (see below)
5. Deploy: vercel --prod
```

**Why this is better:**
- ✅ Single platform, one dashboard
- ✅ Free hosting
- ✅ Simpler OAuth setup
- ✅ Auto-deploys from GitHub
- ✅ Perfect for students

## 🔑 Essential Environment Variables

### Vercel Dashboard (All variables):
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=service_role_key
GOOGLE_CLIENT_ID=123.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=secret
CANVAS_CLIENT_ID=canvas_key (optional)
CANVAS_CLIENT_SECRET=canvas_secret (optional)
APP_URL=https://your-app.vercel.app
```

## 🔧 Code Update Required

### In `src/components/Settings.tsx`:
**Replace this:**
```typescript
const oauthServer = import.meta.env.VITE_OAUTH_SERVER;
```

**With this:**
```typescript
const oauthServer = window.location.origin;
```

## 🔧 Setup Requirements

### Before Deploying:
1. **Supabase**: Project created, migrations applied
2. **Google OAuth**: Credentials from Google Cloud Console
3. **Canvas LMS**: Developer key from school (optional)

### OAuth Redirect URIs (Single Domain!):
- Google: `https://your-app.vercel.app/api/oauth/callback`
- Canvas: `https://your-app.vercel.app/api/oauth/callback`

## 🧪 Testing Checklist

✅ App loads without errors  
✅ User registration/login works  
✅ Tasks save to database  
✅ Google Calendar integration works  
✅ Canvas integration works (if configured)  
✅ All features functional on mobile  

## 🆘 Common Issues

**"OAuth redirect mismatch"**
→ Check redirect URIs in Google/Canvas settings

**"CORS error"**  
→ Verify APP_URL in OAuth server matches frontend URL

**"Database connection failed"**
→ Check Supabase URL and keys

**Build fails**
→ Run `npm run build` locally to check for errors

## 📞 Quick Links
- [Full Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Supabase Docs](https://supabase.com/docs)

## ⏱️ Estimated Time
- **First deployment**: 2-3 hours
- **Subsequent deploys**: 5-10 minutes

---
*Need help? Check DEPLOYMENT_GUIDE.md for detailed instructions*