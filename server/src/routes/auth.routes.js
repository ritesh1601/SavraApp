import { Router } from "express";
import passport from "passport";

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
        return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}?error=${encodeURIComponent(err.message)}`);
      }
      if (!user) {
        console.error("❌ OAuth failed:", info?.message || "Authentication failed");
        return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}?error=${encodeURIComponent(info?.message || "Authentication failed")}`);
      }
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          console.error("❌ Login error:", loginErr.message);
          return res.redirect(`${process.env.FRONTEND_URL || "http://localhost:5173"}?error=${encodeURIComponent(loginErr.message)}`);
        }
        console.log("✅ Login successful for:", user.email);
        res.redirect(process.env.FRONTEND_URL || "http://localhost:5173");
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
    res.redirect(process.env.FRONTEND_URL || "http://localhost:5173");
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

export default router;
