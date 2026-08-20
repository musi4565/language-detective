import { getText } from "./translations.js";
import { useLangStore } from "../store/langStore.js";

export function useT() {
  const lang = useLangStore((s) => s.lang);
  return (key, vars) => getText(lang, key, vars);
}

export function useLang() {
  return useLangStore((s) => s.lang);
}