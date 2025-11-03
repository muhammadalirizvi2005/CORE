OAuth server scaffold

This small Node/Express server provides callback endpoints to exchange authorization codes for tokens and store them in Supabase.

Environment variables required:
- SUPABASE_URL - e.g. https://xyzcompany.supabase.co
- SUPABASE_SERVICE_ROLE_KEY - Supabase service_role key (KEEP SECRET, do not commit)
- GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET - Google OAuth app credentials
- CANVAS_CLIENT_ID / CANVAS_CLIENT_SECRET - Canvas OAuth creds (optional)
- APP_URL - your frontend origin (e.g. http://localhost:5173)

How to use
1. Install dependencies:
   npm install express node-fetch body-parser
2. Run server locally:
   APP_URL=http://localhost:5173 SUPABASE_URL=https://... SUPABASE_SERVICE_ROLE_KEY=... GOOGLE_CLIENT_ID=... GOOGLE_CLIENT_SECRET=... node index.js
3. Make sure your frontend starts OAuth with a `state` parameter containing the authenticated user's id (so the server knows which user to associate the tokens with).

Security note
- The service role key provides elevated privileges and must be kept secret. Deploy this server in a secure environment (VPC, serverless with proper secrets management), not in client-side code.
- Consider encrypting tokens at rest or storing them in a secure secrets store.

Frontend changes needed
- When starting the OAuth redirect from Settings, include `state=${userId}` in the provider query params so the callback can associate tokens with a user.
- Example Google OAuth URL used by frontend:
   Frontend should now redirect the browser to the OAuth server start endpoints, which will initiate the provider redirect. Example:

   # Google (frontend)
   ${OAUTH_SERVER_BASE}/oauth/google/start?state=${userId}

   # Canvas (frontend) - canvas_base is the saved Canvas domain (e.g. https://school.instructure.com)
   ${OAUTH_SERVER_BASE}/oauth/canvas/start?state=${userId}&canvas_base=${encodeURIComponent(canvasBase)}

