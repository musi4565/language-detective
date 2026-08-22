import { create } from "zustand";

export const useLangStore = create((set) => ({
  lang: localStorage.getItem("ld_ui_lang") || "uz",
  setLang: (lang) => {
    localStorage.setItem("ld_ui_lang", lang);
    set({ lang });
  },
}));