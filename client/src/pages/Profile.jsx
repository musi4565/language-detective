import { useState } from "react";
import { User, Mail, BookOpen, Languages, KeyRound, Camera, Zap, Flame } from "lucide-react";
import api from "../api/client.js";
import { useAuthStore } from "../store/authStore.js";
import { apiErrorMessage } from "../api/client.js";
import { toast } from "../store/toastStore.js";
import Spinner from "../components/Spinner.jsx";
import { useT } from "../i18n/index.js";

const LANGUAGES = ["English", "Russian", "Uzbek", "Spanish", "French", "German", "Arabic", "Chinese", "Turkish", "Italian", "Korean", "Japanese"];
const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];
const AVATARS = [
  "https://api.dicebear.com/9.x/avataaars/svg?seed=A",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=B",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=C",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=D",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=E",
  "https://api.dicebear.com/9.x/avataaars/svg?seed=F",
];

export default function Profile() {
  const { user, setUser } = useAuthStore();
  const t = useT();
  const [form, setForm] = useState({
    name: user?.name || "",
    nativeLanguage: user?.nativeLanguage || "English",
    learningLanguage: user?.learningLanguage || "English",
    level: user?.level || "A1",
  });
  const [saving, setSaving] = useState(false);
  const [passForm, setPassForm] = useState({ currentPassword: "", newPassword: "" });
  const [savingPass, setSavingPass] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.patch("/auth/profile", form);
      setUser(data.data.user);
      toast.success(t("prof.updated"));
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const setAvatar = async (avatar) => {
    try {
      const { data } = await api.patch("/auth/profile", { avatar });
      setUser(data.data.user);
      toast.success(t("prof.avatarUpdated"));
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setSavingPass(true);
    try {
      await api.post("/auth/change-password", passForm);
      setPassForm({ currentPassword: "", newPassword: "" });
      toast.success(t("prof.passwordChanged"));
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSavingPass(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold sm:text-2xl">{t("prof.title")}</h1>

      <div className="card">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-brand-600 text-2xl font-semibold text-white">
              {user.avatar ? <img src={user.avatar} alt="avatar" className="h-full w-full" /> : user.name.charAt(0).toUpperCase()}
            </div>
            <button className="btn-outline px-3 py-1.5 text-xs"><Camera className="h-3.5 w-3.5" /> {t("prof.change")}</button>
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">{user.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="badge-indigo">{t("common.level")} {user.level}</span>
              <span className="badge-amber"><Zap className="h-3 w-3" /> {user.xp} XP</span>
              <span className="badge-green"><Flame className="h-3 w-3" /> {user.streak} {t("common.dayStreak")}</span>
              <span className="badge-slate">{user.role}</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {AVATARS.map((a) => (
                <button key={a} onClick={() => setAvatar(a)} className={`overflow-hidden rounded-full border-2 transition-colors duration-200 ${user.avatar === a ? "border-brand-500" : "border-transparent hover:border-brand-300"}`}>
                  <img src={a} alt="avatar option" className="h-10 w-10" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <form onSubmit={saveProfile} className="card space-y-4">
          <h3 className="font-semibold">{t("prof.learningSettings")}</h3>
          <div>
            <label className="label flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {t("auth.name")}</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label flex items-center gap-1.5"><Languages className="h-3.5 w-3.5" /> {t("auth.nativeLanguage")}</label>
              <select className="input" value={form.nativeLanguage} onChange={(e) => setForm({ ...form, nativeLanguage: e.target.value })}>
                {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="label flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" /> {t("prof.learning")}</label>
              <select className="input" value={form.learningLanguage} onChange={(e) => setForm({ ...form, learningLanguage: e.target.value })}>
                {LANGUAGES.map((l) => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">{t("common.level")}</label>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setForm({ ...form, level: l })}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-semibold ${form.level === l ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 dark:border-slate-600"}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? <Spinner size={16} /> : t("prof.saveChanges")}</button>
        </form>

        <form onSubmit={changePassword} className="card space-y-4">
          <h3 className="font-semibold flex items-center gap-2"><KeyRound className="h-4 w-4" /> {t("prof.changePassword")}</h3>
          <div>
            <label className="label">{t("prof.currentPassword")}</label>
            <input type="password" className="input" value={passForm.currentPassword} onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })} required />
          </div>
          <div>
            <label className="label">{t("prof.newPassword")}</label>
            <input type="password" className="input" minLength={6} value={passForm.newPassword} onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })} required />
          </div>
          <button type="submit" disabled={savingPass} className="btn-secondary">{savingPass ? <Spinner size={16} /> : t("prof.updatePassword")}</button>
        </form>
      </div>
    </div>
  );
}