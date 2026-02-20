const BASE = import.meta.env.VITE_API_BASE;

export default function AccessDenied({ user, onLogout }) {
  return (
    <div style={{ padding: 24, fontFamily: "system-ui" }}>
      <h2>Access limited</h2>
      <p style={{ opacity: 0.7 }}>
        You are logged in as <b>{user.email}</b> ({user.role}). Only principals can view insights.
      </p>
      <button
        onClick={onLogout}
        style={{ padding: "10px 12px", borderRadius: 10 }}
      >
        Logout
      </button>
    </div>
  );
}
