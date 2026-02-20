export default function Topbar({ title, subtitle }) {
  return (
    <div className="topbar">
      <div>
        <div className="page-title">{title}</div>
        {subtitle && <div className="page-subtitle">{subtitle}</div>}
      </div>
    </div>
  );
}
