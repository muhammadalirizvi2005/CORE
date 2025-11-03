/*
Simple OAuth callback server scaffold.
- Exchanges authorization codes for tokens (Google & Canvas)
- Inserts token records into Supabase `user_oauth_tokens` table using the SUPABASE_SERVICE_ROLE_KEY

ENV vars required:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- CANVAS_CLIENT_ID (optional)
- CANVAS_CLIENT_SECRET (optional)
- APP_URL (e.g. https://your-app.example or http://localhost:5173)

Notes:
- The frontend must include a `state` query parameter when starting OAuth that contains the authenticated user id (e.g. state=userId)
- This server is a scaffold for local/dev testing. For production, secure the server and follow provider best practices.
*/

const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const CANVAS_CLIENT_ID = process.env.CANVAS_CLIENT_ID;
const CANVAS_CLIENT_SECRET = process.env.CANVAS_CLIENT_SECRET;
const APP_URL = process.env.APP_URL || 'http://localhost:5173';
const SERVER_BASE = process.env.SERVER_BASE || `http://localhost:${process.env.PORT || 4000}`;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  process.exit(1);
}

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Helper to insert token into Supabase via REST
async function upsertTokenToSupabase({ user_id, provider, access_token, refresh_token, expires_at, scope, token_type }) {
  const url = `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/user_oauth_tokens`;
  const body = {
    user_id,
    provider,
    access_token,
    refresh_token,
    scope,
    token_type,
    expires_at
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Supabase insert failed: ${res.status} ${txt}`);
  }

  const data = await res.json();
  return data;
}

// Google OAuth callback
app.get('/oauth/google/callback', async (req, res) => {
  const { code, state } = req.query; // state should contain user id
  if (!code || !state) return res.status(400).send('Missing code or state');
  try {
  const redirect_uri = `${SERVER_BASE.replace(/\/$/, '')}/oauth/google/callback`;
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri,
        grant_type: 'authorization_code'
      })
    });

    const tokenJson = await tokenRes.json();
    if (tokenJson.error) throw tokenJson;

    await upsertTokenToSupabase({
      user_id: state,
      provider: 'google',
      access_token: tokenJson.access_token,
      refresh_token: tokenJson.refresh_token,
      expires_at: tokenJson.expires_in ? new Date(Date.now() + tokenJson.expires_in * 1000).toISOString() : null,
      scope: tokenJson.scope,
      token_type: tokenJson.token_type
    });

    return res.redirect(`${APP_URL.replace(/\/$/, '')}/?oauth=google_success`);
  } catch (err) {
    console.error('Google OAuth callback error', err);
    return res.redirect(`${APP_URL.replace(/\/$/, '')}/?oauth=google_error`);
  }
});

// Google OAuth start - redirect user to Google's consent screen
app.get('/oauth/google/start', (req, res) => {
  const { state } = req.query; // user id
  if (!GOOGLE_CLIENT_ID) return res.status(500).send('Google client ID not configured');
  const redirect_uri = `${SERVER_BASE.replace(/\/$/, '')}/oauth/google/callback`;
  const scope = encodeURIComponent('https://www.googleapis.com/auth/calendar.events openid email profile');
  const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}&redirect_uri=${encodeURIComponent(redirect_uri)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${encodeURIComponent(String(state || ''))}`;
  res.redirect(oauthUrl);
});

// Canvas OAuth callback (Canvas domains vary, so state must include the canvas base URL or user should have saved it earlier)
app.get('/oauth/canvas/callback', async (req, res) => {
  const { code, state, canvas_base } = req.query; // state: user id, canvas_base optional
  if (!code || !state) return res.status(400).send('Missing code or state');

  try {
    // canvas_base may be provided by frontend when starting OAuth; otherwise we expect it saved in user's record
    const canvasBase = canvas_base || req.query.canvas_base;
    if (!canvasBase) {
      console.error('Missing canvas base URL');
      return res.redirect(`${APP_URL.replace(/\/$/, '')}/?oauth=canvas_error`);
    }

  const tokenUrl = `${String(canvasBase).replace(/\/$/, '')}/login/oauth2/token`;
    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: CANVAS_CLIENT_ID,
        client_secret: CANVAS_CLIENT_SECRET,
        redirect_uri: `${APP_URL.replace(/\/$/, '')}/oauth/canvas`,
        code: String(code)
      })
    });

    const tokenJson = await tokenRes.json();
    if (tokenJson.error) throw tokenJson;

    await upsertTokenToSupabase({
      user_id: state,
      provider: 'canvas',
      access_token: tokenJson.access_token,
      refresh_token: tokenJson.refresh_token,
      expires_at: tokenJson.expires_at || null,
      scope: null,
      token_type: tokenJson.token_type || 'Bearer'
    });

    return res.redirect(`${APP_URL.replace(/\/$/, '')}/?oauth=canvas_success`);
  } catch (err) {
    console.error('Canvas OAuth callback error', err);
    return res.redirect(`${APP_URL.replace(/\/$/, '')}/?oauth=canvas_error`);
  }
});

// Canvas OAuth start - redirect user to Canvas consent screen
app.get('/oauth/canvas/start', (req, res) => {
  const { state, canvas_base } = req.query; // state=user id, canvas_base is required
  const base = String(canvas_base || '');
  if (!base) return res.status(400).send('Missing canvas_base');
  if (!CANVAS_CLIENT_ID) return res.status(500).send('Canvas client ID not configured');
  const redirect_uri = `${SERVER_BASE.replace(/\/$/, '')}/oauth/canvas/callback`;
  const oauthUrl = `${base.replace(/\/$/, '')}/login/oauth2/auth?client_id=${encodeURIComponent(CANVAS_CLIENT_ID)}&response_type=code&redirect_uri=${encodeURIComponent(redirect_uri)}&state=${encodeURIComponent(String(state || ''))}`;
  res.redirect(oauthUrl);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`OAuth server listening on port ${PORT}`));
