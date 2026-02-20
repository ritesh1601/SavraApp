import { useState } from "react";
import { apiPost } from "../../api";

export default function TeacherStatusUpdate({ teachers = [], onStatusUpdate }) {
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [note, setNote] = useState("");
  const [updating, setUpdating] = useState(false);

  const selectedTeacher = teachers.find((t) => t.teacher_id === selectedTeacherId);

  const handleStatusClick = async (status) => {
    if (!selectedTeacher) {
      return alert("Please select a teacher from the list");
    }

    const { teacher_id, teacher_name } = selectedTeacher;

    setUpdating(true);
    try {
      await apiPost("/api/status", { teacher_id, teacher_name, status, note });
      await onStatusUpdate();
      alert(`Status updated to "${status}" for ${teacher_name}`);
      setNote("");
    } catch (error) {
      alert("Failed to update status: " + error.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="status-panel">
      <div className="card-title" style={{ marginBottom: 12 }}>Teacher Status Update</div>
      <div className="input-row">
        <select
          className="input-field"
          value={selectedTeacherId}
          onChange={(e) => setSelectedTeacherId(e.target.value)}
          style={{ minWidth: 200 }}
          disabled={updating}
        >
          <option value="">Select a teacher…</option>
          {teachers.map((t) => (
            <option key={t.teacher_id} value={t.teacher_id}>
              {t.teacher_name} ({t.teacher_id})
            </option>
          ))}
        </select>
        <input
          className="input-field"
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          style={{ minWidth: 220 }}
          disabled={updating}
        />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {[
          { k: "active", label: "🟢 Active" },
          { k: "busy", label: "🟠 Busy" },
          { k: "break", label: "🔴 Break" },
        ].map((b) => (
          <button
            key={b.k}
            className="status-btn"
            onClick={() => handleStatusClick(b.k)}
            disabled={!selectedTeacher || updating}
          >
            {b.label}
          </button>
        ))}
      </div>
    </div>
  );
}
