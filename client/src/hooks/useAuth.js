import { useEffect, useState } from "react";

const BASE = import.meta.env.VITE_API_BASE;

export function useAuth() {
  const [me, setMe] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  async function loadMe() {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch(`${BASE}/auth/me`, { credentials: "include" });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok && json.user) {
        setMe(json.user);
      } else {
        setMe(null);
        // Only surface non-401 errors (401 = not logged in, which is normal)
        if (res.status !== 401 && json?.error) {
          setAuthError(json.error);
        }
      }
    } catch (error) {
      console.error("[Auth] loadMe failed:", error.message);
      setMe(null);
      setAuthError(error.message || "Cannot reach server");
    } finally {
      setAuthLoading(false);
    }
  }

  function logout() {
    // Navigate to logout endpoint - server clears session and redirects to frontend (full page refresh)
    window.location.href = `${BASE}/auth/logout`;
  }

  useEffect(() => {
    loadMe();
  }, []);

  useEffect(() => {
    // Check for error in URL params (from OAuth callback)
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (error) {
      setAuthError(decodeURIComponent(error));
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return { me, authLoading, authError, loadMe, logout };
}
