const BASE = import.meta.env.VITE_API_BASE;

export default function DashboardHeader({ onLogout }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
      <div>
        <h2 style={{ margin: 0 }}>Teacher Insights Dashboard</h2>
        <div style={{ opacity: 0.7, marginTop: 6 }}>
          Inverted Pyramid: KPIs → Trends → Teacher drilldown
        </div>
      </div>
      <button
        onClick={onLogout}
        style={{ padding: "8px 10px", borderRadius: 10 }}
      >
        Logout
      </button>
    </div>
  );
}
