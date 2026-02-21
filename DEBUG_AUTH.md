# Debugging Authentication

Use this guide to find where auth is failing and fix it.

---

## 1. Use the debug endpoint (quick check)

Your server exposes a **safe** debug endpoint that shows what the backend sees.

### From the browser (while on your frontend)

1. Open DevTools → **Console**.
2. Run:

```javascript
fetch('https://savraapp.onrender.com/auth/debug', { credentials: 'include' })
  .then(r => r.json())
  .then(d => console.log('Auth debug:', d));
```

(Replace `https://savraapp.onrender.com` with your backend URL if different.)

### Or open the URL directly

Visit: `https://savraapp.onrender.com/auth/debug`  
(If frontend and backend are same origin, you can do this from the same tab after visiting the app.)

### How to read the response

- **`isAuthenticated: true`** → Backend sees you as logged in. If the app still shows “not logged in”, the issue is on the frontend (e.g. not calling `/auth/me` or not sending cookies).
- **`hasSessionId: false`** → Backend did **not** receive a session cookie. Focus on:
  - CORS and `credentials: "include"`
  - Cookie settings: `sameSite`, `secure`, domain
  - Cross-origin: frontend URL must match `FRONTEND_URL` and be allowed by CORS
- **`hasSessionId: true` but `isAuthenticated: false`** → Cookie is sent but session/user not restored. Check:
  - `SESSION_SECRET` unchanged between restarts
  - No errors in server logs on the request (e.g. from `deserializeUser`)

Use the **`hint`** field in the response; it suggests the most likely cause.

---

## 2. Step-by-step by symptom

### Symptom A: “Login with Google” does nothing or wrong redirect

| Check | What to do |
|-------|------------|
| **Where does the link go?** | Right‑click “Login with Google” → Copy link. It should be `{BACKEND_URL}/auth/google` (e.g. `https://savraapp.onrender.com/auth/google`). |
| **Wrong base URL** | Frontend must be built with correct `VITE_API_BASE` (your backend URL). Check env in Render/build and rebuild. |
| **Backend down** | Open `{BACKEND_URL}/` in a tab. You should see `{"ok":true,"service":"savrat-insights"}`. |

---

### Symptom B: After Google, I end up on the wrong page or with `?code=...` in the URL

| Check | What to do |
|-------|------------|
| **Redirect goes to frontend URL with `?code=...`** | Google is redirecting to the **frontend** instead of the **backend** callback. Set `GOOGLE_CALLBACK_URL` to the **backend** callback URL: `https://savraapp.onrender.com/auth/google/callback` (no trailing slash). |
| **Redirect goes to localhost** | On Render, set `FRONTEND_URL` to your real frontend URL (e.g. `https://yourapp.onrender.com`). |
| **Google Console** | In Google Cloud Console → APIs & Services → Credentials → your OAuth client, under “Authorized redirect URIs” add exactly: `https://savraapp.onrender.com/auth/google/callback`. |

---

### Symptom C: After Google I’m on the right site but “not logged in”

Backend might not be creating the session or the browser might not be sending the cookie.

| Step | Action |
|------|--------|
| 1 | Call **`/auth/debug`** with `credentials: 'include'` (see section 1). Note `hasSessionId` and `isAuthenticated`. |
| 2 | **Backend logs**: After clicking “Login with Google”, you should see “✅ Login successful for: …” and a redirect. If you see “❌ OAuth error” or “❌ Login error”, fix that first. |
| 3 | **Cookie in browser**: DevTools → Application (Chrome) or Storage → Cookies. Select your frontend origin. Check for a cookie (often named `connect.sid`). If it’s missing after login, the issue is cookie config (see section 3). |
| 4 | **CORS / credentials**: Every request to the backend (including `/auth/me` and `/auth/debug`) must use `credentials: 'include'`. Our frontend does this in `useAuth.js` and `api.js`; if you added other fetches, ensure they do too. |
| 5 | **Same origin?** If frontend is on `https://app.example.com` and backend on `https://api.example.com`, cookies are cross-origin. You need `sameSite: "none"` and `secure: true` (we have this) and CORS `origin` set to the exact frontend URL. |

---

