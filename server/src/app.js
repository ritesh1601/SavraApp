import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";

import statusRoutes from "./routes/status.routes.js";
import activitiesRoutes from "./routes/activities.routes.js";
import insightsRoutes from "./routes/insights.routes.js";
import authRoutes from "./routes/auth.routes.js";
import { setupPassport } from "./auth/passport.js";
import { validateGoogleCallbackUrl } from "./config.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const rawFrontend = process.env.FRONTEND_URL || "http://localhost:5173";
const FRONTEND = rawFrontend.replace(/\/$/, ""); // remove trailing slash
const isProd = process.env.NODE_ENV === "production";

// ✅ CORS (ONE TIME ONLY)
app.use(
  cors({
    origin: FRONTEND,
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

// ✅ Needed on Render for secure cookies
app.set("trust proxy", 1);

// ✅ Session cookies for Vercel <-> Render
app.use(
  session({
    secret: process.env.SESSION_SECRET || "devsecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProd,                 // true in production (https)
      sameSite: isProd ? "none" : "lax",
    },
  })
);

// Validate GOOGLE_CALLBACK_URL points to backend endpoint, not frontend
validateGoogleCallbackUrl();

// Passport
setupPassport();
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get("/", (req, res) => res.json({ ok: true, service: "savrat-insights" }));

app.use("/auth", authRoutes);
app.use("/api/activities", activitiesRoutes);
app.use("/api/insights", insightsRoutes);
app.use("/api/status", statusRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ ok: false, error: `Route not found: ${req.method} ${req.path}` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);
  res.status(500).json({ ok: false, error: err.message || "Internal server error" });
});

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Mongo connected");
    app.listen(PORT, () => console.log(`✅ Server listening on ${PORT}`));
  } catch (e) {
    console.error("❌ Startup error:", e);
    process.exit(1);
  }
}

start();