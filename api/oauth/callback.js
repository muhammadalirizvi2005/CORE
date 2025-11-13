const fetch = require('node-fetch');

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { code, state, provider = 'google', canvas_base } = req.query;

  if (!code || !state) {
    return res.status(400).json({ error: 'Missing code or state parameter' });
  }

  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const APP_URL = process.env.APP_URL || `https://${req.headers.host}`;
    
    let tokenData;
    
    if (provider === 'google') {
      const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
      const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
      
      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: `${APP_URL}/api/oauth/callback?provider=google`,
          grant_type: 'authorization_code',
        }),
      });
      
      tokenData = await tokenResponse.json();
    } 
    else if (provider === 'canvas') {
      const CANVAS_CLIENT_ID = process.env.CANVAS_CLIENT_ID;
      const CANVAS_CLIENT_SECRET = process.env.CANVAS_CLIENT_SECRET;
      
      if (!canvas_base) {
        return res.status(400).json({ error: 'Missing canvas_base parameter for Canvas OAuth' });
      }
      
      const tokenUrl = `${canvas_base.replace(/\/$/, '')}/login/oauth2/token`;
      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: CANVAS_CLIENT_ID,
          client_secret: CANVAS_CLIENT_SECRET,
          redirect_uri: `${APP_URL}/api/oauth/callback?provider=canvas`,
          code: code
        }),
      });
      
      tokenData = await tokenResponse.json();
    }
    
    if (tokenData.error) {
      console.error(`${provider} OAuth error:`, tokenData);
      return res.status(400).json({ error: tokenData.error });
    }
    
    // Store in Supabase (tokens)
    const supabaseResponse = await fetch(`${SUPABASE_URL}/rest/v1/user_oauth_tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
      },
      body: JSON.stringify({
        user_id: state,
        provider: provider,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString() : null,
        scope: tokenData.scope || null,
        token_type: tokenData.token_type || 'Bearer'
      }),
    });
    
    if (!supabaseResponse.ok) {
      const errorText = await supabaseResponse.text();
      console.error('Supabase error:', errorText);
      throw new Error('Failed to store tokens');
    }
    
    // Also mark the user's connection flags so client can reflect linked status without relinking
    try {
      const userUpdates = {};
      if (provider === 'google') {
        userUpdates['calendar_connected'] = true;
      } else if (provider === 'canvas') {
        userUpdates['canvas_connected'] = true;
        if (canvas_base) userUpdates['canvas_base_url'] = canvas_base;
      }
      if (Object.keys(userUpdates).length > 0) {
        const usersUrl = `${SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(state)}`;
        await fetch(usersUrl, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': SUPABASE_SERVICE_ROLE_KEY,
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify(userUpdates),
        });
      }
    } catch (e) {
      console.error('Failed to update user connection flags:', e);
      // non-fatal; continue redirect
    }

    // Redirect back to app with success indicator
    const redirectUrl = `${APP_URL}?oauth=${provider}_success`;
    res.redirect(302, redirectUrl);
    
  } catch (error) {
    console.error(`${provider} OAuth callback error:`, error);
    const redirectUrl = `${process.env.APP_URL || `https://${req.headers.host}`}?oauth=${provider}_error`;
    res.redirect(302, redirectUrl);
  }
}