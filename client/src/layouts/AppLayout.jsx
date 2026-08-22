import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
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
  Flame,
  Zap,
} from "lucide-react";
import { useAuthStore } from "../store/authStore.js";
import { useThemeStore } from "../store/themeStore.js";
import Toasts from "../components/Toasts.jsx";
import { toast } from "../store/toastStore.js";
import LanguageSwitcher from "../components/LanguageSwitcher.jsx";
import { useT } from "../i18n/index.js";

const navItems = [
  { to: "/app", label: "common.dashboard", icon: LayoutDashboard, end: true },
  { to: "/app/writing", label: "nav.writing", icon: PenLine },
  { to: "/app/practice", label: "nav.practice", icon: Dumbbell },
  { to: "/app/chat", label: "nav.chat", icon: MessagesSquare },
  { to: "/app/speaking", label: "nav.speaking", icon: Mic },
  { to: "/app/vocabulary", label: "nav.vocabulary", icon: BookOpen },
  { to: "/app/mistakes", label: "nav.mistakes", icon: AlertTriangle },
  { to: "/app/progress", label: "nav.progress", icon: TrendingUp },
  { to: "/app/achievements", label: "nav.achievements", icon: Trophy },
  { to: "/app/profile", label: "nav.profile", icon: User },
];

function usePageTitle(t) {
  const { pathname } = useLocation();
  if (pathname === "/app/admin") return t("nav.admin");
  const match = [...navItems].reverse().find((item) =>
    item.end ? pathname === item.to : pathname.startsWith(item.to)
  );
  return match ? t(match.label) : t("common.dashboard");
}

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const { theme, toggle } = useThemeStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const t = useT();
  const pageTitle = usePageTitle(t);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const handleLogout = () => {
    logout();
    toast.info(t("common.logout"));
    navigate("/login");
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
      isActive
        ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
    }`;

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
          <PenLine className="h-4 w-4" />
        </div>
        <p className="truncate text-sm font-semibold tracking-tight">Language Detective</p>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setMobileOpen(false)} className={navLinkClass}>
            <item.icon className="h-[18px] w-[18px] shrink-0" />
            {t(item.label)}
          </NavLink>
        ))}
        {user?.role === "ADMIN" && (
          <NavLink to="/app/admin" onClick={() => setMobileOpen(false)} className={navLinkClass}>
            <Shield className="h-[18px] w-[18px] shrink-0" />
            {t("nav.admin")}
          </NavLink>
        )}
      </nav>

      <div className="border-t border-slate-200 p-3 dark:border-slate-700/80">
        <NavLink to="/app/profile" onClick={() => setMobileOpen(false)} className="mb-2 flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-slate-100 dark:hover:bg-slate-800">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-200">
            {user?.avatar ? <img src={user.avatar} alt="" className="h-full w-full object-cover" /> : (user?.name?.charAt(0)?.toUpperCase() || "?")}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="truncate text-xs text-slate-400">{user?.level || "—"} · {user?.xp || 0} XP</p>
          </div>
        </NavLink>
        <div className="flex gap-1.5">
          <button
            onClick={toggle}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            {theme === "dark" ? t("common.lightMode") : t("common.darkMode")}
          </button>
          <button
            onClick={handleLogout}
            title={t("common.logout")}
            className="flex items-center justify-center rounded-lg px-3 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-ink-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-slate-200 bg-white dark:border-slate-700/80 dark:bg-slate-800 lg:block">
        {sidebar}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-elevated dark:bg-slate-800 animate-slide-up">
            <button onClick={() => setMobileOpen(false)} className="absolute right-3 top-4 rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
              <X className="h-5 w-5" />
            </button>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-slate-200 bg-white/85 px-4 backdrop-blur dark:border-slate-700/80 dark:bg-slate-900/85 lg:px-8">
          <div className="flex min-w-0 items-center gap-2">
            <button onClick={() => setMobileOpen(true)} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden">
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200 lg:text-base">{pageTitle}</h1>
          </div>
          <div className="flex shrink-0 items-center gap-2 text-sm">
            <span className="hidden items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400 sm:flex">
              <Flame className="h-3.5 w-3.5 text-amber-500" /> {user?.streak || 0}
            </span>
            <span className="hidden items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400 sm:flex">
              <Zap className="h-3.5 w-3.5 text-brand-500" /> {user?.xp || 0}
            </span>
            <LanguageSwitcher />
            <NavLink to="/app/profile" className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-xs font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-200">
              {user?.avatar ? <img src={user.avatar} alt="" className="h-full w-full object-cover" /> : (user?.name?.charAt(0)?.toUpperCase() || "?")}
            </NavLink>
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
