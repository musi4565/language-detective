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
import { useT } from "../i18n/index.js";
import LanguageSwitcher from "../components/LanguageSwitcher.jsx";
import { Moon, Sun } from "lucide-react";

export default function Landing() {
  const { user } = useAuthStore();
  const { theme, toggle } = useThemeStore();
  const t = useT();

  const cta = user ? (
    <Link to="/app" className="btn-primary px-8 py-3 text-base"><Zap className="h-5 w-5" /> {t("landing.goDashboard")}</Link>
  ) : (
    <Link to="/register" className="btn-primary px-8 py-3 text-base">{t("landing.startLearning")} <ArrowRight className="h-5 w-5" /></Link>
  );

  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
              <PenLine className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold">Language Detective</span>
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300 md:flex">
            <a href="#how" className="hover:text-brand-600">{t("landing.nav.how")}</a>
            <a href="#features" className="hover:text-brand-600">{t("landing.nav.features")}</a>
            <a href="#faq" className="hover:text-brand-600">{t("landing.nav.faq")}</a>
          </nav>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button onClick={toggle} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            {user ? (
              <Link to="/app" className="btn-primary">{t("common.dashboard")}</Link>
            ) : (
              <>
                <Link to="/login" className="btn-outline">{t("landing.login")}</Link>
                <Link to="/register" className="btn-primary">{t("landing.signup")}</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-24 text-center">
          <span className="badge-indigo mb-6 text-sm"><Sparkles className="h-4 w-4" /> {t("landing.badge")}</span>
          <h1 className="mx-auto max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
            {t("landing.hero.title1")} <span className="text-brand-600">{t("landing.hero.title2")}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
            {t("landing.hero.sub")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">{cta}</div>
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { icon: Brain, label: "landing.f1" },
              { icon: Target, label: "landing.f2" },
              { icon: MessagesSquare, label: "landing.f3" },
              { icon: TrendingUp, label: "landing.f4" },
            ].map((f) => (
              <div key={f.label} className="card flex flex-col items-center gap-2 py-5">
                <f.icon className="h-6 w-6 text-brand-500" />
                <span className="text-sm font-semibold">{t(f.label)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="border-y border-slate-200 bg-slate-50 py-16 dark:border-slate-700 dark:bg-slate-800/40">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-semibold">{t("landing.how.title")}</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-slate-600 dark:text-slate-300">
            {t("landing.how.sub")}
          </p>
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { step: "01", title: "landing.how.step1t", desc: "landing.how.step1d" },
              { step: "02", title: "landing.how.step2t", desc: "landing.how.step2d" },
              { step: "03", title: "landing.how.step3t", desc: "landing.how.step3d" },
            ].map((s) => (
              <div key={s.step} className="card">
                <span className="text-3xl font-extrabold text-brand-500/40">{s.step}</span>
                <h3 className="mt-2 text-lg font-semibold">{t(s.title)}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t(s.desc)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-3xl font-semibold">{t("landing.feat.title")}</h2>
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: PenLine, title: "landing.feat1t", desc: "landing.feat1d" },
              { icon: Target, title: "landing.feat2t", desc: "landing.feat2d" },
              { icon: MessagesSquare, title: "landing.feat3t", desc: "landing.feat3d" },
              { icon: BookOpen, title: "landing.feat4t", desc: "landing.feat4d" },
              { icon: Brain, title: "landing.feat5t", desc: "landing.feat5d" },
              { icon: TrendingUp, title: "landing.feat6t", desc: "landing.feat6d" },
            ].map((f) => (
              <div key={f.title} className="card hover:border-brand-400/50 hover:shadow-md transition-all">
                <div className="rounded-xl bg-brand-500/10 p-3 text-brand-600 dark:text-brand-300 w-fit">
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-3 text-lg font-semibold">{t(f.title)}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t(f.desc)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-brand-600 py-16 text-white dark:border-slate-700">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-3xl font-semibold">{t("landing.cta.title")}</h2>
          <p className="mx-auto mt-3 max-w-2xl text-white/80">
            {t("landing.cta.sub")}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm font-medium">
            {["landing.cta.i1", "landing.cta.i2", "landing.cta.i3", "landing.cta.i4"].map((i) => (
              <span key={i} className="flex items-center gap-2"><Check className="h-4 w-4" /> {t(i)}</span>
            ))}
          </div>
          <div className="mt-8">{cta}</div>
        </div>
      </section>

      <section id="faq" className="py-16">
        <div className="mx-auto max-w-3xl px-4">
          <h2 className="text-center text-3xl font-semibold">{t("landing.nav.faq")}</h2>
          <div className="mt-8 space-y-3">
            {[
              { q: "landing.faq1q", a: "landing.faq1a" },
              { q: "landing.faq2q", a: "landing.faq2a" },
              { q: "landing.faq3q", a: "landing.faq3a" },
              { q: "landing.faq4q", a: "landing.faq4a" },
              { q: "landing.faq5q", a: "landing.faq5a" },
            ].map((f) => (
              <FaqItem key={f.q} q={t(f.q)} a={t(f.a)} />
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 dark:border-slate-700">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-white">
              <PenLine className="h-4 w-4" />
            </div>
            <span className="font-semibold">Language Detective</span>
          </div>
          <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            <ShieldCheck className="h-4 w-4" /> {t("landing.footer")}
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