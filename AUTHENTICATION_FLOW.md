# 🔐 Authentication Flow Guide

This document explains the complete authentication flow for the SavraApp, from login to logout.

---

## 📋 Overview

The app uses **Google OAuth 2.0** with **Passport.js** for authentication, **Express sessions** for session management, and **role-based access control** (Principal vs Teacher).

---

## 🔄 Complete Authentication Flow

### **Phase 1: User Initiates Login**

#### Step 1: User clicks "Login with Google"
**Location:** `client/src/components/auth/LoginPage.jsx` (line 47) or `client/src/components/HomePage.jsx` (line 660)

```jsx
<a href={`${BASE}/auth/google`}>
  Continue with Google
</a>
```

- `BASE` = `VITE_API_BASE` (e.g., `https://savraapp.onrender.com`)
- User is redirected to: `https://savraapp.onrender.com/auth/google`

---

#### Step 2: Backend initiates OAuth
**Location:** `server/src/routes/auth.routes.js` (line 7-10)

```javascript
router.get("/google", (req, res, next) => {
  console.log("🔐 Initiating Google OAuth login");
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});
```

**What happens:**
- Passport.js redirects user to Google's OAuth consent screen
- Google shows: "Sign in with Google to continue"
- User grants permission for profile and email access

---

### **Phase 2: Google OAuth Callback**

#### Step 3: Google redirects back to your backend
**Location:** `server/src/routes/auth.routes.js` (line 12-34)

**Callback URL:** `https://savraapp.onrender.com/auth/google/callback`

**Important:** This URL must be:
- Set in `GOOGLE_CALLBACK_URL` environment variable
- Added to Google Cloud Console → OAuth Client → Authorized redirect URIs

---

#### Step 4: Passport processes OAuth response
**Location:** `server/src/auth/passport.js` (line 40-89)

```javascript
passport.use(
  new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  }, async (_accessToken, _refreshToken, profile, done) => {
    // Extract user info from Google profile
    const email = profile.emails?.[0]?.value?.toLowerCase();
    const name = profile.displayName;
    const provider_id = profile.id;
    
    // Determine role based on PRINCIPAL_EMAILS env var
    const principals = principalEmailsSet();
    const role = principals.has(email) ? "principal" : "teacher";
    
    // Create or update user in MongoDB
    const user = await User.findOneAndUpdate(
      { provider: "google", provider_id },
      { email, name, role, last_login: new Date() },
      { upsert: true, new: true }
    );
    
    return done(null, user);
  })
);
```

**What happens:**
1. Google sends authorization code → Passport exchanges it for user profile
2. Extract email, name, and Google ID from profile
3. Check if email is in `PRINCIPAL_EMAILS` → assign role (`principal` or `teacher`)
4. Create/update user in MongoDB
5. Return user object to Passport

---

#### Step 5: Create session and redirect
**Location:** `server/src/routes/auth.routes.js` (line 25-31)

```javascript
req.logIn(user, (loginErr) => {
  if (loginErr) {
    return res.redirect(`${getFrontendUrl()}?error=...`);
  }
  console.log("✅ Login successful for:", user.email);
  res.redirect(getFrontendUrl()); // Redirects to frontend
});
```

**What happens:**
1. `req.logIn()` creates a session cookie
2. User ID is stored in session (via `passport.serializeUser`)
3. Browser is redirected to frontend: `https://savraapp.onrender.com`

---

### **Phase 3: Frontend Checks Authentication**

#### Step 6: Frontend loads and checks auth status
**Location:** `client/src/App.jsx` (line 22, 54-62)

```jsx
const { me, authLoading, authError, logout } = useAuth();

if (authLoading) return <AuthLoading />;
if (!me) return <HomePage />; // Show login page
if (me.role !== "principal") return <AccessDenied />; // Teachers blocked
```

---

#### Step 7: useAuth hook checks session
**Location:** `client/src/hooks/useAuth.js` (line 10-26)

```javascript
async function loadMe() {
  setAuthLoading(true);
  try {
    const res = await fetch(`${BASE}/auth/me`, { credentials: "include" });
    const json = await res.json();
    if (json.ok && json.user) {
      setMe(json.user); // User is authenticated
    } else {
      setMe(null); // Not authenticated
    }
  } catch (error) {
    setMe(null);
  } finally {
    setAuthLoading(false);
  }
}
```

**What happens:**
- Frontend calls `GET /auth/me` with session cookie (`credentials: "include"`)
- Backend checks session and returns user data

---

#### Step 8: Backend validates session
**Location:** `server/src/routes/auth.routes.js` (line 48-58)

```javascript
router.get("/me", (req, res) => {
  if (!req.isAuthenticated?.()) {
    return res.status(401).json({ ok: false, error: "Not authenticated" });
  }
  res.json({ ok: true, user: req.user });
});
```

**What happens:**
- `req.isAuthenticated()` checks if session exists
- `req.user` is populated by `passport.deserializeUser` (loads user from MongoDB)
- Returns user object: `{ email, name, role, ... }`

---

### **Phase 4: Protected Routes**

#### Step 9: API calls include session cookie
**Location:** `client/src/api.js`

```javascript
export async function apiGet(path) {
  const res = await fetch(`${BASE}${path}`, { credentials: "include" });
  // Session cookie is automatically sent
}
```