### Symptom D: “Not authenticated” or 401 on `/auth/me`

| Check | What to do |
|-------|------------|
| **Debug endpoint** | Call `/auth/debug` with `credentials: 'include'`. If `hasSessionId` is false, the server is not getting the cookie. |
| **Cookie present?** | In DevTools → Application → Cookies, confirm the session cookie exists for the right domain and that it’s sent in the request (Network tab → request to `/auth/me` → Headers). |
| **Multiple tabs / logout** | Try one tab, clear site data, then log in again and test. |
| **SESSION_SECRET** | If the server restarted or the secret changed, old cookies are invalid. Log in again. |

---

### Symptom E: Session works in one tab but not another, or after refresh

| Check | What to do |
|-------|------------|
| **Cookie scope** | Session cookie should be set for the backend domain. If you use a different subdomain for “app” vs “api”, cookie domain may need to be set (advanced). |
| **HTTPS** | With `secure: true`, the cookie is only sent over HTTPS. Ensure both frontend and backend use HTTPS. |

---

## 3. Backend checklist (Render)

Confirm these in the **backend** service on Render:

| Variable | Example | Notes |
|----------|--------|--------|
| `FRONTEND_URL` | `https://yourapp.onrender.com` | Exact frontend origin (no trailing slash). Used for redirects and CORS. |
| `GOOGLE_CALLBACK_URL` | `https://savraapp.onrender.com/auth/google/callback` | Must be the **backend** URL + `/auth/google/callback`. |
| `GOOGLE_CLIENT_ID` | From Google Console | |
| `GOOGLE_CLIENT_SECRET` | From Google Console | |
| `SESSION_SECRET` | Long random string | Same value across deploys or sessions break. |
| `NODE_ENV` or `RENDER` | `production` / `true` | So production checks (e.g. `FRONTEND_URL`) run. |

---

## 4. Frontend checklist (Render)

| Variable | Example | Notes |
|----------|--------|--------|
| `VITE_API_BASE` | `https://savraapp.onrender.com` | Backend URL. Must be set at **build** time (Vite embeds it). Rebuild after changing. |

---

## 5. Google Cloud Console

- **Authorized redirect URIs** must include:  
  `https://savraapp.onrender.com/auth/google/callback`  
  (use your real backend URL).
- **Authorized JavaScript origins** (if used): add your frontend origin, e.g.  
  `https://yourapp.onrender.com`.

---

## 6. Quick test flow

1. **Backend alive:**  
   `curl https://savraapp.onrender.com/`  
   → `{"ok":true,"service":"savrat-insights"}`

2. **Debug (no cookie):**  
   `curl https://savraapp.onrender.com/auth/debug`  
   → `isAuthenticated: false`, `hasSessionId: false` (expected without a cookie).

3. **Login in browser:**  
   Open frontend → Login with Google → complete Google flow.

4. **Debug (with cookie):**  
   Same browser, same site, run in console:  
   `fetch('https://savraapp.onrender.com/auth/debug', { credentials: 'include' }).then(r=>r.json()).then(console.log)`  
   → Expect `isAuthenticated: true` and `userEmail: "your@email.com"`.

5. **Frontend:**  
   Reload app; you should see the dashboard (for principals) or Access Denied (for teachers).

---

## 7. Where to look in code

| What you’re checking | File |
|----------------------|------|
| Login link / redirect to Google | `client/src/components/auth/LoginPage.jsx`, `client/src/components/HomePage.jsx` |
| Calling backend and sending cookies | `client/src/hooks/useAuth.js`, `client/src/api.js` |
| Backend auth routes | `server/src/routes/auth.routes.js` |
| Session and cookie config | `server/src/app.js` |
| Google strategy and user creation | `server/src/auth/passport.js` |
| CORS and env validation | `server/src/config.js` |

---

## 8. Remove or restrict the debug endpoint later

`GET /auth/debug` is safe (no secrets returned) but reveals whether a session exists. For production you can:

- Remove the route in `server/src/routes/auth.routes.js`, or
- Guard it: e.g. only allow when `process.env.NODE_ENV === "development"` or when a known debug token is present.

Until then, use it to see exactly what the backend sees and follow the hints in the response.
