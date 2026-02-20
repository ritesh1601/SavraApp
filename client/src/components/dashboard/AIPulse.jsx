const AI_PULSE = [
  { icon: "👩‍🏫", text: "Harshita has the highest workload with 35 classes and 7 subjects" },
  { icon: "📚", text: "Class 1A has the most students with 7 enrolled" },
  { icon: "⚠️", text: "Class 11A has only 0 students — consider reviewing enrollment", warn: true },
];

export default function AIPulse({ insights = AI_PULSE }) {
  return (
    <div className="card">
      <div className="card-title">AI Pulse Summary</div>
      <div className="card-sub">Real time insights from your data</div>
      {insights.map((p, i) => (
        <div key={i} className={`pulse-item${p.warn ? " warn" : ""}`}>
          <span className="pulse-icon">{p.icon}</span>
          <span>{p.text}</span>
        </div>
      ))}
    </div>
  );
}
