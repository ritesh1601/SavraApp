export default function NavItem({ icon, label, active, onClick }) {
  return (
    <button className={`nav-item${active ? " active" : ""}`} onClick={onClick}>
      <span className="nav-icon">{icon}</span> {label}
    </button>
  );
}
