export default function StatCard({ label, value, sub = "This week", icon, variant = "" }) {
  return (
    <div className={`stat-card ${variant}`}>
      <span className="stat-card-icon">{icon}</span>
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-sub">{sub}</div>
    </div>
  );
}
