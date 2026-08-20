import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { PenLine, Mail, Lock, ArrowRight } from "lucide-react";
import { useAuthStore } from "../store/authStore.js";
import { apiErrorMessage } from "../api/client.js";
import { toast } from "../store/toastStore.js";
import Spinner from "../components/Spinner.jsx";
import { useT } from "../i18n/index.js";

export default function Login() {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const t = useT();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(t("auth.welcomeBackToast", { name: user.name }));
      navigate(location.state?.from?.pathname || "/app");
    } catch (err) {
      setError(apiErrorMessage(err, t("auth.loginFailed")));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-600 via-brand-700 to-violet-800 p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <PenLine className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold">Language Detective</span>
        </Link>
        <div className="rounded-2xl bg-white p-8 shadow-2xl dark:bg-slate-800">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("auth.welcomeBack")}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t("auth.loginSub")}</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="label">{t("auth.email")}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input type="email" className="input pl-10" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <div>
              <label className="label">{t("auth.password")}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input type="password" className="input pl-10" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? <Spinner size={16} /> : <><span>{t("auth.login")}</span><ArrowRight className="h-4 w-4" /></>}
            </button>
          </form>

          <div className="mt-6 rounded-xl bg-slate-100 p-4 text-sm dark:bg-slate-700/50">
            <p className="font-medium text-slate-700 dark:text-slate-200">{t("auth.demoAccounts")}</p>
            <p className="mt-1 text-slate-500 dark:text-slate-400">User: demo@languagedetective.app / demo1234</p>
            <p className="text-slate-500 dark:text-slate-400">Admin: admin@languagedetective.app / Admin@123</p>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            {t("auth.noAccount")}{" "}
            <Link to="/register" className="font-semibold text-brand-600 hover:underline dark:text-brand-400">
              {t("auth.signup")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}