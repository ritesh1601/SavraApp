import StatusDot from "../ui/StatusDot";

export default function TeacherSummaryTable({ summary, statusMap, loading, teachers, onTeacherSelect, onRowClick }) {
  if (loading) {
    return (
      <div className="card">
        <div className="card-title">Per Teacher Summary</div>
        <div>Loading…</div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const s = status || "break";
    const cls = s === "active" ? "badge-green" : s === "busy" ? "badge-amber" : "badge-red";
    return <span className={`badge ${cls}`}>{s}</span>;
  };

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div className="card-title">Per Teacher Summary</div>
        <select
          onChange={(e) => onTeacherSelect?.(e.target.value)}
          style={{ padding: "7px 12px", borderRadius: 10, border: "1px solid #ece9e3", fontSize: 13, fontFamily: "DM Sans, sans-serif" }}
        >
          <option value="">All teachers</option>
          {teachers.map(t => <option key={t.teacher_id} value={t.teacher_id}>{t.teacher_name}</option>)}
        </select>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {["Teacher", "Lessons", "Quizzes", "Assessments", "Total", "Status"].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {summary.map((r) => (
              <tr key={r.teacher_id} style={{ cursor: onRowClick ? "pointer" : "default" }} onClick={() => onRowClick?.(r)}>
                <td>
                  <div className="teacher-cell">
                    <StatusDot status={statusMap[r.teacher_id]?.computed_status} />
                    {r.teacher_name}
                  </div>
                </td>
                <td>{r.lessons}</td>
                <td>{r.quizzes}</td>
                <td>{r.assessments}</td>
                <td><strong>{r.total}</strong></td>
                <td>{getStatusBadge(statusMap[r.teacher_id]?.computed_status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
