import { create } from "zustand";

const initial = localStorage.getItem("ld_theme") || "dark";

export const useThemeStore = create((set) => ({
  theme: initial,
  toggle: () =>
    set((s) => {
      const next = s.theme === "dark" ? "light" : "dark";
      localStorage.setItem("ld_theme", next);
      return { theme: next };
    }),
}));