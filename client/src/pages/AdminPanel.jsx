import { useState, useEffect, useCallback } from "react";
import { Users, BarChart3, Languages as LanguagesIcon, Search, Ban, CheckCircle2, ShieldCheck } from "lucide-react";
import api from "../api/client.js";
import { apiErrorMessage } from "../api/client.js";
import { toast } from "../store/toastStore.js";
import Spinner from "../components/Spinner.jsx";
import ErrorState from "../components/ErrorState.jsx";
import Modal from "../components/Modal.jsx";
import { useT } from "../i18n/index.js";

export default function AdminPanel() {
  const t = useT();
  const [tab, setTab] = useState("analytics");
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [langModal, setLangModal] = useState(false);
  const [langForm, setLangForm] = useState({ code: "", name: "", flag: "" });

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/admin/analytics");
      setAnalytics(data.data);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadUsers = useCallback(async (q = "") => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (q) params.set("search", q);
      const { data } = await api.get(`/admin/users?${params}&limit=50`);
      setUsers(data.data.users);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLanguages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/admin/languages");
      setLanguages(data.data.languages);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "analytics") loadAnalytics();
    if (tab === "users") loadUsers();
    if (tab === "languages") loadLanguages();
  }, [tab]);

  const toggleBlock = async (id) => {
    try {
      const { data } = await api.post(`/admin/users/${id}/block`);
      toast.info(data.data.user.blocked ? t("admin.userBlocked") : t("admin.userUnblocked"));
      loadUsers(search);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const addLanguage = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/languages", langForm);
      toast.success(t("admin.languageAdded"));
      setLangModal(false);
      setLangForm({ code: "", name: "", flag: "" });
      loadLanguages();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const removeLanguage = async (id) => {
    try {
      await api.delete(`/admin/languages/${id}`);
      toast.info(t("admin.languageDeleted"));
      loadLanguages();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const tabs = [
    { id: "analytics", label: t("admin.analytics"), icon: BarChart3 },
    { id: "users", label: t("admin.users"), icon: Users },
    { id: "languages", label: t("admin.languages"), icon: LanguagesIcon },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold sm:text-2xl"><ShieldCheck className="h-6 w-6 text-brand-500" /> {t("admin.title")}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t("admin.sub")}</p>
        </div>
        <div className="flex gap-2">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`btn ${tab === t.id ? "btn-primary" : "btn-outline"}`}>
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>
      </div>

      {error ? <ErrorState message={error} onRetry={() => setTab(tab)} /> : loading ? (
        <div className="flex justify-center py-16 text-brand-600"><Spinner size={28} /></div>
      ) : tab === "analytics" && analytics ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <AdminStat label={t("admin.statUsers")} value={analytics.totalUsers} />
            <AdminStat label={t("admin.statActive")} value={analytics.activeUsers} />
            <AdminStat label={t("admin.statAnalyses")} value={analytics.totalAnalyses} />
            <AdminStat label={t("admin.statExercises")} value={analytics.totalExercises} />
            <AdminStat label={t("admin.statMistakes")} value={analytics.totalMistakes} />
            <AdminStat label={t("admin.statChats")} value={analytics.totalChats} />
            <AdminStat label={t("admin.statSpeaking")} value={analytics.totalSpeaking} />
            <AdminStat label={t("admin.statAttempts")} value={analytics.totalAttempts} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="card">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t("admin.popularLanguages")}</h3>
              <div className="space-y-2">
                {analytics.popularLanguages.map((l) => (
                  <div key={l.language} className="flex items-center gap-3 text-sm">
                    <span className="flex-1 font-medium">{l.language}</span>
                    <span className="badge-indigo">{l.count} {t("admin.users")}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t("mist.mostCommon")}</h3>
              <div className="space-y-2">
                {analytics.commonMistakes.map((m, i) => (
                  <div key={m.topic} className="flex items-center gap-3 text-sm">
                    <span className="w-6 font-semibold text-slate-400">{i + 1}</span>
                    <span className="flex-1 font-medium">{m.topic}</span>
                    <span className="badge-red">{m.count}×</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : tab === "users" ? (
        <div className="space-y-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              className="input pl-10"
              placeholder={t("admin.searchPh")}
              value={search}
              onChange={(e) => { setSearch(e.target.value); loadUsers(e.target.value); }}
            />
          </div>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">{t("admin.thUser")}</th>
                  <th className="px-4 py-3">{t("common.level")}</th>
                  <th className="px-4 py-3">XP</th>
                  <th className="px-4 py-3">{t("mist.total")}</th>
                  <th className="px-4 py-3">{t("dash.analyses")}</th>
                  <th className="px-4 py-3">{t("admin.thRole")}</th>
                  <th className="px-4 py-3">{t("admin.thStatus")}</th>
                  <th className="px-4 py-3">{t("admin.thAction")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3">
                      <p className="font-semibold">{u.name}</p>
                      <p className="text-xs text-slate-400">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">{u.level || "—"}</td>
                    <td className="px-4 py-3">{u.xp}</td>
                    <td className="px-4 py-3">{u._count.mistakes}</td>
                    <td className="px-4 py-3">{u._count.writingSubmissions}</td>
                    <td className="px-4 py-3"><span className={`badge ${u.role === "ADMIN" ? "badge-indigo" : "badge-slate"}`}>{u.role}</span></td>
                    <td className="px-4 py-3">
                      {u.blocked ? <span className="badge-red">{t("admin.blocked")}</span> : <span className="badge-green">{t("admin.active")}</span>}
                    </td>
                    <td className="px-4 py-3">
                      {u.role !== "ADMIN" && (
                        <button onClick={() => toggleBlock(u.id)} className="btn-outline px-3 py-1.5 text-xs">
                          {u.blocked ? <><CheckCircle2 className="h-3.5 w-3.5" /> {t("admin.unblock")}</> : <><Ban className="h-3.5 w-3.5" /> {t("admin.block")}</>}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : tab === "languages" ? (
        <div className="space-y-4">
          <button onClick={() => setLangModal(true)} className="btn-primary"><LanguagesIcon className="h-4 w-4" /> {t("admin.addLanguage")}</button>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {languages.map((l) => (
              <div key={l.id} className="card flex items-center gap-3">
                <span className="text-2xl">{l.flag || "🏳️"}</span>
                <div className="flex-1">
                  <p className="font-semibold">{l.name}</p>
                  <p className="text-xs text-slate-400">{l.code}</p>
                </div>
                <button onClick={() => removeLanguage(l.id)} className="btn-outline px-3 py-1.5 text-xs text-red-500 hover:border-red-400">{t("common.delete")}</button>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <Modal open={langModal} onClose={() => setLangModal(false)} title={t("admin.addLanguage")}>
        <form onSubmit={addLanguage} className="space-y-4">
          <div>
            <label className="label">Code</label>
            <input className="input" placeholder="e.g. it" value={langForm.code} onChange={(e) => setLangForm({ ...langForm, code: e.target.value })} required />
          </div>
          <div>
            <label className="label">{t("auth.name")}</label>
            <input className="input" placeholder="e.g. Italian" value={langForm.name} onChange={(e) => setLangForm({ ...langForm, name: e.target.value })} required />
          </div>
          <div>
            <label className="label">{t("admin.flagEmoji")}</label>
            <input className="input" placeholder="🇮🇹" value={langForm.flag} onChange={(e) => setLangForm({ ...langForm, flag: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary w-full">{t("admin.addLanguage")}</button>
        </form>
      </Modal>
    </div>
  );
}

function AdminStat({ label, value }) {
  return (
    <div className="card">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}