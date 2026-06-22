import { create } from 'zustand';

export type AdminRole = 'super_admin' | 'support' | 'product_manager';

export interface AdminSessionInfo {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}

interface AdminAuthState {
  session: AdminSessionInfo | null;
  status: 'idle' | 'loading' | 'ready';
  checkSession: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

export const useAdminAuthStore = create<AdminAuthState>()((set) => ({
  session: null,
  status: 'idle',

  checkSession: async () => {
    set({ status: 'loading' });
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        set({ session: null, status: 'ready' });
        return;
      }
      const { session } = await res.json();
      set({ session, status: 'ready' });
    } catch {
      set({ session: null, status: 'ready' });
    }
  },

  login: async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Login failed' }));
      return { success: false, error };
    }
    const session = await res.json();
    set({ session, status: 'ready' });
    return { success: true };
  },

  logout: async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    set({ session: null, status: 'ready' });
  },
}));
