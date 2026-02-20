import { useState } from "react";
import StatCard from "../ui/StatCard";
import {
  LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

export default function TeacherDrilldown({ teacher, onBack }) {
  const [activeTab, setActiveTab] = useState("This Week");

  return (
    <>
      <div className="drilldown-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <div>
          <div className="drilldown-name">{teacher.teacher_name}</div>
          <div style={{ fontSize: 13, color: "#9c9589" }}>Performance Overview</div>
        </div>
      </div>

      <div className="drilldown-meta">
        <div style={{ fontSize: 13, color: "#4a4540" }}>
          <strong>Subject:</strong>{" "}
          {["Chemistry", "Science", "Physics", "Maths", "Business Studies", "Biology"].map((s, i) => (
            <span key={i} style={{ marginRight: 6 }}>{s}{i < 5 ? "," : ""}</span>
          ))}
        </div>
        <div className="meta-chips" style={{ marginTop: 8 }}>
          {["Class 7", "Class 8", "Class 9", "Class 10"].map(c => (
            <span key={c} className="meta-chip">{c}</span>
          ))}
        </div>
      </div>

      <div className="tab-group" style={{ marginBottom: 18 }}>
        {["This Week", "This Month", "This Year"].map(t => (
          <button key={t} className={`tab${activeTab === t ? " active" : ""}`} onClick={() => setActiveTab(t)}>{t}</button>
        ))}
      </div>

      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        <StatCard label="Lessons Created" value={teacher.lessons} icon="👤" variant="pink" />
        <StatCard label="Quizzes Conducted" value={teacher.quizzes} icon="🗒️" variant="green" />
        <StatCard label="Assessments Assigned" value={teacher.assessments} icon="📋" variant="amber" />
        <div className="engagement-note stat-card" style={{ background: "#fffbeb" }}>
          <strong>⚠ Low Engagement Note</strong>
          Average score is 0%. Consider reviewing teaching methods.
        </div>
      </div>

      <div className="two-col" style={{ marginTop: 20 }}>
        <div className="card">
          <div className="card-title">Class-wise Breakdown</div>
          <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#7c3aed", display: "inline-block" }} /> Avg Score
            </span>
            <span style={{ fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f97316", display: "inline-block" }} /> Completion
            </span>
          </div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[{ cls: "Class 7" }, { cls: "Class 8" }, { cls: "Class 9" }, { cls: "Class 10" }]} margin={{ left: -24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
                <XAxis dataKey="cls" tick={{ fontSize: 11, fill: "#b0a99a" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#b0a99a" }} axisLine={false} tickLine={false} domain={[0, 4]} />
                <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #ece9e3", fontSize: 13 }} />
                <Line type="monotone" dataKey="score" stroke="#7c3aed" dot={{ r: 3 }} strokeWidth={2} />
                <Line type="monotone" dataKey="completion" stroke="#f97316" dot={{ r: 3 }} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-title" style={{ marginBottom: 12 }}>Recent Activity</div>
          {teacher.total === 0 ? (
            <div className="no-activity">
              <div className="no-activity-icon">🗒️</div>
              <div style={{ fontWeight: 600, color: "#6b6660" }}>No Recent Activity</div>
              <div>No lessons or quizzes created yet</div>
            </div>
          ) : (
            <div>
              {[...Array(Math.min(teacher.total, 3))].map((_, i) => (
                <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid #f7f6f3", fontSize: 13 }}>
                  <div style={{ fontWeight: 500 }}>Lesson #{i + 1}</div>
                  <div style={{ color: "#9c9589", fontSize: 12 }}>Created recently</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
        <button className="export-btn">⬇ Export Report (CSV)</button>
      </div>
    </>
  );
}
