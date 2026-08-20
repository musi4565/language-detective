import { useState, useEffect, useRef } from "react";
import { Send, MessageSquare, Plus, Bot, User as UserIcon, Info, Trash2 } from "lucide-react";
import api from "../api/client.js";
import { apiErrorMessage } from "../api/client.js";
import { toast } from "../store/toastStore.js";
import Spinner from "../components/Spinner.jsx";
import { useAuthStore } from "../store/authStore.js";
import { useT } from "../i18n/index.js";

export default function Chat() {
  const { user } = useAuthStore();
  const t = useT();
  const [sessions, setSessions] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [corrections, setCorrections] = useState([]);
  const bottomRef = useRef(null);

  const loadSessions = async () => {
    try {
      const { data } = await api.get("/chat/sessions");
      setSessions(data.data.sessions);
      if (!activeId && data.data.sessions.length > 0) openSession(data.data.sessions[0].id);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  useEffect(() => { loadSessions(); }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const openSession = async (id) => {
    setActiveId(id);
    setCorrections([]);
    setLoading(true);
    try {
      const { data } = await api.get(`/chat/session/${id}`);
      setMessages(data.data.session.messages);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const newSession = async () => {
    try {
      const { data } = await api.post("/chat/session", { title: t("chat.newConversation") });
      await loadSessions();
      openSession(data.data.session.id);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  const send = async (e) => {
    e.preventDefault();
    const message = input.trim();
    if (!message || !activeId) return;
    setInput("");
    setSending(true);
    setMessages((m) => [...m, { id: "temp", role: "USER", content: message, createdAt: new Date() }]);
    try {
      const { data } = await api.post("/chat/message", { sessionId: activeId, message });
      setMessages((m) => [...m.filter((x) => x.id !== "temp"), data.data.userMessage, data.data.aiMessage]);
      setCorrections(data.data.corrections);
    } catch (err) {
      toast.error(apiErrorMessage(err));
      setMessages((m) => m.filter((x) => x.id !== "temp"));
    } finally {
      setSending(false);
    }
  };

  const deleteSession = async (id) => {
    try {
      await api.delete(`/chat/session/${id}`);
      setSessions((s) => s.filter((x) => x.id !== id));
      if (activeId === id) {
        setActiveId(null);
        setMessages([]);
        setCorrections([]);
        if (sessions.length > 1) openSession(sessions.find((s) => s.id !== id).id);
      }
      toast.info(t("chat.deleted"));
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col gap-4 lg:flex-row">
      <aside className="w-full shrink-0 lg:w-56">
        <button onClick={newSession} className="btn-primary w-full mb-3"><Plus className="h-4 w-4" /> {t("chat.newConversation")}</button>
        <div className="space-y-1 overflow-y-auto">
          {sessions.map((s) => (
            <div
              key={s.id}
              className={`group flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                activeId === s.id
                  ? "bg-brand-600/10 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
              onClick={() => openSession(s.id)}
            >
              <MessageSquare className="h-4 w-4 shrink-0" />
              <span className="min-w-0 flex-1 truncate">{s.title}</span>
              <button
                onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                className="hidden shrink-0 text-slate-400 hover:text-red-500 group-hover:block"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {!activeId && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <div className="rounded-2xl bg-brand-100 p-4 text-brand-600 dark:bg-brand-900/40 dark:text-brand-300">
                <Bot className="h-8 w-8" />
              </div>
              <p className="font-semibold">{t("chat.practiceIn", { lang: user?.learningLanguage || "English" })}</p>
              <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
                {t("chat.desc")}
              </p>
              <button onClick={newSession} className="btn-primary mt-2"><Plus className="h-4 w-4" /> {t("chat.start")}</button>
            </div>
          )}

          {activeId && loading && (
            <div className="flex justify-center py-10 text-brand-600"><Spinner size={24} /></div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "USER" ? "justify-end" : "justify-start"}`}>
              <div className={`flex max-w-[85%] gap-2 ${m.role === "USER" ? "flex-row-reverse" : ""}`}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${m.role === "USER" ? "bg-brand-600 text-white" : "bg-violet-600 text-white"}`}>
                  {m.role === "USER" ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>
                <div className={`rounded-2xl px-4 py-2.5 text-sm ${m.role === "USER" ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-100"}`}>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  {m.role === "ASSISTANT" && m.corrections && Array.isArray(m.corrections) && m.corrections.length > 0 && (
                    <div className="mt-2 border-t border-slate-300/40 pt-2 dark:border-slate-600/40">
                      {m.corrections.map((c, i) => (
                        <p key={i} className="text-xs text-slate-500 dark:text-slate-300">
                          {t("chat.correction")} <span className="line-through text-red-400">{c.original}</span> → <span className="font-medium text-emerald-500">{c.correction}</span>
                          {c.explanation && <span className="text-slate-400"> ({c.explanation})</span>}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-2.5 text-sm text-slate-400 dark:bg-slate-700">
                <Spinner size={14} /> {t("chat.thinking")}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {corrections.length > 0 && (
          <div className="mx-4 mb-2 rounded-xl border border-amber-400/30 bg-amber-500/10 p-3">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
              <Info className="h-3.5 w-3.5" /> {t("chat.detected")}
            </p>
            {corrections.map((c, i) => (
              <p key={i} className="text-xs text-slate-600 dark:text-slate-300">
                <span className="line-through text-red-400">{c.originalText}</span> → <span className="font-medium text-emerald-600 dark:text-emerald-400">{c.correctedText}</span> — {c.explanation}
              </p>
            ))}
          </div>
        )}

        <form onSubmit={send} className="flex gap-2 border-t border-slate-200 p-3 dark:border-slate-700">
          <input
            className="input"
            placeholder={t("chat.typeMessage")}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!activeId || sending}
          />
          <button type="submit" disabled={!input.trim() || !activeId || sending} className="btn-primary shrink-0">
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}