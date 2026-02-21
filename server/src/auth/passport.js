import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

function principalEmailsSet() {
  const raw = process.env.PRINCIPAL_EMAILS || "";
  return new Set(
    raw
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function setupPassport() {
  // Validate required env vars
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_CALLBACK_URL) {
    throw new Error("Missing required Google OAuth environment variables (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL)");
  }

  passport.serializeUser((user, done) => {
    try {
      done(null, user._id);
    } catch (error) {
      console.error("❌ Serialize error:", error.message);
      done(error);
    }
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).lean();
      done(null, user || null);
    } catch (e) {
      console.error("❌ Deserialize error:", e.message);
      done(e);
    }
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          if (!profile || !profile.id) {
            return done(new Error("Invalid profile data from Google"));
          }

          const email = profile.emails?.[0]?.value?.toLowerCase() || "";
          const name = profile.displayName || "User";
          const provider_id = profile.id;

          if (!email) {
            return done(new Error("No email found in Google profile"));
          }

          const demoMode = process.env.DEMO_MODE === "true";

          const principals = principalEmailsSet();
          const role = demoMode
              ? "principal"   // 👈 in demo, everyone becomes principal
              : (principals.has(email) ? "principal" : "teacher");

          const user = await User.findOneAndUpdate(
            { provider: "google", provider_id },
            {
              $set: {
                email,
                name,
                role,
                last_login: new Date(),
              },
              $setOnInsert: {
                provider: "google",
                provider_id,
              },
            },
            { upsert: true, new: true }
          ).lean();

          console.log(`✅ User ${email} authenticated with role: ${role}`);
          return done(null, user);
        } catch (e) {
          console.error("❌ Google Strategy error:", e.message);
          return done(e);
        }
      }
    )
  );
}