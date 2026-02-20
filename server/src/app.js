import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import statusRoutes from "./routes/status.routes.js";
import activitiesRoutes from "./routes/activities.routes.js";
import insightsRoutes from "./routes/insights.routes.js";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import authRoutes from "./routes/auth.routes.js";
import { setupPassport } from "./auth/passport.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "devsecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      // secure: true  // turn on after HTTPS deployment
      sameSite: "lax",
    },
  })
);

// Validate required environment variables
const requiredEnvVars = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "GOOGLE_CALLBACK_URL"];
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);
if (missingEnvVars.length > 0) {
  console.error("❌ Missing required environment variables:", missingEnvVars.join(", "));
}

try {
  setupPassport();
  console.log("✅ Passport configured");
} catch (error) {
  console.error("❌ Passport setup error:", error.message);
}

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => res.json({ ok: true, service: "savrat-insights" }));

app.use("/api/activities", activitiesRoutes);
app.use("/api/insights", insightsRoutes);
app.use("/api/status", statusRoutes);
app.use("/auth", authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Error:", {
    path: req.path,
    method: req.method,
    error: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
  
  res.status(err.status || 500).json({
    ok: false,
    error: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  console.warn("⚠️  404:", req.method, req.path);
  res.status(404).json({
    ok: false,
    error: `Route not found: ${req.method} ${req.path}`,
    availableRoutes: [
      "GET /",
      "GET /auth/google",
      "GET /auth/google/callback",
      "GET /auth/logout",
      "GET /auth/me",
      "POST /api/activities/bulk",
      "GET /api/insights/*",
      "GET /api/status",
      "POST /api/status",
    ],
  });
});

async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Mongo connected");
    app.listen(PORT, () => console.log(`✅ Server on http://localhost:${PORT}`));
  } catch (e) {
    console.error("❌ Startup error:", e);
    process.exit(1);
  }
}

start();