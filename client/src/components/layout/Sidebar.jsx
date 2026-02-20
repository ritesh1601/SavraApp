import NavItem from "./NavItem";

export default function Sidebar({ activePage, onPageChange, user, onLogout }) {
  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">SAVRA</div>
      <div className="sidebar-section">Main</div>
      <NavItem icon="⊞" label="Dashboard" active={activePage === "dashboard"} onClick={() => onPageChange("dashboard")} />
      <NavItem icon="👤" label="Teachers" active={activePage === "teachers"} onClick={() => onPageChange("teachers")} />
      <NavItem icon="🏫" label="Classrooms" active={activePage === "classrooms"} onClick={() => onPageChange("classrooms")} />
      <NavItem icon="📊" label="Reports" active={activePage === "reports"} onClick={() => onPageChange("reports")} />
      <div className="sidebar-spacer" />
      <div className="sidebar-user">
        <div className="user-avatar">{getInitials(user?.name || user?.email)}</div>
        <div className="user-meta">
          <div className="user-role">{user?.role || "User"}</div>
          <div className="user-name">{user?.name || user?.email || "User"}</div>
        </div>
      </div>
      {onLogout && (
        <button className="sidebar-logout-btn" onClick={onLogout}>
          <span className="sidebar-logout-icon">↪</span>
          <span>Log out</span>
        </button>
      )}
    </aside>
  );
}
