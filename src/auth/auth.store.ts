import { create } from "zustand";
import { tokenStorage } from "../lib/tokenStorage";
import { authService } from "./auth.service";

type AuthState = {
  isBooting: boolean;
  isAuthed: boolean;
  user: any | null;

  bootstrap: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  isBooting: true,
  isAuthed: false,
  user: null,

  bootstrap: async () => {
    set({ isBooting: true });

    const access = await tokenStorage.getAccess();
    const refresh = await tokenStorage.getRefresh();

    if (!access && !refresh) {
      set({ isBooting: false, isAuthed: false, user: null });
      return;
    }

    try {
      const meRes = await authService.me();
      // depending on your API: might be {status,data:{...}}
      const user = meRes?.data ?? meRes;
      set({ isBooting: false, isAuthed: true, user });
    } catch {
      await tokenStorage.clear();
      set({ isBooting: false, isAuthed: false, user: null });
    }
  },

  login: async (email, password) => {
    await authService.login({ email, password });

    const meRes = await authService.me();
    const user = meRes?.data ?? meRes;

    set({ isAuthed: true, user });
  },

  logout: async () => {
    await authService.logout(); 
    set({ isAuthed: false, user: null, isBooting: false });
  },
}));
