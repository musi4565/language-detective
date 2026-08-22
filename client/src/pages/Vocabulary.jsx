import { useState, useEffect, useCallback, useMemo } from "react";
import { BookOpen, Plus, Trash2, Volume2, ThumbsUp, ThumbsDown, X, Search } from "lucide-react";
import api from "../api/client.js";
import { apiErrorMessage } from "../api/client.js";
import { toast } from "../store/toastStore.js";
import Spinner from "../components/Spinner.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import Modal from "../components/Modal.jsx";
import { useT } from "../i18n/index.js";

const DIFFICULTIES = ["all", "easy", "medium", "hard"];

export default function Vocabulary() {
  const t = useT();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(false);
  const [word, setWord] = useState("");
  const [adding, setAdding] = useState(false);
  const [dueOnly, setDueOnly] = useState(false);
  const [difficulty, setDifficulty] = useState("all");
  const [query, setQuery] = useState("");
  const [reviewingId, setReviewingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dueOnly) params.set("due", "true");
      if (difficulty !== "all") params.set("difficulty", difficulty);
      const { data } = await api.get(`/vocabulary?${params}`);
      setItems(data.data.items);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [dueOnly, difficulty]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((v) => v.word.toLowerCase().includes(q) || v.translation?.toLowerCase().includes(q));
  }, [items, query]);

  const addWord = async (e) => {
    e.preventDefault();
    if (!word.trim()) return;
    setAdding(true);
    try {
      await api.post("/vocabulary", { word: word.trim() });
      toast.success(t("vocab.added"));
      setWord("");
      setModal(false);
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setAdding(false);
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/vocabulary/${id}`);
      setItems((s) => s.filter((x) => x.id !== id));
      toast.info(t("vocab.removed"));
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const review = async (id, isCorrect) => {
    setReviewingId(id);
    try {
      const { data } = await api.post(`/vocabulary/${id}/review`, { isCorrect });
      toast.success(isCorrect ? t("vocab.great", { xp: data.data.xpEarned }) : t("vocab.againSoon"));
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl">{t("vocab.title")}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t("vocab.sub")}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setDueOnly((d) => !d)} className={`btn-outline ${dueOnly ? "border-brand-400 text-brand-600 dark:text-brand-400" : ""}`}>
            {t("vocab.dueForReview")}
          </button>
          <button onClick={() => setModal(true)} className="btn-primary"><Plus className="h-4 w-4" /> {t("vocab.addWord")}</button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input className="input pl-10" placeholder={t("vocab.searchPh")} value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => setDifficulty(d)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
                difficulty === d ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300"
              }`}
            >
              {d === "all" ? t("vocab.allLevels") : t(`vocab.diff.${d}`)}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading ? (
        <div className="flex justify-center py-16 text-brand-600"><Spinner size={28} /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={dueOnly ? t("vocab.nothingDue") : t("vocab.noWords")}
          description={dueOnly ? t("vocab.allReviewed") : t("vocab.noWordsDesc")}
          cta={dueOnly ? undefined : t("vocab.addAWord")}
          icon={BookOpen}
          onCta={dueOnly ? undefined : () => setModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v) => {
            const due = !v.nextReviewAt || new Date(v.nextReviewAt) <= new Date();
            return (
              <div key={v.id} className="card-hover flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold">{v.word}</h3>
                    {v.pronunciation && <p className="text-xs text-slate-400">{v.pronunciation}</p>}
                  </div>
                  <div className="flex shrink-0 gap-0.5">
                    <button
                      onClick={() => { try { const u = new SpeechSynthesisUtterance(v.word); u.lang = "en-US"; speechSynthesis.speak(u); } catch {} }}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                      title={t("vocab.listen")}
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => remove(v.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {v.translation && <p className="mt-1 text-sm font-medium text-brand-600 dark:text-brand-400">{v.translation}</p>}
                {v.example && <p className="mt-2 text-xs italic text-slate-500 dark:text-slate-400">"{v.example}"</p>}

                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 text-xs dark:border-slate-700/60">
                  <span className="badge-slate">{t(`vocab.diff.${v.difficulty}`) || v.difficulty}</span>
                  <span className={due ? "badge-amber" : "badge-green"}>
                    {due ? t("common.dueNow") : t("vocab.reviewDate", { date: new Date(v.nextReviewAt).toLocaleDateString() })}
                  </span>
                  <span className="ml-auto text-slate-400">{v.masteryScore}%</span>
                </div>

                <div className="mt-3 flex gap-2">
                  <button onClick={() => review(v.id, true)} disabled={reviewingId === v.id} className="btn-secondary flex-1 px-2 py-1.5 text-xs">
                    <ThumbsUp className="h-3.5 w-3.5" /> {t("vocab.knewIt")}
                  </button>
                  <button onClick={() => review(v.id, false)} disabled={reviewingId === v.id} className="btn-outline flex-1 px-2 py-1.5 text-xs">
                    <ThumbsDown className="h-3.5 w-3.5" /> {t("vocab.forgot")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title={t("vocab.modalTitle")}>
        <form onSubmit={addWord} className="space-y-4">
          <div>
            <label className="label">{t("common.word")}</label>
            <input className="input" placeholder={t("vocab.examplePh")} value={word} onChange={(e) => setWord(e.target.value)} autoFocus required />
          </div>
          <p className="text-xs text-slate-400">{t("vocab.modalHint")}</p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModal(false)} className="btn-outline"><X className="h-4 w-4" /> {t("common.cancel")}</button>
            <button type="submit" disabled={adding} className="btn-primary">{adding ? <Spinner size={16} /> : t("vocab.addWord")}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
