import { Router } from "express";
import passport from "passport";
import { getFrontendUrl } from "../config.js";

const router = Router();

router.get("/google", (req, res, next) => {
  console.log("🔐 Initiating Google OAuth login");
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});

router.get(
  "/google/callback",
  (req, res, next) => {
    console.log("🔄 Google OAuth callback received");
    passport.authenticate("google", { failureRedirect: "/auth/error" }, (err, user, info) => {
      if (err) {
        console.error("❌ OAuth error:", err.message);
        return res.redirect(`${getFrontendUrl()}?error=${encodeURIComponent(err.message)}`);
      }
      if (!user) {
        console.error("❌ OAuth failed:", info?.message || "Authentication failed");
        return res.redirect(`${getFrontendUrl()}?error=${encodeURIComponent(info?.message || "Authentication failed")}`);
      }
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error("❌ Login error:", loginErr.message);
          return res.redirect(`${getFrontendUrl()}?error=${encodeURIComponent(loginErr.message)}`);
        }
        console.log("✅ Login successful for:", user.email);
        res.redirect(getFrontendUrl());
      });
    })(req, res, next);
  }
);

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      console.error("❌ Logout error:", err.message);
      return next(err);
    }
    console.log("✅ Logout successful");
    res.redirect(getFrontendUrl());
  });
});

router.get("/me", (req, res) => {
  try {
    if (!req.isAuthenticated?.()) {
      return res.status(401).json({ ok: false, error: "Not authenticated" });
    }
    res.json({ ok: true, user: req.user });
  } catch (error) {
    console.error("❌ /auth/me error:", error.message);
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * Debug endpoint for auth troubleshooting. Safe to call from browser.
 * Returns auth/session state (no secrets). Remove or restrict in production if desired.
 */
router.get("/debug", (req, res) => {
  try {
    const hasSession = !!req.session;
    const hasSessionId = !!(req.sessionID);
    const isAuthenticated = !!req.isAuthenticated?.();
    const origin = req.get("origin") || req.get("referer") || "(none)";
    res.json({
      ok: true,
      debug: {
        hasSession,
        hasSessionId,
        isAuthenticated,
        userEmail: isAuthenticated && req.user ? req.user.email : null,
        origin: origin.slice(0, 80),
        hint: !isAuthenticated && hasSessionId
          ? "Session exists but user not loaded (e.g. cookie domain/path or deserialize failed)"
          : !hasSessionId
            ? "No session cookie received (check CORS, credentials, sameSite, secure)"
            : null,
      },
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

export default router;
