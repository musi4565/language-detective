import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardCheck, ArrowLeft, ArrowRight } from "lucide-react";
import api from "../api/client.js";
import { apiErrorMessage } from "../api/client.js";
import { useAuthStore } from "../store/authStore.js";
import { toast } from "../store/toastStore.js";
import Spinner from "../components/Spinner.jsx";
import ErrorState from "../components/ErrorState.jsx";

export default function PlacementTest() {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    api
      .get("/placement/test")
      .then(({ data }) => setTest(data.data.test))
      .catch((err) => setError(apiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-brand-600 dark:bg-slate-900">
        <Spinner size={36} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-900">
        <ErrorState message={error} onRetry={() => { setLoading(true); window.location.reload(); }} />
      </div>
    );
  }

  if (result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-900">
        <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800 animate-fade-in">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
            <ClipboardCheck className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-2xl font-bold">Placement complete!</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your score and recommended level</p>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="card"><p className="text-2xl font-bold text-brand-600 dark:text-brand-300">{result.score}%</p><p className="text-xs text-slate-400">Score</p></div>
            <div className="card"><p className="text-2xl font-bold text-emerald-600 dark:text-emerald-300">{result.recommendedLevel}</p><p className="text-xs text-slate-400">Level</p></div>
            <div className="card"><p className="text-2xl font-bold text-amber-600 dark:text-amber-300">+20</p><p className="text-xs text-slate-400">XP</p></div>
          </div>

          {result.weakAreas.length > 0 && (
            <div className="mt-4 rounded-xl bg-red-500/10 p-4 text-left">
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">Weak areas</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.weakAreas.map((w) => <span key={w} className="badge-red">{w}</span>)}
              </div>
            </div>
          )}
          {result.strongAreas.length > 0 && (
            <div className="mt-3 rounded-xl bg-emerald-500/10 p-4 text-left">
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Strong areas</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.strongAreas.map((s) => <span key={s} className="badge-green">{s}</span>)}
              </div>
            </div>
          )}

          <button onClick={() => { setUser({ ...(JSON.parse(localStorage.getItem("ld_user") || "{}")), level: result.recommendedLevel }); navigate("/app"); }} className="btn-primary mt-6 w-full">
            Go to dashboard
          </button>
        </div>
      </div>
    );
  }

  const q = test.questions[index];
  const total = test.questions.length;
  const answered = Object.keys(answers).length;
  const last = index === total - 1;

  const submit = async () => {
    setSubmitting(true);
    try {
      const { data } = await api.post("/placement/submit", {
        testId: test.id,
        answers: Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer })),
      });
      setResult(data.data);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-600 via-brand-700 to-violet-800 p-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="mb-4 flex items-center justify-between text-white">
          <h1 className="text-lg font-bold">English Placement Test</h1>
          <span className="rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">{answered}/{total} answered</span>
        </div>
        <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/20">
          <div className="h-full rounded-full bg-white transition-all" style={{ width: `${(answered / total) * 100}%` }} />
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-2xl dark:bg-slate-800">
          <span className="badge-indigo">{q.type}</span>
          <h2 className="mt-3 text-lg font-semibold">{q.prompt}</h2>
          <div className="mt-5 space-y-2">
            {q.options.map((opt) => {
              const selected = answers[q.id] === opt;
              return (
                <button
                  key={opt}
                  onClick={() => setAnswers((a) => ({ ...a, [q.id]: opt }))}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                    selected
                      ? "border-brand-600 bg-brand-600/10 text-brand-700 dark:text-brand-300"
                      : "border-slate-200 hover:border-brand-400 dark:border-slate-600"
                  }`}
                >
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${selected ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300"}`}>
                    {String.fromCharCode(65 + q.options.indexOf(opt))}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={index === 0}
              className="btn-outline"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            {last ? (
              <button onClick={submit} disabled={!answers[q.id] || submitting} className="btn-primary">
                {submitting ? <Spinner size={16} /> : <><span>Submit test</span><ArrowRight className="h-4 w-4" /></>}
              </button>
            ) : (
              <button onClick={() => setIndex((i) => i + 1)} disabled={!answers[q.id]} className="btn-primary">
                Next <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}