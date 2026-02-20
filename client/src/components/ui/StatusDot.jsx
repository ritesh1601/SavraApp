const STATUS_COLOR = { active: "#22c55e", busy: "#f97316", break: "#ef4444" };

export default function StatusDot({ status }) {
  const s = status || "break";
  return <span className="status-dot" style={{ background: STATUS_COLOR[s] }} title={s} />;
}
