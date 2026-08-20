import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  PenLine,
  Dumbbell,
  Mic,
  AlertTriangle,
  BookOpen,
  Target,
  Flame,
  Zap,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import api from "../api/client.js";
import { useAuthStore } from "../store/authStore.js";
import { apiErrorMessage } from "../api/client.js";
import Spinner from "../components/Spinner.jsx";
import ErrorState from "../components/ErrorState.jsx";
import ScoreRing from "../components/ScoreRing.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function Dashboard() {
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get("/progress/dashboard")
      .then(({ data }) => setData(data.data))
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return <DashboardSkeleton />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = data.todayProgress || { xpEarned: 0, writingAnalyses: 0, exercisesCompleted: 0, speakingSessions: 0 };

  const cards = [
    { label: "XP today", value: today.xpEarned, icon: Zap, color: "text-amber-500 bg-amber-500/10" },
    { label: "Analyses", value: today.writingAnalyses, icon: PenLine, color: "text-brand-500 bg-brand-500/10" },
    { label: "Exercises", value: today.exercisesCompleted, icon: Dumbbell, color: "text-emerald-500 bg-emerald-500/10" },
    { label: "Speaking", value: today.speakingSessions, icon: Mic, color: "text-violet-500 bg-violet-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">
            {greeting}, {user.name.split(" ")[0]} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Your personal language detective is on the case.
          </p>
        </div>
        <div className="flex gap-3">
          <span className="badge-amber"><Flame className="h-3.5 w-3.5" /> {user.streak} day streak</span>
          <span className="badge-indigo"><Zap className="h-3.5 w-3.5" /> {user.xp} XP</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card flex items-center gap-3">
            <div className={`rounded-xl p-2.5 ${c.color}`}>
              <c.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{c.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Skill scores</h3>
            <div className="flex flex-wrap items-center justify-around gap-4">
              <div className="text-center">
                <ScoreRing value={data.stats.writingAvgScore ?? 0} label="Writing" />
                <p className="mt-1 text-xs text-slate-400">{data.stats.writingAnalyses} analyses</p>
              </div>
              <div className="text-center">
                <ScoreRing value={data.stats.practiceAccuracy ?? 0} label="Practice" />
                <p className="mt-1 text-xs text-slate-400">{data.stats.exercisesCompleted} done</p>
              </div>
              <div className="text-center">
                <ScoreRing value={data.stats.speakingAvgScore ?? 0} label="Speaking" />
                <p className="mt-1 text-xs text-slate-400">{data.stats.speakingSessionsCount || 0} sessions</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Due for review</h3>
              <Link to="/app/mistakes" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
                View all <ArrowRight className="inline h-3.5 w-3.5" />
              </Link>
            </div>
            {data.recentMistakes.length === 0 ? (
              <EmptyState
                title="No mistakes yet"
                description="Write something in the Writing Detective to find your first mistakes."
                cta="Start writing"
                icon={PenLine}
                onCta={() => (window.location.href = "/app/writing")}
              />
            ) : (
              <div className="space-y-2">
                {data.recentMistakes.map((m) => (
                  <div key={m.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-700/40">
                    <div className="min-w-0">
                      <p className="truncate text-sm">
                        <span className="font-medium text-red-500 line-through">{m.originalText}</span>
                        <span className="mx-1 text-slate-400">→</span>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">{m.correctedText}</span>
                      </p>
                      <p className="text-xs text-slate-400">{m.category}{m.topic ? ` · ${m.topic}` : ""} · {m.severity}</p>
                    </div>
                    <Link to="/app/mistakes" className="ml-2 shrink-0 text-brand-600 hover:underline dark:text-brand-400 text-xs font-semibold">Review</Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Weakest topics</h3>
            {data.weakestTopics.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Practice will appear here as you make mistakes.</p>
            ) : (
              <div className="space-y-3">
                {data.weakestTopics.map((t) => (
                  <div key={t.topic}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-medium">{t.topic}</span>
                      <span className="text-slate-400">{t.count}× · mastery {t.avgMastery}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700">
                      <div className="h-full rounded-full bg-gradient-to-r from-red-500 to-amber-400" style={{ width: `${Math.max(10, 100 - t.avgMastery)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card border-brand-500/40 bg-gradient-to-br from-brand-600 to-violet-700 text-white">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              <h3 className="font-semibold">Daily Challenge</h3>
            </div>
            <p className="mt-2 text-sm text-white/80">Correct today's sentence for +20 XP</p>
            <Link to="/app/practice" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white/20 px-4 py-2.5 text-sm font-semibold hover:bg-white/30">
              Take the challenge <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="card">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Recommended</h3>
            <div className="space-y-2">
              <RecommendRow to="/app/writing" icon={PenLine} title="Writing Detective" desc="Find mistakes in your writing" />
              <RecommendRow to="/app/practice" icon={Dumbbell} title="Personalized practice" desc={data.dueForReview > 0 ? `${data.dueForReview} mistakes due` : "Practice your weak topics"} />
              <RecommendRow to="/app/chat" icon={MessageSquare} title="AI conversation" desc="Practice naturally with AI" />
              <RecommendRow to="/app/vocabulary" icon={BookOpen} title="Vocabulary" desc={data.vocabDue > 0 ? `${data.vocabDue} words to review` : "Add new words"} />
            </div>
          </div>

          <div className="card">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Achievements</h3>
            <div className="flex flex-wrap gap-2">
              {data.achievements.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">Complete activities to earn achievements.</p>
              ) : (
                data.achievements.map((a) => (
                  <span key={a.id} className="badge-green" title={a.description}>{a.title}</span>
                ))
              )}
            </div>
            <Link to="/app/achievements" className="mt-3 inline-block text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
              View all achievements →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecommendRow({ to, icon: Icon, title, desc }) {
  return (
    <Link to={to} className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/40">
      <div className="rounded-lg bg-brand-500/10 p-2 text-brand-600 dark:text-brand-300">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{desc}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-slate-300 dark:text-slate-600" />
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="skeleton h-8 w-64" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-24" />)}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="skeleton h-48" />
          <div className="skeleton h-64" />
        </div>
        <div className="space-y-6">
          <div className="skeleton h-40" />
          <div className="skeleton h-64" />
        </div>
      </div>
    </div>
  );
}