import { useState } from "react";
import { Dumbbell, RefreshCw, CheckCircle2, XCircle, Target } from "lucide-react";
import api from "../api/client.js";
import { apiErrorMessage } from "../api/client.js";
import { toast } from "../store/toastStore.js";
import Spinner from "../components/Spinner.jsx";
import ErrorState from "../components/ErrorState.jsx";
import EmptyState from "../components/EmptyState.jsx";

const typeLabel = {
  MULTIPLE_CHOICE: "Multiple choice",
  FILL_BLANK: "Fill in the blank",
  CORRECT_SENTENCE: "Correct the sentence",
  TRANSLATE: "Translate",
  REARRANGE: "Rearrange words",
};

export default function Practice() {
  const [exercises, setExercises] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [started, setStarted] = useState(false);
  const [done, setDone] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [topics, setTopics] = useState([]);

  const generate = async () => {
    setGenerating(true);
    setError("");
    setStarted(false);
    setDone(false);
    setAnswers({});
    setFeedback(null);
    try {
      const { data } = await api.get("/practice?count=5");
      if (data.data.exercises.length === 0) {
        setError("No exercises generated. Try again.");
        return;
      }
      setExercises(data.data.exercises);
      setTopics(data.data.topics);
      setStarted(true);
      setCurrent(0);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not generate practice. Is the AI configured?"));
    } finally {
      setGenerating(false);
    }
  };

  const submit = async (answer) => {
    const ex = exercises[current];
    setLoading(true);
    try {
      const { data } = await api.post(`/practice/${ex.id}/submit`, { answer });
      setAnswers((a) => ({ ...a, [ex.id]: { answer, isCorrect: data.data.isCorrect } }));
      setFeedback({ ...data.data, exercise: ex });
      if (data.data.isCorrect) toast.success(`+${data.data.xpEarned} XP`);
      else toast.error("Not quite. Check the explanation below.");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const next = () => {
    setFeedback(null);
    const nextIdx = current + 1;
    if (nextIdx >= exercises.length) {
      setDone(true);
      const correct = exercises.filter((e) => answers[e.id]?.isCorrect).length;
      setSummary({ total: exercises.length, correct });
    } else {
      setCurrent(nextIdx);
    }
  };

  if (!started) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Personalized Practice</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Exercises generated from YOUR most common mistakes.
          </p>
        </div>

        {error ? (
          <ErrorState message={error} onRetry={generate} />
        ) : (
          <div className="card flex flex-col items-center py-14 text-center">
            <div className="rounded-2xl bg-brand-100 p-5 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
              <Dumbbell className="h-10 w-10" />
            </div>
            <h2 className="mt-4 text-xl font-bold">Ready to practice?</h2>
            <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
              The AI reads your mistake history and builds 5 exercises around your weakest topics — tense errors, articles, prepositions, and more.
            </p>
            <button onClick={generate} disabled={generating} className="btn-primary mt-6">
              {generating ? <><Spinner size={16} /> Generating exercises…</> : <><RefreshCw className="h-4 w-4" /> Generate practice set</>}
            </button>
            {generating && <p className="mt-3 text-xs text-slate-400">This can take up to 30 seconds while the AI works…</p>}
          </div>
        )}
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <div className="card flex flex-col items-center py-10 text-center">
          <div className={`rounded-2xl p-5 ${summary.correct === summary.total ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300"}`}>
            {summary.correct === summary.total ? <CheckCircle2 className="h-10 w-10" /> : <Dumbbell className="h-10 w-10" />}
          </div>
          <h2 className="mt-4 text-2xl font-bold">Practice complete!</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            You got <b>{summary.correct}</b> out of <b>{summary.total}</b> correct.
          </p>
          <div className="mt-4 flex gap-2">
            <button onClick={generate} className="btn-secondary"><RefreshCw className="h-4 w-4" /> New set</button>
            <button onClick={() => { setStarted(false); setDone(false); }} className="btn-outline">Back</button>
          </div>
        </div>
      </div>
    );
  }

  const ex = exercises[current];
  const progressPct = ((current + (feedback ? 1 : 0)) / exercises.length) * 100;

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Practice</h1>
        <span className="text-sm text-slate-400">Exercise {current + 1} of {exercises.length}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${progressPct}%` }} />
      </div>

      {topics.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Target className="h-4 w-4 text-slate-400" />
          {topics.map((t) => <span key={t} className="badge-indigo">{t}</span>)}
        </div>
      )}

      <div key={ex.id} className="card animate-fade-in">
        <div className="mb-2 flex items-center justify-between">
          <span className="badge-indigo">{typeLabel[ex.type] || ex.type}</span>
          <span className="badge-slate">{ex.category}</span>
        </div>
        <h2 className="text-lg font-semibold leading-relaxed">{ex.prompt}</h2>

        {!feedback ? (
          <div className="mt-5">
            {ex.options && ex.options.length > 0 ? (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {ex.options.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => submit(opt)}
                    disabled={loading}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-left text-sm font-medium hover:border-brand-400 disabled:opacity-50 dark:border-slate-600"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <form
                onSubmit={(e) => { e.preventDefault(); const v = e.target.answer.value.trim(); if (v) submit(v); }}
                className="flex gap-2"
              >
                <input name="answer" className="input" placeholder="Type your answer…" autoFocus />
                <button type="submit" disabled={loading} className="btn-primary shrink-0">
                  {loading ? <Spinner size={16} /> : "Check"}
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="mt-5">
            <div className={`flex items-center gap-2 rounded-xl p-3 ${feedback.isCorrect ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400"}`}>
              {feedback.isCorrect ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              <p className="text-sm font-semibold">
                {feedback.isCorrect ? `Correct! +${feedback.xpEarned} XP` : `Incorrect — the answer is: ${feedback.correctAnswer}`}
              </p>
            </div>
            {feedback.explanation && (
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{feedback.explanation}</p>
            )}
            {feedback.mastery && (
              <p className="mt-2 text-xs text-slate-400">
                Topic mastery updated: {feedback.mastery.masteryScore}% · next review in {Math.round((new Date(feedback.mastery.nextReviewAt) - new Date()) / 86400000)} day(s)
              </p>
            )}
            <button onClick={next} className="btn-primary mt-4 w-full">
              {current + 1 >= exercises.length ? "Finish" : "Next exercise"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}