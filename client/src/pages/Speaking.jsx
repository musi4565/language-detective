import { useState, useRef } from "react";
import { Mic, Square, Loader2, AudioLines } from "lucide-react";
import api from "../api/client.js";
import { apiErrorMessage } from "../api/client.js";
import { toast } from "../store/toastStore.js";
import Spinner from "../components/Spinner.jsx";
import ErrorState from "../components/ErrorState.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ScoreRing from "../components/ScoreRing.jsx";

export default function Speaking() {
  const [transcript, setTranscript] = useState("");
  const [result, setResult] = useState(null);
  const [recording, setRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [history, setHistory] = useState(null);
  const [error, setError] = useState("");
  const mediaRef = useRef(null);
  const streamRef = useRef(null);

  const startRecording = async () => {
    setError("");
    setResult(null);
    setTranscript("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Audio recording is not supported in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        stream.getTracks().forEach((t) => t.stop());
        setError("Speech recognition is not supported in this browser. Use Chrome, Edge or Safari.");
        return;
      }
      const rec = new SpeechRecognition();
      rec.lang = "en-US";
      rec.continuous = true;
      rec.interimResults = true;
      mediaRef.current = rec;
      rec.onresult = (e) => {
        let text = "";
        for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
        setTranscript(text);
      };
      rec.onerror = (e) => {
        setRecording(false);
        stream.getTracks().forEach((t) => t.stop());
        if (e.error !== "no-speech" && e.error !== "aborted") {
          setError(`Speech recognition error: ${e.error}`);
        }
      };
      rec.onend = () => {
        setRecording(false);
        stream.getTracks().forEach((t) => t.stop());
      };
      rec.start();
      setRecording(true);
    } catch {
      setError("Microphone access denied. Check browser permissions.");
    }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setRecording(false);
  };

  const analyze = async () => {
    if (!transcript.trim()) {
      toast.error("Nothing recorded yet — speak first!");
      return;
    }
    setAnalyzing(true);
    setError("");
    try {
      const { data } = await api.post("/speaking/analyze", { transcript });
      setResult(data.data.session);
      toast.success(`+${data.data.xpEarned} XP`);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setAnalyzing(false);
    }
  };

  const loadHistory = async () => {
    try {
      const { data } = await api.get("/speaking/history");
      setHistory(data.data.sessions);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const scores = result
    ? [
        { label: "Pronunciation", value: result.pronunciation ?? result.overallScore },
        { label: "Grammar", value: result.grammar ?? result.overallScore },
        { label: "Fluency", value: result.fluency ?? result.overallScore },
        { label: "Vocabulary", value: result.vocabulary ?? result.overallScore },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Speaking</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Speak into the microphone — we transcribe and analyze your speech.
          </p>
        </div>
        <button onClick={loadHistory} className="btn-outline"><AudioLines className="h-4 w-4" /> History</button>
      </div>

      {error && <ErrorState message={error} onRetry={() => setError("")} />}

      <div className="card flex flex-col items-center py-10">
        <div className={`flex h-24 w-24 items-center justify-center rounded-full transition-all ${recording ? "animate-pulse bg-red-500/20 text-red-500" : "bg-brand-100 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300"}`}>
          {recording ? <Square className="h-9 w-9" /> : <Mic className="h-9 w-9" />}
        </div>
        <p className="mt-4 text-sm font-semibold">{recording ? "Listening… speak now" : "Press to start recording"}</p>
        <p className="mt-1 text-xs text-slate-400">Speak for 15-30 seconds about your day, a hobby, or anything.</p>

        <div className="mt-5 flex gap-3">
          {!recording ? (
            <button onClick={startRecording} className="btn-primary"><Mic className="h-4 w-4" /> Start recording</button>
          ) : (
            <button onClick={stopRecording} className="btn-danger"><Square className="h-4 w-4" /> Stop</button>
          )}
          <button onClick={analyze} disabled={analyzing || !transcript.trim()} className="btn-secondary">
            {analyzing ? <><Spinner size={16} /> Analyzing…</> : "Analyze speech"}
          </button>
        </div>

        {transcript && (
          <div className="mt-6 w-full rounded-xl bg-slate-50 p-4 dark:bg-slate-700/40">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Transcript</p>
            <p className="whitespace-pre-wrap text-sm">{transcript}</p>
          </div>
        )}
      </div>

      {result && (
        <div className="space-y-6 animate-fade-in">
          <div className="card flex flex-col items-center gap-6 sm:flex-row sm:justify-around">
            <div className="text-center">
              <ScoreRing value={result.overallScore} size={110} stroke={9} label="Overall" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {scores.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-xl font-bold">{s.value}</p>
                  <p className="text-xs text-slate-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {result.feedback && (
            <div className="card">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">AI feedback</h3>
              <p className="text-sm text-slate-700 dark:text-slate-200">{result.feedback}</p>
            </div>
          )}
        </div>
      )}

      {history && history.length === 0 && (
        <EmptyState title="No speaking sessions yet" description="Record your first speech to get a score." icon={Mic} onCta={() => setHistory(null)} cta="Start speaking" />
      )}
      {history && history.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold">Past sessions</h2>
          {history.map((s) => (
            <div key={s.id} className="card flex items-center gap-4">
              <ScoreRing value={s.overallScore} size={52} stroke={5} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{s.transcript.slice(0, 120)}{s.transcript.length > 120 ? "…" : ""}</p>
                <p className="text-xs text-slate-400">{new Date(s.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}