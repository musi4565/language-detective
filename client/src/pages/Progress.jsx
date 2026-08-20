import { useState, useEffect } from "react";
import { TrendingUp, Flame, Zap, PenLine, Dumbbell, Mic, CheckCircle2, BookOpen, AlertTriangle } from "lucide-react";
import api from "../api/client.js";
import { apiErrorMessage } from "../api/client.js";
import Spinner from "../components/Spinner.jsx";
import ErrorState from "../components/ErrorState.jsx";

export default function Progress() {
  const [data, setData] = useState(null);
  const [skills, setSkills] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/progress/stats"), api.get("/progress/skills")])
      .then(([stats, sk]) => {
        setData(stats.data.data);
        setSkills(sk.data.data);
      })
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-8 w-48" />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-24" />)}</div>
        <div className="skeleton h-72" />
      </div>
    );
  }
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const s = data.stats;
  const weekly = data.weekly || [];
  const maxXp = Math.max(1, ...weekly.map((d) => d.xpEarned));
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const stats = [
    { label: "Total XP", value: s.totalXp, icon: Zap, color: "text-amber-500 bg-amber-500/10" },
    { label: "Current streak", value: `${s.streak} days`, icon: Flame, color: "text-orange-500 bg-orange-500/10" },
    { label: "Writing analyses", value: s.writingAnalyses, icon: PenLine, color: "text-brand-500 bg-brand-500/10" },
    { label: "Speaking sessions", value: s.speakingSessions, icon: Mic, color: "text-violet-500 bg-violet-500/10" },
    { label: "Exercises completed", value: s.exercisesCompleted, icon: Dumbbell, color: "text-emerald-500 bg-emerald-500/10" },
    { label: "Mistakes corrected", value: s.mistakesCorrected, icon: CheckCircle2, color: "text-green-500 bg-green-500/10" },
    { label: "Vocabulary learned", value: s.vocabularyLearned, icon: BookOpen, color: "text-sky-500 bg-sky-500/10" },
    { label: "Total mistakes", value: s.mistakesTotal, icon: AlertTriangle, color: "text-red-500 bg-red-500/10" },
  ];

  const skillRows = skills
    ? [
        { label: "Writing", value: skills.writing, color: "bg-brand-500" },
        { label: "Speaking", value: skills.speaking, color: "bg-violet-500" },
        { label: "Practice accuracy", value: skills.practice, color: "bg-emerald-500" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Your Progress</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Level {s.level} · Track how you're improving over time.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((st) => (
          <div key={st.label} className="card flex items-center gap-3">
            <div className={`rounded-xl p-2.5 ${st.color}`}><st.icon className="h-5 w-5" /></div>
            <div>
              <p className="text-xl font-bold">{st.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{st.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <TrendingUp className="h-4 w-4" /> Weekly activity (XP)
          </h3>
          <div className="flex h-40 items-end gap-2">
            {weekly.map((d) => (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] text-slate-400">{d.xpEarned > 0 ? d.xpEarned : ""}</span>
                <div
                  className={`w-full rounded-t-lg ${d.xpEarned > 0 ? "bg-brand-500" : "bg-slate-200 dark:bg-slate-700"}`}
                  style={{ height: `${Math.max(4, (d.xpEarned / maxXp) * 100)}%` }}
                />
                <span className="text-[10px] text-slate-400">{dayNames[new Date(d.date).getDay()]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Skill progress</h3>
          <div className="space-y-4">
            {skillRows.map((sk) => (
              <div key={sk.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium">{sk.label}</span>
                  <span className="font-bold">{sk.value}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-700">
                  <div className={`h-full rounded-full ${sk.color} transition-all duration-700`} style={{ width: `${sk.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Mistake reduction (per week)</h3>
        {Object.keys(data.mistakeTrend || {}).length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No mistake data yet.</p>
        ) : (
          <div className="flex h-32 items-end gap-2">
            {Object.entries(data.mistakeTrend).map(([date, count]) => (
              <div key={date} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] text-slate-400">{count}</span>
                <div
                  className="w-full rounded-t-lg bg-gradient-to-t from-red-500 to-amber-400"
                  style={{ height: `${Math.max(4, (count / Math.max(1, ...Object.values(data.mistakeTrend))) * 100)}%` }}
                />
                <span className="text-[10px] text-slate-400">{new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}