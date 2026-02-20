import { useState } from "react";
import "./styles/global.css";
import { useAuth } from "./hooks/useAuth";
import { useDashboardData } from "./hooks/useDashboardData";
import AuthLoading from "./components/auth/AuthLoading";
import HomePage from "./components/HomePage";
import AccessDenied from "./components/auth/AccessDenied";
import Sidebar from "./components/layout/Sidebar";
import Topbar from "./components/layout/Topbar";
import TeacherStatusUpdate from "./components/dashboard/TeacherStatusUpdate";
import StatsCards from "./components/dashboard/StatsCards";
import WeeklyTrendChart from "./components/dashboard/WeeklyTrendChart";
// import AIPulse from "./components/dashboard/AIPulse";
import TeacherSummaryTable from "./components/dashboard/TeacherSummaryTable";
import TeacherDrilldown from "./components/dashboard/TeacherDrilldown";
import StatusDot from "./components/ui/StatusDot";

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const { me, authLoading, authError, logout } = useAuth();
  const {
    loading,
    teachers,
    summary,
    weekly,
    statusMap,
    totals,
    loadAll,
    loadForTeacher,
    loadStatuses,
  } = useDashboardData();

  const handleTeacherChange = (teacherId) => {
    if (!teacherId) {
      loadAll();
    } else {
      loadForTeacher(teacherId);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const openDrilldown = (teacher) => {
    setSelectedTeacher(teacher);
    setPage("drilldown");
  };

  const activeTeachers = Object.values(statusMap).filter(s => s.computed_status === "active").length;

  if (authLoading) return <AuthLoading />;

  if (!me) {
    return <HomePage />;
  }

  if (me.role !== "principal") {
    return <AccessDenied user={me} onLogout={handleLogout} />;
  }

  // Dashboard page
  const dashboardPage = (
    <>
      <Topbar title="Admin Companion" subtitle="See What's Happening Across your School!" />

      <div className="section-header">
        <div className="section-title">Insights</div>
        <div className="tab-group tab active">This week</div>
      </div>

      <StatsCards totals={totals} activeTeachers={activeTeachers} />

      <div className="two-col">
        <WeeklyTrendChart data={weekly} />
        {/* <AIPulse /> */}
      </div>

      <TeacherSummaryTable
        summary={summary}
        statusMap={statusMap}
        loading={loading}
        teachers={teachers}
        onTeacherSelect={handleTeacherChange}
        onRowClick={openDrilldown}
      />

      <TeacherStatusUpdate teachers={teachers} onStatusUpdate={loadStatuses} />
    </>
  );

  // Teachers list page
  const teachersPage = (
    <>
      <Topbar title="Teachers" subtitle="All registered teachers and their activity" />
      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>{["Name", "Lessons", "Quizzes", "Assessments", "Total", "Status", ""].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {summary.map(r => {
                const s = statusMap[r.teacher_id]?.computed_status || "break";
                const badgeClass = s === "active" ? "badge-green" : s === "busy" ? "badge-amber" : "badge-red";
                return (
                  <tr key={r.teacher_id}>
                    <td>
                      <div className="teacher-cell">
                        <StatusDot status={s} />
                        {r.teacher_name}
                      </div>
                    </td>
                    <td>{r.lessons}</td>
                    <td>{r.quizzes}</td>
                    <td>{r.assessments}</td>
                    <td><strong>{r.total}</strong></td>
                    <td><span className={`badge ${badgeClass}`}>{s}</span></td>
                    <td>
                      <button
                        style={{ fontSize: 12, padding: "4px 10px", borderRadius: 8, border: "1px solid #ece9e3", cursor: "pointer", background: "#fff" }}
                        onClick={() => openDrilldown(r)}
                      >
                        View →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  // Placeholder pages
  const placeholder = (title) => (
    <>
      <Topbar title={title} />
      <div className="card" style={{ textAlign: "center", padding: 60, color: "#b0a99a" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🚧</div>
        <div style={{ fontWeight: 600, fontSize: 16, color: "#6b6660" }}>Coming soon</div>
        <div style={{ fontSize: 13, marginTop: 4 }}>This section is under construction.</div>
      </div>
    </>
  );

  const pageContent = () => {
    if (page === "dashboard") return dashboardPage;
    if (page === "teachers") return teachersPage;
    if (page === "drilldown" && selectedTeacher) return <TeacherDrilldown teacher={selectedTeacher} onBack={() => setPage("dashboard")} />;
    if (page === "classrooms") return placeholder("Classrooms");
    if (page === "reports") return placeholder("Reports");
    return dashboardPage;
  };

  return (
    <div className="savra-shell">
      <Sidebar activePage={page} onPageChange={setPage} user={me} onLogout={handleLogout} />
      <main className="main">{pageContent()}</main>
    </div>
  );
}
