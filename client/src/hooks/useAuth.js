import { useEffect, useState } from "react";

const BASE = import.meta.env.VITE_API_BASE;

export function useAuth() {
  const [me, setMe] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  async function loadMe() {
    setAuthLoading(true);
    try {
      const res = await fetch(`${BASE}/auth/me`, { credentials: "include" });
      const json = await res.json();
      if (json.ok && json.user) {
        setMe(json.user);
      } else {
        setMe(null);
      }
    } catch (error) {
      console.error("Failed to load user:", error);
      setMe(null);
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
