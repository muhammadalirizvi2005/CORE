# Settings.tsx Code Changes for Vercel Deployment

## Update Required in `src/components/Settings.tsx`

### Find and Replace These Functions:

#### 1. Update `openCalendar` function:

**Find this code (around line 217):**
```typescript
const openCalendar = () => {
  const oauthServer = import.meta.env.VITE_OAUTH_SERVER;
  const user = authService.getCurrentUser();
  if (oauthServer && user) {
    const startUrl = `${oauthServer.replace(/\/$/, '')}/oauth/google/start?state=${encodeURIComponent(user.id)}`;
    dispatchToast('Redirecting to Google to connect your calendar...', 'info');
    window.location.href = startUrl;
    return;
  }

  openModal('Connect Google Calendar', 'calendar.google.com/..', '', handleCalendarSubmit);
};
```

**Replace with:**
```typescript
const openCalendar = () => {
  const user = authService.getCurrentUser();
  if (user) {
    const startUrl = `/api/oauth/start?provider=google&state=${encodeURIComponent(user.id)}`;
    dispatchToast('Redirecting to Google to connect your calendar...', 'info');
    window.location.href = startUrl;
    return;
  }

  openModal('Connect Google Calendar', 'calendar.google.com/..', '', handleCalendarSubmit);
};
```

#### 2. Update `openCanvas` function:

**Find this code (around line 130):**
```typescript
const openCanvas = () => {
  const oauthServer = import.meta.env.VITE_OAUTH_SERVER;
  const user = authService.getCurrentUser();
  if (oauthServer && user && canvasBaseUrl) {
    const startUrl = `${oauthServer.replace(/\/$/, '')}/oauth/canvas/start?state=${encodeURIComponent(user.id)}&canvas_base=${encodeURIComponent(canvasBaseUrl)}`;
    dispatchToast('Redirecting to Canvas to complete connection...', 'info');
    window.location.href = startUrl;
    return;
  }

  // fallback: ask user for their Canvas domain
  openModal('Connect Canvas', 'your-school.instructure.com', '', handleCanvasSubmit);
};
```

**Replace with:**
```typescript
const openCanvas = () => {
  const user = authService.getCurrentUser();
  if (user && canvasBaseUrl) {
    const startUrl = `/api/oauth/start?provider=canvas&state=${encodeURIComponent(user.id)}&canvas_base=${encodeURIComponent(canvasBaseUrl)}`;
    dispatchToast('Redirecting to Canvas to complete connection...', 'info');
    window.location.href = startUrl;
    return;
  }

  // fallback: ask user for their Canvas domain
  openModal('Connect Canvas', 'your-school.instructure.com', '', handleCanvasSubmit);
};
```

## Summary of Changes:

1. **Removed dependency on `VITE_OAUTH_SERVER`** environment variable
2. **Changed OAuth URLs** to use Vercel serverless functions:
   - Google: `/api/oauth/start?provider=google&state=userId`
   - Canvas: `/api/oauth/start?provider=canvas&state=userId&canvas_base=canvasUrl`

3. **Simplified logic** - no need to check for external OAuth server

These changes make the OAuth flow work entirely within your Vercel deployment, using the serverless functions in the `/api` directory.