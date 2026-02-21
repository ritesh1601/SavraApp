/**
 * Frontend URL for CORS and auth redirects.
 * In production (or on Render), FRONTEND_URL must be set and must not be localhost.
 */
function getFrontendUrl() {
  const url = process.env.FRONTEND_URL || "http://localhost:5173";
  const isProduction = process.env.NODE_ENV === "production" || process.env.RENDER === "true";
  if (isProduction) {
    if (!process.env.FRONTEND_URL) {
      throw new Error(
        "FRONTEND_URL is required in production (e.g. on Render). Set it in Dashboard → Environment to your frontend URL (e.g. https://yourapp.onrender.com)."
      );
    }
    if (url.includes("localhost") || url.includes("127.0.0.1")) {
      throw new Error(
        "FRONTEND_URL must not point to localhost in production. Set FRONTEND_URL to your deployed frontend URL in Render Environment."
      );
    }
  }
  return url;
}

/**
 * Validates GOOGLE_CALLBACK_URL in production.
 * Must point to the backend callback endpoint, not the frontend.
 */
function validateGoogleCallbackUrl() {
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL;
  const isProduction = process.env.NODE_ENV === "production" || process.env.RENDER === "true";
  
  if (!callbackUrl) {
    return; // Will be caught by required env vars check
  }
  
  if (isProduction) {
    // Must end with /auth/google/callback
    if (!callbackUrl.endsWith("/auth/google/callback")) {
      throw new Error(
        `GOOGLE_CALLBACK_URL must point to your backend callback endpoint.\n` +
        `Current: ${callbackUrl}\n` +
        `Expected: https://YOUR-BACKEND-SERVICE.onrender.com/auth/google/callback\n` +
        `(Replace YOUR-BACKEND-SERVICE with your actual Render backend service URL)\n` +
        `If frontend and backend are on the same service, use: https://savraapp.onrender.com/auth/google/callback`
      );
    }
    // Must not be localhost
    if (callbackUrl.includes("localhost") || callbackUrl.includes("127.0.0.1")) {
      throw new Error(
        "GOOGLE_CALLBACK_URL must not point to localhost in production. Set it to your deployed backend URL + /auth/google/callback in Render Environment."
      );
    }
  }
}

export { getFrontendUrl, validateGoogleCallbackUrl };
