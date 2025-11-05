export default async function handler(req, res) {
  const { state, provider = 'google', canvas_base } = req.query;
  
  if (!state) {
    return res.status(400).json({ error: 'Missing state parameter (user ID)' });
  }

  const APP_URL = process.env.APP_URL || `https://${req.headers.host}`;
  
  try {
    if (provider === 'google') {
      const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
      
      if (!GOOGLE_CLIENT_ID) {
        return res.status(500).json({ error: 'Google OAuth not configured' });
      }
      
      const redirect_uri = `${APP_URL}/api/oauth/callback?provider=google`;
      const scope = encodeURIComponent('https://www.googleapis.com/auth/calendar.events openid email profile');
      
      const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}&` +
        `redirect_uri=${encodeURIComponent(redirect_uri)}&` +
        `response_type=code&` +
        `scope=${scope}&` +
        `access_type=offline&` +
        `prompt=consent&` +
        `state=${encodeURIComponent(String(state))}`;
      
      res.redirect(302, oauthUrl);
    }
    else if (provider === 'canvas') {
      const CANVAS_CLIENT_ID = process.env.CANVAS_CLIENT_ID;
      
      if (!CANVAS_CLIENT_ID) {
        return res.status(500).json({ error: 'Canvas OAuth not configured' });
      }
      
      if (!canvas_base) {
        return res.status(400).json({ error: 'Missing canvas_base parameter' });
      }
      
      const redirect_uri = `${APP_URL}/api/oauth/callback?provider=canvas`;
      
      const oauthUrl = `${canvas_base.replace(/\/$/, '')}/login/oauth2/auth?` +
        `client_id=${encodeURIComponent(CANVAS_CLIENT_ID)}&` +
        `response_type=code&` +
        `redirect_uri=${encodeURIComponent(redirect_uri)}&` +
        `state=${encodeURIComponent(String(state))}&` +
        `canvas_base=${encodeURIComponent(canvas_base)}`;
      
      res.redirect(302, oauthUrl);
    }
    else {
      res.status(400).json({ error: 'Unsupported OAuth provider' });
    }
  } catch (error) {
    console.error('OAuth start error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}