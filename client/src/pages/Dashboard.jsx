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
  CheckCircle2,
} from "lucide-react";
import api from "../api/client.js";
import { useAuthStore } from "../store/authStore.js";
import { apiErrorMessage } from "../api/client.js";
import { toast } from "../store/toastStore.js";
import Spinner from "../components/Spinner.jsx";
import ErrorState from "../components/ErrorState.jsx";
import ScoreRing from "../components/ScoreRing.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { useT } from "../i18n/index.js";

export default function Dashboard() {
  const { user } = useAuthStore();
  const t = useT();
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
  const greeting = hour < 12 ? t("dash.goodMorning") : hour < 18 ? t("dash.goodAfternoon") : t("dash.goodEvening");
  const today = data.todayProgress || { xpEarned: 0, writingAnalyses: 0, exercisesCompleted: 0, speakingSessions: 0 };

  const cards = [
    { label: t("dash.xpToday"), value: today.xpEarned, icon: Zap, color: "text-amber-500 bg-amber-500/10" },
    { label: t("dash.analyses"), value: today.writingAnalyses, icon: PenLine, color: "text-brand-500 bg-brand-500/10" },
    { label: t("dash.exercises"), value: today.exercisesCompleted, icon: Dumbbell, color: "text-emerald-500 bg-emerald-500/10" },
    { label: t("dash.speaking"), value: today.speakingSessions, icon: Mic, color: "text-violet-500 bg-violet-500/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">
            {greeting}, {user.name.split(" ")[0]} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t("dash.subtitle")}
          </p>
        </div>
        <div className="flex gap-3">
          <span className="badge-amber"><Flame className="h-3.5 w-3.5" /> {user.streak} {t("common.dayStreak")}</span>
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
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t("dash.skillScores")}</h3>
            <div className="flex flex-wrap items-center justify-around gap-4">
              <div className="text-center">
                <ScoreRing value={data.stats.writingAvgScore ?? 0} label={t("dash.writing")} />
                <p className="mt-1 text-xs text-slate-400">{data.stats.writingAnalyses} {t("common.analyses")}</p>
              </div>
              <div className="text-center">
                <ScoreRing value={data.stats.practiceAccuracy ?? 0} label={t("dash.practice")} />
                <p className="mt-1 text-xs text-slate-400">{data.stats.exercisesCompleted} {t("common.done")}</p>
              </div>
              <div className="text-center">
                <ScoreRing value={data.stats.speakingAvgScore ?? 0} label={t("dash.speaking")} />
                <p className="mt-1 text-xs text-slate-400">{data.stats.speakingSessionsCount || 0} {t("common.sessions")}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t("dash.dueForReview")}</h3>
              <Link to="/app/mistakes" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
                {t("dash.viewAll")} <ArrowRight className="inline h-3.5 w-3.5" />
              </Link>
            </div>
            {data.recentMistakes.length === 0 ? (
              <EmptyState
                title={t("dash.noMistakesTitle")}
                description={t("dash.noMistakesDesc")}
                cta={t("dash.startWriting")}
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
                    <Link to="/app/mistakes" className="ml-2 shrink-0 text-brand-600 hover:underline dark:text-brand-400 text-xs font-semibold">{t("dash.review")}</Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t("dash.weakestTopics")}</h3>
            {data.weakestTopics.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">{t("dash.weakestEmpty")}</p>
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
          <DailyChallengeCard />
          <div className="card">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t("dash.recommended")}</h3>
            <div className="space-y-2">
              <RecommendRow to="/app/writing" icon={PenLine} title={t("nav.writing")} desc={t("dash.recoWriting")} />
              <RecommendRow to="/app/practice" icon={Dumbbell} title={t("dash.recoPractice")} desc={data.dueForReview > 0 ? `${data.dueForReview} ${t("common.mistakesDue")}` : t("prac.sub")} />
              <RecommendRow to="/app/chat" icon={MessageSquare} title={t("dash.recoChat")} desc={t("dash.recoChatDesc")} />
              <RecommendRow to="/app/vocabulary" icon={BookOpen} title={t("dash.recoVocab")} desc={data.vocabDue > 0 ? `${data.vocabDue} ${t("common.wordsToReview")}` : t("common.addNewWords")} />
            </div>
          </div>

          <div className="card">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t("dash.achievements")}</h3>
            <div className="flex flex-wrap gap-2">
              {data.achievements.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">{t("dash.achEmpty")}</p>
              ) : (
                data.achievements.map((a) => (
                  <span key={a.id} className="badge-green" title={a.description}>{a.title}</span>
                ))
              )}
            </div>
            <Link to="/app/achievements" className="mt-3 inline-block text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
              {t("dash.viewAllAch")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function DailyChallengeCard() {
  const t = useT();
  const [challenge, setChallenge] = useState(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api
      .get("/progress/challenge")
      .then(({ data }) => setChallenge(data.data.challenge))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post("/progress/challenge/submit", { answer });
      setFeedback(data.data);
      if (data.data.isCorrect) toast.success(`+${data.data.xpEarned} XP`);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card border-brand-500/40 bg-gradient-to-br from-brand-600 to-violet-700 text-white">
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5" />
        <h3 className="font-semibold">{t("dash.dailyChallenge")}</h3>
        {challenge?.attempt && !feedback && (
          <span className="ml-auto text-xs text-white/70">{challenge.attempt.isCorrect ? t("dash.completed") : t("dash.attempted")}</span>
        )}
      </div>
      {loading ? (
        <div className="mt-4 flex justify-center text-white/70"><Spinner size={20} /></div>
      ) : (
        <p className="mt-2 text-sm text-white/80">{challenge?.prompt}</p>
      )}
      {!feedback ? (
        <form onSubmit={submit} className="mt-4 flex gap-2">
          <input
            className="flex-1 rounded-xl border border-white/20 bg-white/15 px-3 py-2 text-sm text-white placeholder-white/50 focus:border-white/40 focus:outline-none"
            placeholder={t("dash.placeholder")}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={!!challenge?.attempt}
          />
          <button type="submit" disabled={submitting || !answer.trim() || !!challenge?.attempt} className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-white/90">
            {submitting ? <Spinner size={16} /> : "+20 XP"}
          </button>
        </form>
      ) : (
        <div className="mt-4">
          <p className={`text-sm font-semibold ${feedback.isCorrect ? "text-emerald-300" : "text-red-300"}`}>
            {feedback.isCorrect ? t("dash.correctAnswer", { xp: feedback.xpEarned }) : t("dash.wrongAnswer", { answer: feedback.correctAnswer })}
          </p>
          {feedback.explanation && <p className="mt-1 text-xs text-white/70">{feedback.explanation}</p>}
        </div>
      )}
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