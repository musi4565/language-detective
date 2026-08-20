import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Languages, BookOpen, Gauge, ArrowRight, ClipboardCheck } from "lucide-react";
import api from "../api/client.js";
import { useAuthStore } from "../store/authStore.js";
import { apiErrorMessage } from "../api/client.js";
import { toast } from "../store/toastStore.js";
import Spinner from "../components/Spinner.jsx";
import { useT } from "../i18n/index.js";

const LANGUAGES = ["English", "Russian", "Uzbek", "Spanish", "French", "German", "Arabic", "Chinese", "Turkish", "Italian", "Korean", "Japanese"];
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const t = useT();
  const [nativeLanguage, setNativeLanguage] = useState(user?.nativeLanguage || "Uzbek");
  const [learningLanguage, setLearningLanguage] = useState(user?.learningLanguage || "English");
  const [level, setLevel] = useState("");
  const [loading, setLoading] = useState(false);

  const complete = async (selectedLevel) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/onboarding", {
        nativeLanguage,
        learningLanguage,
        level: selectedLevel,
      });
      setUser(data.data.user);
      toast.success(t("auth.setupComplete"));
      navigate("/app");
    } catch (err) {
      toast.error(apiErrorMessage(err, t("auth.saveFailed")));
      setLoading(false);
    }
  };

  const step = (icon, title, desc) => (
    <div className="flex items-start gap-3">
      <div className="rounded-xl bg-brand-100 p-2.5 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">{icon}</div>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{desc}</p>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-600 via-brand-700 to-violet-800 p-4 py-10">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl dark:bg-slate-800">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("auth.onboardingTitle")}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t("auth.onboardingSub")}
        </p>

        <div className="mt-6 space-y-5">
          <div>
            <label className="label flex items-center gap-2"><Languages className="h-4 w-4" /> {t("auth.nativeLanguage")}</label>
            <select className="input" value={nativeLanguage} onChange={(e) => setNativeLanguage(e.target.value)}>
              {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="label flex items-center gap-2"><BookOpen className="h-4 w-4" /> {t("auth.learningLanguage")}</label>
            <select className="input" value={learningLanguage} onChange={(e) => setLearningLanguage(e.target.value)}>
              {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>

          <div>
            <label className="label flex items-center gap-2"><Gauge className="h-4 w-4" /> {t("auth.yourLevel")}</label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLevel(l)}
                  className={`rounded-xl border py-2.5 text-sm font-bold transition-colors ${
                    level === l
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-slate-300 text-slate-600 hover:border-brand-400 dark:border-slate-600 dark:text-slate-300"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <button onClick={() => level && complete(level)} disabled={!level || loading} className="btn-primary w-full">
            {loading ? <Spinner size={16} /> : <><span>{t("auth.startLearning")}</span><ArrowRight className="h-4 w-4" /></>}
          </button>

          <div className="relative py-2 text-center">
            <span className="relative z-10 bg-white px-3 text-xs font-medium text-slate-400 dark:bg-slate-800">{t("auth.or")}</span>
            <div className="absolute inset-x-0 top-1/2 h-px bg-slate-200 dark:bg-slate-700" />
          </div>

          <button
            onClick={() => navigate("/placement-test")}
            className="btn-outline w-full"
          >
            <ClipboardCheck className="h-4 w-4" /> {t("auth.placementRecommended")}
          </button>
        </div>

        <div className="mt-6 space-y-4 rounded-xl bg-slate-100 p-4 dark:bg-slate-700/50">
          {step(<Languages className="h-5 w-5" />, t("auth.step1t"), t("auth.step1d"))}
          {step(<Gauge className="h-5 w-5" />, t("auth.step2t"), t("auth.step2d"))}
          {step(<ClipboardCheck className="h-5 w-5" />, t("auth.step3t"), t("auth.step3d"))}
        </div>
      </div>
    </div>
  );
}