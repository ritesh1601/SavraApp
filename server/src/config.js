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

export { getFrontendUrl };
