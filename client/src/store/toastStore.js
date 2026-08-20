import { create } from "zustand";

let toastId = 0;

export const useToastStore = create((set) => ({
  toasts: [],
  show: (message, type = "success") => {
    const id = ++toastId;
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4000);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export const toast = {
  success: (m) => useToastStore.getState().show(m, "success"),
  error: (m) => useToastStore.getState().show(m, "error"),
  info: (m) => useToastStore.getState().show(m, "info"),
};