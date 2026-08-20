import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PenLine, Mail, Lock, User, ArrowRight, Languages, BookOpen } from "lucide-react";
import { useAuthStore } from "../store/authStore.js";
import { apiErrorMessage } from "../api/client.js";
import { toast } from "../store/toastStore.js";
import Spinner from "../components/Spinner.jsx";
import { useT } from "../i18n/index.js";

const LANGUAGES = ["English", "Russian", "Uzbek", "Spanish", "French", "German", "Arabic", "Chinese", "Turkish", "Italian", "Korean", "Japanese"];

export default function Register() {
  const { register } = useAuthStore();
  const navigate = useNavigate();
  const t = useT();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    nativeLanguage: "Uzbek",
    learningLanguage: "English",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      toast.success(t("auth.accountCreated"));
      navigate("/onboarding");
    } catch (err) {
      setError(apiErrorMessage(err, t("auth.registrationFailed")));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-600 via-brand-700 to-violet-800 p-4 py-10">
      <div className="w-full max-w-lg">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <PenLine className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold">Language Detective</span>
        </Link>
        <div className="rounded-2xl bg-white p-8 shadow-2xl dark:bg-slate-800">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("auth.createAccount")}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t("auth.createSub")}</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="label">{t("auth.name")}</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input type="text" className="input pl-10" placeholder={t("auth.yourName")} value={form.name} onChange={set("name")} required />
              </div>
            </div>
            <div>
              <label className="label">{t("auth.email")}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input type="email" className="input pl-10" placeholder="you@example.com" value={form.email} onChange={set("email")} required />
              </div>
            </div>
            <div>
              <label className="label">{t("auth.password")}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input type="password" className="input pl-10" placeholder={t("auth.passwordMin")} value={form.password} onChange={set("password")} minLength={6} required />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="label">{t("auth.nativeLanguage")}</label>
                <div className="relative">
                  <Languages className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <select className="input pl-10" value={form.nativeLanguage} onChange={set("nativeLanguage")}>
                    {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">{t("auth.learningLanguage")}</label>
                <div className="relative">
                  <BookOpen className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <select className="input pl-10" value={form.learningLanguage} onChange={set("learningLanguage")}>
                    {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Spinner size={16} /> : <><span>{t("auth.createBtn")}</span><ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            {t("auth.haveAccount")}{" "}
            <Link to="/login" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
              {t("auth.login")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}