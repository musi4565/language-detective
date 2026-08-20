import { useState } from "react";
import { Link } from "react-router-dom";
import {
  PenLine,
  Search,
  Brain,
  Target,
  MessagesSquare,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Check,
  Zap,
  ShieldCheck,
  BookOpen,
} from "lucide-react";
import { useAuthStore } from "../store/authStore.js";
import { useThemeStore } from "../store/themeStore.js";
import { Moon, Sun } from "lucide-react";

export default function Landing() {
  const { user } = useAuthStore();
  const { theme, toggle } = useThemeStore();

  const cta = user ? (
    <Link to="/app" className="btn-primary px-8 py-3 text-base"><Zap className="h-5 w-5" /> Go to Dashboard</Link>
  ) : (
    <Link to="/register" className="btn-primary px-8 py-3 text-base">Start Learning <ArrowRight className="h-5 w-5" /></Link>
  );

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 text-white">
              <PenLine className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold">Language Detective</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex">
            <a href="#how" className="hover:text-brand-600">How it works</a>
            <a href="#features" className="hover:text-brand-600">Features</a>
            <a href="#faq" className="hover:text-brand-600">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={toggle} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            {user ? (
              <Link to="/app" className="btn-primary">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="btn-outline">Log in</Link>
                <Link to="/register" className="btn-primary">Sign up</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-br from-brand-500/20 to-violet-600/20 blur-3xl" />
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-24 text-center">
          <span className="badge-indigo mb-6 text-sm"><Sparkles className="h-4 w-4" /> AI-powered language learning</span>
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight sm:text-6xl">
            Stop repeating the <span className="bg-gradient-to-r from-brand-500 to-violet-600 bg-clip-text text-transparent">same language mistakes.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
            Language Detective finds your personal mistakes, explains them, and creates practice designed specifically for you.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{cta}</div>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { icon: Brain, label: "AI mistake detection" },
              { icon: Target, label: "Personalized practice" },
              { icon: MessagesSquare, label: "Natural AI conversation" },
              { icon: TrendingUp, label: "Progress tracking" },
            ].map((f) => (
              <div key={f.label} className="card flex flex-col items-center gap-2 py-5">
                <f.icon className="h-6 w-6 text-brand-500" />
                <span className="text-sm font-semibold">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="border-y border-slate-200 bg-slate-50 py-16 dark:border-slate-700 dark:bg-slate-800/40">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold">How it works</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-slate-600 dark:text-slate-300">
            Not another generic course. Language Detective learns from the mistakes YOU make.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { step: "01", title: "You write", desc: "Write anything in the language you're learning — a diary entry, a chat, an essay." },
              { step: "02", title: "AI detects", desc: "AI finds every mistake, explains the rule behind it, and saves it to your personal mistake database." },
              { step: "03", title: "You practice", desc: "Exercises are generated from YOUR mistakes, and spaced repetition makes them stick." },
            ].map((s) => (
              <div key={s.step} className="card">
                <span className="text-3xl font-extrabold text-brand-500/40">{s.step}</span>
                <h3 className="mt-2 text-lg font-bold">{s.title}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-bold">Everything you need</h2>
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: PenLine, title: "AI Writing Analysis", desc: "Paste any text and get a full correction with explanations for every mistake — tense, articles, prepositions and more." },
              { icon: Target, title: "Personalized Practice", desc: "Exercises built around your weakest topics, not generic textbook drills." },
              { icon: MessagesSquare, title: "AI Conversation", desc: "Chat naturally with AI. It corrects you gently without breaking the flow of conversation." },
              { icon: BookOpen, title: "Smart Vocabulary", desc: "The AI explains any word you add — translation, definition, example and pronunciation." },
              { icon: Brain, title: "Spaced Repetition", desc: "Mistakes come back for review at exactly the right moments: 1, 2, 4, 7, 14 and 30 days." },
              { icon: TrendingUp, title: "Progress Tracking", desc: "XP, streaks, skill scores and mistake-reduction charts show your real improvement." },
            ].map((f) => (
              <div key={f.title} className="card hover:border-brand-400/50 hover:shadow-md transition-all">
                <div className="rounded-xl bg-brand-500/10 p-3 text-brand-600 dark:text-brand-300 w-fit">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-3 text-lg font-bold">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-gradient-to-br from-brand-600 to-violet-700 py-16 text-white dark:border-slate-700">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-3xl font-bold">Your mistakes become your curriculum</h2>
          <p className="mx-auto mt-3 max-w-2xl text-white/80">
            Every app gives you the same lessons. Language Detective gives you lessons about the things you actually get wrong — and re-tests them until they stick.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm font-medium">
            {["Real AI analysis", "Your private mistake database", "Personalized exercises", "Gamified progress"].map((i) => (
              <span key={i} className="flex items-center gap-2"><Check className="h-4 w-4" /> {i}</span>
            ))}
          </div>
          <div className="mt-8">{cta}</div>
        </div>
      </section>

      <section id="faq" className="py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-center text-3xl font-bold">FAQ</h2>
          <div className="mt-8 space-y-3">
            {[
              { q: "How does the AI find my mistakes?", a: "When you write a text, our AI analyzes it for grammatical, vocabulary, spelling and structural errors. Every mistake gets an explanation, a category and a severity level." },
              { q: "How are practice exercises personalized?", a: "We track which topics you make mistakes in most often. When you start a practice session, the AI generates exercises specifically for those weak topics." },
              { q: "What is spaced repetition?", a: "Each mistake is re-tested after 1, 2, 4, 7, 14 and 30 days. Answer correctly and the interval grows; get it wrong and you'll see it again sooner." },
              { q: "Which AI provider is used?", a: "The platform supports both Google Gemini and OpenAI. You set your key in the environment and the app uses it automatically." },
              { q: "Is my data private?", a: "Yes. Every user only sees their own mistakes, submissions and progress. Admin accounts have access to aggregated analytics only." },
            ].map((f) => (
              <FaqItem key={f.q} q={f.q} a={f.a} />
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 dark:border-slate-700">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 text-white">
              <PenLine className="h-4 w-4" />
            </div>
            <span className="font-bold">Language Detective</span>
          </div>
          <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            <ShieldCheck className="h-4 w-4" /> Your mistakes stay private. Built for serious learners.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center justify-between text-left font-semibold">
        {q}
        <span className={`text-brand-500 transition-transform ${open ? "rotate-45" : ""}`}>+</span>
      </button>
      {open && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 animate-fade-in">{a}</p>}
    </div>
  );
}