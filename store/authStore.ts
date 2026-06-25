import { create } from 'zustand';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  emailVerified: boolean;
}

interface AuthState {
  user: AuthUser | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  register: (data: { name: string; email: string; phone: string; password: string; address?: string }) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Pick<AuthUser, 'name' | 'phone' | 'address'>>) => Promise<{ success: boolean; error?: string }>;
  resendVerification: () => Promise<{ success: boolean; error?: string }>;
}

async function api<T>(url: string, options?: RequestInit): Promise<{ data: T | null; error?: string; status: number }> {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) return { data: null, error: json?.error || 'Something went wrong', status: res.status };
  return { data: json, status: res.status };
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    const { data } = await api<AuthUser>('/api/customer-auth/me');
    set({ user: data, hydrated: true });
  },

  register: async (payload) => {
    const { data, error } = await api<AuthUser>('/api/customer-auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!data) return { success: false, error };
    set({ user: data, hydrated: true });
    return { success: true };
  },

  login: async (email, password) => {
    const { data, error } = await api<AuthUser>('/api/customer-auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (!data) return { success: false, error };
    set({ user: data, hydrated: true });
    return { success: true };
  },

  logout: async () => {
    await api('/api/customer-auth/logout', { method: 'POST' });
    set({ user: null });
  },

  updateProfile: async (data) => {
    const { data: updated, error } = await api<AuthUser>('/api/customer-auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!updated) return { success: false, error };
    set({ user: updated });
    return { success: true };
  },

  resendVerification: async () => {
    const { error } = await api('/api/customer-auth/resend-verification', { method: 'POST' });
    if (error) return { success: false, error };
    return { success: true };
  },
}));
