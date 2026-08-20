import { useState } from "react";
import { Link } from "react-router-dom";
import {
  PenLine,
  Search,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  History,
  ArrowLeft,
} from "lucide-react";
import api from "../api/client.js";
import { apiErrorMessage } from "../api/client.js";
import { toast } from "../store/toastStore.js";
import Spinner from "../components/Spinner.jsx";
import ScoreRing from "../components/ScoreRing.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import { useT } from "../i18n/index.js";

const categoryColor = {
  GRAMMAR: "badge-indigo",
  VOCABULARY: "badge-green",
  SPELLING: "badge-amber",
  WORD_ORDER: "badge-slate",
  TENSE: "badge-red",
  PREPOSITION: "badge-amber",
  ARTICLE: "badge-slate",
  SENTENCE_STRUCTURE: "badge-indigo",
  PRONUNCIATION: "badge-green",
};

const severityColor = {
  low: "badge-green",
  medium: "badge-amber",
  high: "badge-red",
};

export default function Writing() {
  const t = useT();
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [view, setView] = useState("new"); // new | result | history | detail
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");

  const analyze = async () => {
    if (text.trim().length < 3) {
      toast.error(t("writing.minLength"));
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await api.post("/writing/analyze", { text });
      setResult(data.data);
      setView("result");
      if (data.data.analysis.overallScore >= 90) toast.success(t("writing.excellent"));
    } catch (err) {
      setError(apiErrorMessage(err, t("writing.analysisFailed")));
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const { data } = await api.get("/writing/history");
      setHistory(data.data);
      setView("history");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadDetail = async (id) => {
    try {
      const { data } = await api.get(`/writing/${id}`);
      setSelected(data.data.submission);
      setResult({ analysis: data.data.submission, mistakes: data.data.mistakes });
      setView("detail");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const renderHighlighted = () => {
    if (!result || result.mistakes.length === 0) {
      return <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-200">{result?.analysis?.correctedText || text}</p>;
    }
    // simplistic highlight: replace each original mistake within the corrected text
    let html = result.analysis.correctedText;
    result.mistakes.forEach((m) => {
      const safe = m.originalText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      html = html.replace(new RegExp(safe, "gi"), (match) => `<mark class="bg-amber-200 dark:bg-amber-900/60 rounded px-0.5 text-amber-900 dark:text-amber-100">${match}</mark>`);
    });
    return <p className="whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-200" dangerouslySetInnerHTML={{ __html: html }} />;
  };

  if (view === "history" || view === "detail") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => setView("new")} className="btn-outline"><ArrowLeft className="h-4 w-4" /> {t("writing.newAnalysis")}</button>
          <h1 className="text-xl font-bold">{t("writing.historyTitle")}</h1>
        </div>

        {view === "detail" && result && (
          <ResultView
            result={result}
            onBack={() => { setView("history"); setResult(null); }}
            onNew={() => setView("new")}
            historyMode
          />
        )}

        {view === "history" && (historyLoading ? (
          <div className="flex justify-center py-16 text-brand-600"><Spinner size={28} /></div>
        ) : history.total === 0 ? (
          <EmptyState title={t("writing.noHistoryTitle")} description={t("writing.noHistoryDesc")} cta={t("writing.analyzeText")} icon={PenLine} onCta={() => setView("new")} />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {history.items.map((h) => (
              <button key={h.id} onClick={() => loadDetail(h.id)} className="card text-left transition-transform hover:-translate-y-0.5">
                <div className="mb-2 flex items-center justify-between">
                  <ScoreRing value={h.overallScore} size={48} stroke={5} />
                  <span className="text-xs text-slate-400">{new Date(h.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{h.originalText}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {h.recommendedTopics.slice(0, 2).map((t) => <span key={t} className="badge-indigo">{t}</span>)}
                </div>
              </button>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">{t("writing.title")}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t("writing.sub")}
          </p>
        </div>
        <button onClick={loadHistory} disabled={historyLoading} className="btn-outline">
          <History className="h-4 w-4" /> {t("common.history")}
        </button>
      </div>

      {view === "result" && result ? (
        <ResultView
          result={result}
          onBack={() => { setView("new"); setResult(null); }}
          onNew={() => { setView("new"); setResult(null); setText(""); }}
          renderHighlighted={renderHighlighted}
        />
      ) : (
        <div className="card">
          <label className="label">{t("writing.yourText")}</label>
          <textarea
            className="input min-h-40 resize-y font-normal"
            placeholder={t("writing.placeholder")}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-slate-400">{text.length}/5000 {t("writing.characters")}</span>
            <button onClick={analyze} disabled={loading} className="btn-primary">
              {loading ? <><Spinner size={16} /> {t("writing.analyzing")}</> : <><Search className="h-4 w-4" /> {t("writing.analyze")}</>}
            </button>
          </div>
          {error && <div className="mt-4"><ErrorState message={error} onRetry={analyze} /></div>}
        </div>
      )}
    </div>
  );
}

function ResultView({ result, onBack, onNew, historyMode, renderHighlighted }) {
  const t = useT();
  const a = result.analysis;
  const mistakes = result.mistakes || [];
  const score = a.overallScore ?? 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <ScoreRing value={score} size={84} stroke={8} label={t("common.score")} />
          <div>
            <h2 className="text-lg font-bold">{score >= 80 ? t("writing.greatWork") : score >= 60 ? t("writing.goodEffort") : t("writing.keepGoing")}</h2>
            <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">{a.summary}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {onBack && <button onClick={onBack} className="btn-outline">{t("common.back")}</button>}
          {onNew && <button onClick={onNew} className="btn-primary"><PenLine className="h-4 w-4" /> {t("writing.newText")}</button>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t("writing.correctedText")}</h3>
          {renderHighlighted ? renderHighlighted() : (
            <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-200">{a.correctedText}</p>
          )}
        </div>

        <div className="card">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t("writing.mistakesDetected", { count: mistakes.length })}</h3>
          {mistakes.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              <p className="font-medium">{t("writing.noMistakes")}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t("writing.noMistakesDesc")}</p>
            </div>
          ) : (
            <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
              {mistakes.map((m, i) => (
                <div key={i} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={categoryColor[m.category] || "badge-slate"}>{m.category.replace("_", " ")}</span>
                    <span className={severityColor[m.severity] || "badge-slate"}>{m.severity}</span>
                    {m.topic && <span className="badge-indigo">{m.topic}</span>}
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <span className="font-medium text-red-500 line-through">{m.original}</span>
                    <span className="text-slate-400">→</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{m.correction}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{m.explanation}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            <Sparkles className="h-4 w-4" /> {t("writing.strengths")}
          </h3>
          {a.strengths.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">{t("writing.noneDetected")}</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {a.strengths.map((s, i) => <li key={i} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />{s}</li>)}
            </ul>
          )}
        </div>
        <div className="card">
          <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-4 w-4" /> {t("writing.areasToImprove")}
          </h3>
          {a.weaknesses.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">{t("writing.lookingGreat")}</p>
          ) : (
            <ul className="space-y-1.5 text-sm">
              {a.weaknesses.map((w, i) => <li key={i} className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />{w}</li>)}
            </ul>
          )}
        </div>
      </div>

      {a.recommendedTopics?.length > 0 && !historyMode && (
        <div className="card">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t("writing.recommendedPractice")}</h3>
          <div className="flex flex-wrap gap-2">
            {a.recommendedTopics.map((t) => (
              <span key={t} className="badge-indigo">{t}</span>
            ))}
          </div>
          <Link to="/app/practice" className="btn-primary mt-3">{t("writing.practiceTopics")}</Link>
        </div>
      )}

      <p className="text-center text-xs text-slate-400">{t("writing.xpNote")}</p>
    </div>
  );
}