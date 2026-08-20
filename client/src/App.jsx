import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "./store/authStore.js";
import { useThemeStore } from "./store/themeStore.js";
import Spinner from "./components/Spinner.jsx";

import AppLayout from "./layouts/AppLayout.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import PlacementTest from "./pages/PlacementTest.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Writing from "./pages/Writing.jsx";
import Mistakes from "./pages/Mistakes.jsx";
import Practice from "./pages/Practice.jsx";
import Chat from "./pages/Chat.jsx";
import Speaking from "./pages/Speaking.jsx";
import Vocabulary from "./pages/Vocabulary.jsx";
import Progress from "./pages/Progress.jsx";
import Achievements from "./pages/Achievements.jsx";
import Profile from "./pages/Profile.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";

function Protected({ children }) {
  const { user, loading } = useAuthStore();
  const location = useLocation();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-brand-600 dark:bg-slate-900">
        <Spinner size={36} />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

function AdminOnly({ children }) {
  const { user } = useAuthStore();
  if (user?.role !== "ADMIN") return <Navigate to="/app" replace />;
  return children;
}

function PublicOnly({ children }) {
  const { user, loading } = useAuthStore();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-brand-600 dark:bg-slate-900">
        <Spinner size={36} />
      </div>
    );
  }
  if (user) return <Navigate to="/app" replace />;
  return children;
}

export default function App() {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    bootstrap();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
      <Route path="/onboarding" element={<Protected><Onboarding /></Protected>} />
      <Route path="/placement-test" element={<Protected><PlacementTest /></Protected>} />

      <Route path="/app" element={<Protected><AppLayout /></Protected>}>
        <Route index element={<Dashboard />} />
        <Route path="writing" element={<Writing />} />
        <Route path="mistakes" element={<Mistakes />} />
        <Route path="practice" element={<Practice />} />
        <Route path="chat" element={<Chat />} />
        <Route path="speaking" element={<Speaking />} />
        <Route path="vocabulary" element={<Vocabulary />} />
        <Route path="progress" element={<Progress />} />
        <Route path="achievements" element={<Achievements />} />
        <Route path="profile" element={<Profile />} />
        <Route path="admin" element={<AdminOnly><AdminPanel /></AdminOnly>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}