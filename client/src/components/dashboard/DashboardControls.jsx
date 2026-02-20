export default function DashboardControls({ teachers, selectedTeacher, onTeacherChange, onSeedDemo }) {
  return (
    <div style={{ display: "flex", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
      <button onClick={onSeedDemo} style={{ padding: "10px 12px", borderRadius: 10 }}>
        Seed demo data (tests duplicates)
      </button>

      <select
        value={selectedTeacher}
        onChange={(e) => {
          const v = e.target.value;
          onTeacherChange(v);
        }}
        style={{ padding: 10, borderRadius: 10 }}
      >
        <option value="">All teachers</option>
        {teachers.map((t) => (
          <option key={t.teacher_id} value={t.teacher_id}>
            {t.teacher_name} ({t.teacher_id})
          </option>
        ))}
      </select>
    </div>
  );
}
