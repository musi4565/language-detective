import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import api from "../api/client.js";
import { apiErrorMessage } from "../api/client.js";
import ErrorState from "../components/ErrorState.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { useT } from "../i18n/index.js";

export default function Progress() {
  const t = useT();
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
        <div className="skeleton h-20" />
        <div className="skeleton h-40" />
        <div className="skeleton h-48" />
      </div>
    );
  }
  if (error) return <ErrorState message={error} onRetry={() => window.location.reload()} />;

  const s = data.stats;
  const skillRows = skills
    ? [
        { label: t("dash.writing"), value: skills.writing },
        { label: t("dash.speaking"), value: skills.speaking },
        { label: t("prog.practiceAccuracy"), value: skills.practice },
      ]
    : [];

  const overall = skillRows.length ? Math.round(skillRows.reduce((sum, r) => sum + r.value, 0) / skillRows.length) : 0;

  const statRows = [
    { label: t("prog.exercisesCompleted"), value: s.exercisesCompleted },
    { label: t("prog.mistakesCorrected"), value: s.mistakesCorrected },
    { label: t("prog.vocabularyLearned"), value: s.vocabularyLearned },
    { label: t("prog.writingAnalyses"), value: s.writingAnalyses },
    { label: t("prog.speakingSessions"), value: s.speakingSessions },
    { label: t("prog.mistakesTotal"), value: s.mistakesTotal },
  ];

  const hasActivity = statRows.some((r) => r.value > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold sm:text-2xl">{t("prog.title")}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t("prog.subLine")}</p>
      </div>

      <div className="card flex flex-wrap items-center gap-8">
        <div>
          <p className="text-xs text-slate-400">{t("common.level")}</p>
          <p className="text-2xl font-semibold">{s.level}</p>
        </div>
        <div className="h-10 w-px bg-slate-200 dark:bg-slate-700" />
        <div className="min-w-[180px] flex-1">
          <div className="mb-1.5 flex justify-between text-xs text-slate-400">
            <span>{t("dash.overallProgress")}</span>
            <span className="font-semibold text-slate-600 dark:text-slate-300">{overall}%</span>
          </div>
          <div className="progress-track h-2"><div className="progress-fill" style={{ width: `${overall}%` }} /></div>
        </div>
      </div>

      <div className="card space-y-4">
        <h3 className="section-title">{t("prog.skillProgress")}</h3>
        {skillRows.map((row) => (
          <div key={row.label}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium">{row.label}</span>
              <span className="text-slate-500 dark:text-slate-400">{row.value}%</span>
            </div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${row.value}%` }} /></div>
          </div>
        ))}
      </div>

      {hasActivity ? (
        <div className="card">
          <h3 className="section-title mb-1">{t("prog.statistics")}</h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {statRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-slate-600 dark:text-slate-300">{row.label}</span>
                <span className="font-semibold">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EmptyState title={t("prog.emptyTitle")} description={t("prog.emptyDesc")} icon={Sparkles} />
      )}
    </div>
  );
}
