import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  PenLine,
  Dumbbell,
  MessagesSquare,
  Mic,
  BookOpen,
  AlertTriangle,
  TrendingUp,
  Trophy,
  User,
  Shield,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../store/authStore.js";
import { useThemeStore } from "../store/themeStore.js";
import Toasts from "../components/Toasts.jsx";
import { toast } from "../store/toastStore.js";

const navItems = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/writing", label: "Writing Detective", icon: PenLine },
  { to: "/app/practice", label: "Practice", icon: Dumbbell },
  { to: "/app/chat", label: "AI Chat", icon: MessagesSquare },
  { to: "/app/speaking", label: "Speaking", icon: Mic },
  { to: "/app/vocabulary", label: "Vocabulary", icon: BookOpen },
  { to: "/app/mistakes", label: "Mistakes", icon: AlertTriangle },
  { to: "/app/progress", label: "Progress", icon: TrendingUp },
  { to: "/app/achievements", label: "Achievements", icon: Trophy },
  { to: "/app/profile", label: "Profile", icon: User },
];

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const { theme, toggle } = useThemeStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const handleLogout = () => {
    logout();
    toast.info("Logged out");
    navigate("/login");
  };

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-600 text-white">
          <PenLine className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight">Language Detective</p>
          <p className="text-[11px] text-slate-400">AI language coach</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-600/10 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`
            }
          >
            <item.icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
            {item.label}
          </NavLink>
        ))}
        {user?.role === "ADMIN" && (
          <NavLink
            to="/app/admin"
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-600/10 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`
            }
          >
            <Shield className="h-[18px] w-[18px]" />
            Admin Panel
          </NavLink>
        )}
      </nav>

      <div className="border-t border-slate-200 p-4 dark:border-slate-700">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-violet-600 text-sm font-bold text-white">
            {user?.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user?.name}</p>
            <p className="truncate text-[11px] text-slate-400">
              {user?.level} · {user?.xp} XP
            </p>
          </div>
          <button onClick={handleLogout} title="Logout" className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-red-500 dark:hover:bg-slate-700">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={toggle}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 lg:block">
        {sidebar}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-2xl dark:bg-slate-800 animate-fade-in">
            <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-3 rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80 lg:px-8">
          <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden">
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden items-center gap-2 text-sm text-slate-400 lg:flex">
            <span className="badge-indigo">{user?.level || "—"}</span>
            <span>Learning: {user?.learningLanguage}</span>
          </div>
          <div className="flex items-center gap-3 text-sm font-semibold">
            <span className="badge-amber">🔥 {user?.streak || 0} day streak</span>
            <span className="badge-indigo">⚡ {user?.xp || 0} XP</span>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
      <Toasts />
    </div>
  );
}