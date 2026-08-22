import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, Filter, ThumbsUp, ThumbsDown, CheckCircle2, Clock } from "lucide-react";
import api from "../api/client.js";
import { apiErrorMessage } from "../api/client.js";
import { toast } from "../store/toastStore.js";
import Spinner from "../components/Spinner.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import { useT } from "../i18n/index.js";

const CATEGORIES = ["ALL", "GRAMMAR", "VOCABULARY", "SPELLING", "WORD_ORDER", "TENSE", "PREPOSITION", "ARTICLE", "SENTENCE_STRUCTURE", "PRONUNCIATION"];
const SEVERITIES = ["ALL", "low", "medium", "high"];

export default function Mistakes() {
  const t = useT();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [severity, setSeverity] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewingId, setReviewingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filter !== "ALL") params.set("category", filter);
      if (severity !== "ALL") params.set("severity", severity);
      const [listRes, statsRes] = await Promise.all([
        api.get(`/mistakes?${params}`),
        api.get("/mistakes/stats"),
      ]);
      setItems(listRes.data.data.items);
      setStats(statsRes.data.data);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filter, severity]);

  useEffect(load, [load]);

  const review = async (id, isCorrect) => {
    setReviewingId(id);
    try {
      const { data } = await api.post(`/mistakes/${id}/review`, { isCorrect });
      toast.success(isCorrect ? t("mist.correctToast", { xp: data.data.xpEarned }) : t("mist.wrongToast"));
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setReviewingId(null);
    }
  };

  const maxCategory = stats ? Math.max(1, ...Object.values(stats.byCategory)) : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold sm:text-2xl">{t("mist.title")}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t("mist.sub")}
        </p>
      </div>

      {stats && (
        <div className="card flex flex-wrap divide-x divide-slate-100 dark:divide-slate-700/60">
          <StatCol label={t("mist.total")} value={stats.total} />
          <StatCol label={t("mist.mastered")} value={stats.mastered} />
          <StatCol label={t("mist.due")} value={stats.due} />
          <StatCol label={t("mist.avgMastery")} value={`${stats.averageMastery}%`} />
        </div>
      )}

      <div className="card">
        <h3 className="mb-3 flex items-center gap-2 section-title">
          <Filter className="h-3.5 w-3.5" /> {t("mist.byCategory")}
        </h3>
        {stats && Object.keys(stats.byCategory).length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {Object.entries(stats.byCategory).map(([cat, count]) => (
              <div key={cat} className="flex-1 min-w-32">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium">{cat.replace("_", " ")}</span>
                  <span className="text-slate-400">{count}</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${(count / maxCategory) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">{t("mist.noMistakesYet")}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              filter === c
                ? "bg-brand-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300"
            }`}
          >
            {c.replace("_", " ")}
          </button>
        ))}
        <div className="mx-2 w-px bg-slate-200 dark:bg-slate-700" />
        {SEVERITIES.map((s) => (
          <button
            key={s}
            onClick={() => setSeverity(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              severity === s
                ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300"
            }`}
          >
            {s === "ALL" ? t("mist.allSeverities") : s}
          </button>
        ))}
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading ? (
        <div className="flex justify-center py-16 text-brand-600"><Spinner size={28} /></div>
      ) : items.length === 0 ? (
        <EmptyState
          title={t("mist.noMistakesFound")}
          description={filter !== "ALL" ? t("mist.noInCategory") : t("mist.emptyDesc")}
          cta={filter !== "ALL" ? undefined : t("mist.writeText")}
          icon={AlertTriangle}
          onCta={filter === "ALL" ? () => (window.location.href = "/app/writing") : undefined}
        />
      ) : (
        <div className="space-y-2.5">
          {items.map((m) => {
            const due = !m.nextReviewAt || new Date(m.nextReviewAt) <= new Date();
            return (
              <div key={m.id} className="card">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`badge ${m.category === "TENSE" || m.category === "GRAMMAR" ? "badge-red" : "badge-indigo"}`}>{m.category.replace("_", " ")}</span>
                  {m.topic && <span className="badge-slate">{m.topic}</span>}
                  {due && <span className="badge-amber"><Clock className="h-3 w-3" /> {t("common.dueNow")}</span>}
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-2 text-sm">
                  <span className="text-red-500 line-through">{m.originalText}</span>
                  <span className="text-slate-300">→</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">{m.correctedText}</span>
                </div>
                <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{m.explanation}</p>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-700/60">
                  <span className="text-xs text-slate-400">
                    {t("common.mastery")} <b className={m.masteryScore >= 80 ? "text-emerald-500" : m.masteryScore >= 50 ? "text-amber-500" : "text-red-500"}>{m.masteryScore}%</b>
                    {" · "}{t("common.reviewed")} {m.reviewCount}×
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => review(m.id, true)}
                      disabled={reviewingId === m.id}
                      className="btn-secondary px-3 py-1.5 text-xs"
                    >
                      <ThumbsUp className="h-3.5 w-3.5" /> {t("mist.iKnewIt")}
                    </button>
                    <button
                      onClick={() => review(m.id, false)}
                      disabled={reviewingId === m.id}
                      className="btn-outline px-3 py-1.5 text-xs"
                    >
                      <ThumbsDown className="h-3.5 w-3.5" /> {t("mist.stillWrong")}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {stats && Object.keys(stats.byCategory).length > 0 && (
        <div className="card">
          <h3 className="mb-3 flex items-center gap-2 section-title">
            <CheckCircle2 className="h-3.5 w-3.5" /> {t("mist.mostCommon")}
          </h3>
          <div className="space-y-2">
            {stats.mostCommon.slice(0, 5).map((m, i) => (
              <div key={m.topic} className="flex items-center gap-3 text-sm">
                <span className="w-5 text-slate-400">{i + 1}</span>
                <span className="flex-1 font-medium">{m.topic}</span>
                <span className="badge-slate">{m.count}×</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCol({ label, value }) {
  return (
    <div className="flex-1 px-4 py-1 first:pl-0 last:pr-0">
      <p className="text-xl font-semibold">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}