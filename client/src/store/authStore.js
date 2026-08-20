import { create } from "zustand";
import api from "../api/client.js";

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem("ld_token") || null,
  loading: true,

  setAuth: (token, user) => {
    localStorage.setItem("ld_token", token);
    if (user) localStorage.setItem("ld_user", JSON.stringify(user));
    set({ token, user, loading: false });
  },

  setUser: (user) => {
    localStorage.setItem("ld_user", JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    localStorage.removeItem("ld_token");
    localStorage.removeItem("ld_user");
    set({ user: null, token: null, loading: false });
  },

  bootstrap: async () => {
    const token = localStorage.getItem("ld_token");
    if (!token) {
      set({ loading: false });
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      set({ user: data.data.user, token, loading: false });
    } catch {
      localStorage.removeItem("ld_token");
      localStorage.removeItem("ld_user");
      set({ user: null, token: null, loading: false });
    }
  },

  login: async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    get().setAuth(data.data.token, data.data.user);
    return data.data.user;
  },

  register: async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    get().setAuth(data.data.token, data.data.user);
    return data.data.user;
  },
}));