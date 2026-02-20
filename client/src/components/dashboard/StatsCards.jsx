import StatCard from "../ui/StatCard";

export default function StatsCards({ totals, activeTeachers = 0 }) {
  return (
    <div className="stat-grid">
      <StatCard label="Active Teachers" value={activeTeachers} icon="👩‍🏫" variant="pink" />
      <StatCard label="Lessons Created" value={totals.lessons} icon="📖" variant="green" />
      <StatCard label="Assessments Made" value={totals.assessments} icon="📋" variant="amber" />
      <StatCard label="Quizzes Conducted" value={totals.quizzes} icon="🗒️" variant="blue" />
      <StatCard label="Total Activities" value={totals.total} icon="📈" variant="muted" />
    </div>
  );
}
