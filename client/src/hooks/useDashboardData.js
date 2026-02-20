import { useEffect, useState, useMemo } from "react";
import { apiGet, apiPost } from "../api";

const demoData = [
  { teacher_id: "T1", teacher_name: "Ashish", activity_type: "lesson", created_at: "2026-02-01", subject: "Math", class: "Grade 7" },
  { teacher_id: "T1", teacher_name: "Ashish", activity_type: "quiz", created_at: "2026-02-02", subject: "Math", class: "Grade 7" },
  { teacher_id: "T2", teacher_name: "Varun", activity_type: "assessment", created_at: "2026-02-02", subject: "Science", class: "Grade 6" },
  // duplicate (should be ignored by dedupe)
  { teacher_id: "T2", teacher_name: "Varun", activity_type: "assessment", created_at: "2026-02-02", subject: "Science", class: "Grade 6" },
];

export function useDashboardData() {
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState([]);
  const [summary, setSummary] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [statusMap, setStatusMap] = useState({});

  async function loadStatuses() {
    try {
      const s = await apiGet("/api/status?stale_minutes=30");
      const map = {};
      for (const row of s) map[row.teacher_id] = row;
      setStatusMap(map);
    } catch (error) {
      console.error("Failed to load statuses:", error);
    }
  }

  async function loadAll() {
    setLoading(true);
    try {
      const [t, s, w] = await Promise.all([
        apiGet("/api/insights/teachers/list"),
        apiGet("/api/insights/teachers/summary"),
        apiGet("/api/insights/weekly"),
      ]);
      setTeachers(t);
      setSummary(s);
      setWeekly(w);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadForTeacher(teacher_id) {
    setLoading(true);
    try {
      const [s, w] = await Promise.all([
        apiGet(`/api/insights/teachers/summary?teacher_id=${encodeURIComponent(teacher_id)}`),
        apiGet(`/api/insights/weekly?teacher_id=${encodeURIComponent(teacher_id)}`),
      ]);
      setSummary(s);
      setWeekly(w);
    } catch (error) {
      console.error("Failed to load teacher data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function seedDemo() {
    try {
      await apiPost("/api/activities/bulk", { activities: demoData });
      await loadAll();
    } catch (error) {
      console.error("Failed to seed demo data:", error);
    }
  }

  const totals = useMemo(() => {
    let lessons = 0, quizzes = 0, assessments = 0, total = 0;
    for (const r of summary) {
      lessons += r.lessons;
      quizzes += r.quizzes;
      assessments += r.assessments;
      total += r.total;
    }
    return { lessons, quizzes, assessments, total };
  }, [summary]);

  useEffect(() => {
    loadAll();
    loadStatuses();

    const id = setInterval(() => {
      loadStatuses().catch(() => {});
    }, 10000); // every 10s

    return () => clearInterval(id);
  }, []);

  return {
    loading,
    teachers,
    summary,
    weekly,
    selectedTeacher,
    setSelectedTeacher,
    statusMap,
    totals,
    loadAll,
    loadForTeacher,
    loadStatuses,
    seedDemo,
  };
}
