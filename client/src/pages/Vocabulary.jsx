import { useState, useEffect, useCallback } from "react";
import { BookOpen, Plus, Trash2, Volume2, ThumbsUp, ThumbsDown, X } from "lucide-react";
import api from "../api/client.js";
import { apiErrorMessage } from "../api/client.js";
import { toast } from "../store/toastStore.js";
import Spinner from "../components/Spinner.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import Modal from "../components/Modal.jsx";

export default function Vocabulary() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(false);
  const [word, setWord] = useState("");
  const [adding, setAdding] = useState(false);
  const [dueOnly, setDueOnly] = useState(false);
  const [reviewingId, setReviewingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (dueOnly) params.set("due", "true");
      const { data } = await api.get(`/vocabulary?${params}`);
      setItems(data.data.items);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [dueOnly]);

  useEffect(() => { load(); }, [load]);

  const addWord = async (e) => {
    e.preventDefault();
    if (!word.trim()) return;
    setAdding(true);
    try {
      await api.post("/vocabulary", { word: word.trim() });
      toast.success("Word added (AI filled in the details)");
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
      toast.info("Word removed");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const review = async (id, isCorrect) => {
    setReviewingId(id);
    try {
      const { data } = await api.post(`/vocabulary/${id}/review`, { isCorrect });
      toast.success(isCorrect ? `Great! +${data.data.xpEarned} XP` : "You'll see this word again soon");
      load();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Vocabulary</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Words worth remembering. Add any word — the AI explains it for you.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setDueOnly((d) => !d)} className={`btn-outline ${dueOnly ? "border-brand-500 text-brand-600" : ""}`}>
            Due for review
          </button>
          <button onClick={() => setModal(true)} className="btn-primary"><Plus className="h-4 w-4" /> Add word</button>
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : loading ? (
        <div className="flex justify-center py-16 text-brand-600"><Spinner size={28} /></div>
      ) : items.length === 0 ? (
        <EmptyState
          title={dueOnly ? "Nothing due for review" : "No words yet"}
          description={dueOnly ? "All words reviewed. Great job!" : "Add your first word and the AI will define it, translate it and give an example."}
          cta={dueOnly ? undefined : "Add a word"}
          icon={BookOpen}
          onCta={dueOnly ? undefined : () => setModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((v) => {
            const due = !v.nextReviewAt || new Date(v.nextReviewAt) <= new Date();
            return (
              <div key={v.id} className="card flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-bold">{v.word}</h3>
                    {v.pronunciation && <p className="text-xs text-slate-400">{v.pronunciation}</p>}
                  </div>
                  <div className="flex gap-1">
                    <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700" title="Listen (browser TTS)">
                      <Volume2 className="h-4 w-4" onClick={() => { try { const u = new SpeechSynthesisUtterance(v.word); u.lang = "en-US"; speechSynthesis.speak(u); } catch {} }} />
                    </button>
                    <button onClick={() => remove(v.id)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-500/10 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {v.translation && <p className="mt-1 text-sm font-medium text-brand-600 dark:text-brand-300">{v.translation}</p>}
                {v.definition && <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{v.definition}</p>}
                {v.example && <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs italic text-slate-500 dark:bg-slate-700/40 dark:text-slate-300">"{v.example}"</p>}

                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 text-xs dark:border-slate-700">
                  <span className="badge-slate">{v.difficulty}</span>
                  <span className={due ? "badge-amber" : "badge-green"}>{due ? "due now" : `review ${new Date(v.nextReviewAt).toLocaleDateString()}`}</span>
                  <span className="ml-auto">mastery <b className={v.masteryScore >= 80 ? "text-emerald-500" : "text-amber-500"}>{v.masteryScore}%</b></span>
                </div>

                <div className="mt-3 flex gap-2">
                  <button onClick={() => review(v.id, true)} disabled={reviewingId === v.id} className="btn-secondary flex-1 px-2 py-1.5 text-xs">
                    <ThumbsUp className="h-3.5 w-3.5" /> Knew it
                  </button>
                  <button onClick={() => review(v.id, false)} disabled={reviewingId === v.id} className="btn-outline flex-1 px-2 py-1.5 text-xs">
                    <ThumbsDown className="h-3.5 w-3.5" /> Forgot
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={modal} onClose={() => setModal(false)} title="Add a new word">
        <form onSubmit={addWord} className="space-y-4">
          <div>
            <label className="label">Word</label>
            <input className="input" placeholder="e.g. ubiquitous" value={word} onChange={(e) => setWord(e.target.value)} autoFocus required />
          </div>
          <p className="text-xs text-slate-400">
            Just type the word — the AI will automatically add the translation, definition, example and pronunciation.
          </p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setModal(false)} className="btn-outline"><X className="h-4 w-4" /> Cancel</button>
            <button type="submit" disabled={adding} className="btn-primary">{adding ? <Spinner size={16} /> : "Add word"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}