**What happens:**
- All API calls include `credentials: "include"`
- Browser automatically sends session cookie with each request
- Backend middleware validates session

---

#### Step 10: Backend middleware protects routes
**Location:** `server/src/middleware/auth.js`

```javascript
export function requireAuth(req, res, next) {
  if (req.user) return next();
  return res.status(401).json({ ok: false, error: "Unauthorized" });
}

export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ ok: false, error: "Unauthorized" });
    if (req.user.role !== role) return res.status(403).json({ ok: false, error: "Forbidden" });
    next();
  };
}
```

**Usage:** Applied to protected routes like `/api/insights/*`

---

### **Phase 5: Logout**

#### Step 11: User clicks logout
**Location:** `client/src/hooks/useAuth.js` (line 28-31)

```javascript
function logout() {
  window.location.href = `${BASE}/auth/logout`;
}
```

---

#### Step 12: Backend clears session
**Location:** `server/src/routes/auth.routes.js` (line 37-46)

```javascript
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    console.log("✅ Logout successful");
    res.redirect(getFrontendUrl()); // Redirects to frontend
  });
});
```

**What happens:**
1. `req.logout()` destroys the session
2. Session cookie is cleared
3. Browser redirected to frontend
4. Frontend `loadMe()` will return `null` → shows login page

---

## 🔑 Key Components

### **Session Management**
- **Storage:** Express session (server-side)
- **Cookie:** HTTP-only, secure, SameSite=None (for cross-origin)
- **Serialization:** User ID stored in session → loaded from MongoDB on each request

### **Role-Based Access Control**
- **Principals:** Emails listed in `PRINCIPAL_EMAILS` env var → full access
- **Teachers:** All other users → blocked from dashboard (`AccessDenied` component)

### **Environment Variables**

**Backend (Render):**
- `FRONTEND_URL` - Where to redirect after login/logout
- `GOOGLE_CALLBACK_URL` - Backend callback endpoint (`/auth/google/callback`)
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret
- `SESSION_SECRET` - Secret for signing session cookies
- `PRINCIPAL_EMAILS` - Comma-separated emails that get "principal" role

**Frontend (Render):**
- `VITE_API_BASE` - Backend server URL (e.g., `https://savraapp.onrender.com`)

---

## 🐛 Common Issues & Solutions

### Issue: Login redirects to localhost
**Cause:** `FRONTEND_URL` not set or points to localhost  
**Fix:** Set `FRONTEND_URL` to production frontend URL in Render

### Issue: OAuth callback goes to frontend (shows code in URL)
**Cause:** `GOOGLE_CALLBACK_URL` missing `/auth/google/callback`  
**Fix:** Set to `https://savraapp.onrender.com/auth/google/callback`

### Issue: Session not persisting
**Cause:** CORS or cookie settings incorrect  
**Fix:** Ensure `credentials: true` in CORS and `credentials: "include"` in fetch calls

### Issue: "Not authenticated" errors
**Cause:** Session expired or cookie not sent  
**Fix:** Check browser cookies, ensure `sameSite: "none"` and `secure: true` for HTTPS

---

## 📊 Flow Diagram

```
User → Frontend → Backend → Google → Backend → Frontend
 │       │          │         │         │         │
 │       │          │         │         │         │
 │       │    [1] GET /auth/google      │         │
 │       │◄─────────┘         │         │         │
 │       │                    │         │         │
 │       │    [2] Redirect to Google OAuth       │
 │       │───────────────────►│         │         │
 │       │                    │         │         │
 │       │    [3] User grants permission         │
 │       │                    │         │         │
 │       │    [4] Google redirects with code     │
 │       │                    │◄────────┘         │
 │       │                    │         │         │
 │       │    [5] GET /auth/google/callback      │
 │       │                    │         │         │
 │       │    [6] Exchange code for profile      │
 │       │                    │         │         │
 │       │    [7] Create/update user in DB      │
 │       │                    │         │         │
 │       │    [8] Create session cookie          │
 │       │                    │         │         │
 │       │    [9] Redirect to frontend          │
 │◄──────┘                    │         │         │
 │                            │         │         │
 │    [10] GET /auth/me (with cookie)            │
 │───────────────────────────►│         │         │
 │                            │         │         │
 │    [11] Return user data                      │
 │◄───────────────────────────┘         │         │
 │                            │         │         │
 │    [12] Show dashboard     │         │         │
 │                            │         │         │
```

---

## ✅ Testing Checklist

- [ ] Login button redirects to Google
- [ ] After Google login, redirects back to frontend (not localhost)
- [ ] User data loads correctly (`/auth/me`)
- [ ] Principals see dashboard
- [ ] Teachers see "Access Denied"
- [ ] Logout clears session and redirects
- [ ] Session persists across page refreshes
- [ ] API calls work with session cookie

---

## 📚 Related Files

- **Frontend Auth:** `client/src/hooks/useAuth.js`
- **Backend Routes:** `server/src/routes/auth.routes.js`
- **Passport Config:** `server/src/auth/passport.js`
- **Session Config:** `server/src/app.js` (lines 34-44)
- **Middleware:** `server/src/middleware/auth.js`
- **Config:** `server/src/config.js`
