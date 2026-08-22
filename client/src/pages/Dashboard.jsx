import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  PenLine,
  Dumbbell,
  Mic,
  AlertTriangle,
  BookOpen,
  Target,
  ArrowRight,
  MessageSquare,
  Trophy,
} from "lucide-react";
import api from "../api/client.js";
import { useAuthStore } from "../store/authStore.js";
import { apiErrorMessage } from "../api/client.js";
import { toast } from "../store/toastStore.js";
import Spinner from "../components/Spinner.jsx";
import ErrorState from "../components/ErrorState.jsx";
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
  const s = data.stats;
  const scores = [s.writingAvgScore, s.practiceAccuracy, s.speakingAvgScore].filter((v) => typeof v === "number");
  const overall = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  const actions = [
    { to: "/app/writing", icon: PenLine, title: t("nav.writing"), desc: t("dash.recoWriting") },
    { to: "/app/practice", icon: Dumbbell, title: t("dash.recoPractice"), desc: data.dueForReview > 0 ? `${data.dueForReview} ${t("common.mistakesDue")}` : t("prac.sub") },
    { to: "/app/vocabulary", icon: BookOpen, title: t("dash.recoVocab"), desc: data.vocabDue > 0 ? `${data.vocabDue} ${t("common.wordsToReview")}` : t("common.addNewWords") },
    { to: "/app/mistakes", icon: AlertTriangle, title: t("dash.recoMistakes"), desc: t("dash.recoMistakesDesc") },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl">{greeting}, {user.name.split(" ")[0]}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t("dash.subtitle")}</p>
        </div>
        <div className="flex items-center gap-5">
          <div>
            <p className="text-xs text-slate-400">{t("common.level")}</p>
            <p className="text-sm font-semibold">{user.level || "—"}</p>
          </div>
          <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
          <div className="w-32">
            <div className="mb-1 flex justify-between text-xs text-slate-400">
              <span>{t("dash.overallProgress")}</span>
              <span className="font-semibold text-slate-600 dark:text-slate-300">{overall}%</span>
            </div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${overall}%` }} /></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((a) => (
          <Link key={a.to} to={a.to} className="card-hover flex items-start gap-3">
            <div className="rounded-lg bg-brand-50 p-2 text-brand-600 dark:bg-brand-500/10 dark:text-brand-300">
              <a.icon className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{a.title}</p>
              <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{a.desc}</p>
            </div>
            <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600" />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="card">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="section-title">{t("dash.dueForReview")}</h3>
              <Link to="/app/mistakes" className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">
                {t("dash.viewAll")}
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
              <div className="space-y-1.5">
                {data.recentMistakes.map((m) => (
                  <div key={m.id} className="flex items-center justify-between gap-3 rounded-lg px-2.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <div className="min-w-0">
                      <p className="truncate text-sm">
                        <span className="text-red-500 line-through">{m.originalText}</span>
                        <span className="mx-1.5 text-slate-300">→</span>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">{m.correctedText}</span>
                      </p>
                      <p className="text-xs text-slate-400">{m.category}{m.topic ? ` · ${m.topic}` : ""}</p>
                    </div>
                    <Link to="/app/mistakes" className="shrink-0 text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">{t("dash.review")}</Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="section-title mb-3">{t("dash.weakestTopics")}</h3>
            {data.weakestTopics.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">{t("dash.weakestEmpty")}</p>
            ) : (
              <div className="space-y-3">
                {data.weakestTopics.map((topic) => (
                  <div key={topic.topic}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-medium">{topic.topic}</span>
                      <span className="text-xs text-slate-400">{topic.count}× · {topic.avgMastery}%</span>
                    </div>
                    <div className="progress-track">
                      <div className="h-full rounded-full bg-amber-400 transition-all duration-500" style={{ width: `${Math.max(6, 100 - topic.avgMastery)}%` }} />
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
            <h3 className="section-title mb-3">{t("dash.more")}</h3>
            <div className="space-y-1">
              <RecommendRow to="/app/chat" icon={MessageSquare} title={t("dash.recoChat")} desc={t("dash.recoChatDesc")} />
              <RecommendRow to="/app/speaking" icon={Mic} title={t("speak.title")} desc={t("speak.sub")} />
              <RecommendRow
                to="/app/achievements"
                icon={Trophy}
                title={t("dash.achievements")}
                desc={data.achievements.length > 0 ? `${data.achievements.length} ${t("common.unlocked").toLowerCase()}` : t("dash.achEmpty")}
              />
            </div>
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
    <div className="card border-l-2 border-l-brand-500">
      <div className="flex items-center gap-2">
        <Target className="h-4 w-4 text-brand-500" />
        <h3 className="text-sm font-semibold">{t("dash.dailyChallenge")}</h3>
        {challenge?.attempt && !feedback && (
          <span className="ml-auto text-xs text-slate-400">{challenge.attempt.isCorrect ? t("dash.completed") : t("dash.attempted")}</span>
        )}
      </div>
      {loading ? (
        <div className="mt-4 flex justify-center text-brand-500"><Spinner size={18} /></div>
      ) : (
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{challenge?.prompt}</p>
      )}
      {!feedback ? (
        <form onSubmit={submit} className="mt-3 flex gap-2">
          <input
            className="input"
            placeholder={t("dash.placeholder")}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={!!challenge?.attempt}
          />
          <button type="submit" disabled={submitting || !answer.trim() || !!challenge?.attempt} className="btn-primary shrink-0 px-3 text-xs">
            {submitting ? <Spinner size={14} /> : "+20 XP"}
          </button>
        </form>
      ) : (
        <div className="mt-3">
          <p className={`text-sm font-medium ${feedback.isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
            {feedback.isCorrect ? t("dash.correctAnswer", { xp: feedback.xpEarned }) : t("dash.wrongAnswer", { answer: feedback.correctAnswer })}
          </p>
          {feedback.explanation && <p className="mt-1 text-xs text-slate-400">{feedback.explanation}</p>}
        </div>
      )}
    </div>
  );
}

function RecommendRow({ to, icon: Icon, title, desc }) {
  return (
    <Link to={to} className="flex items-center gap-3 rounded-lg p-2 transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-slate-700/40">
      <div className="rounded-lg bg-slate-100 p-2 text-slate-500 dark:bg-slate-700/60 dark:text-slate-300">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="truncate text-xs text-slate-400">{desc}</p>
      </div>
      <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-300 dark:text-slate-600" />
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="skeleton h-10 w-72" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-16" />)}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="skeleton h-48" />
          <div className="skeleton h-40" />
        </div>
        <div className="space-y-6">
          <div className="skeleton h-32" />
          <div className="skeleton h-48" />
        </div>
      </div>
    </div>
  );
}
