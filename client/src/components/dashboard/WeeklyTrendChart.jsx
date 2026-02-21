import {
  AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";

export default function WeeklyTrendChart({ data }) {
  return (
    <div className="card">
      <div className="card-title">Weekly Activity</div>
      <div className="card-sub">Content creation trends</div>
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="gLesson" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#a78bfa" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#b0a99a" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#b0a99a" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid #ece9e3", fontSize: 13 }} />
            <Area type="monotone" dataKey="lesson" stroke="#7c3aed" fill="url(#gLesson)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="quiz" stroke="#f97316" fill="none" strokeWidth={1.5} dot={false} strokeDasharray="4 3" />
            <Area type="monotone" dataKey="total" stroke="#a78bfa" fill="url(#gTotal)" strokeWidth={1.5} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
