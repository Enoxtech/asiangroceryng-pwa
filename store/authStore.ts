import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'admin' | 'customer';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  avatar?: string;
}

interface AuthState {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<Pick<AuthUser, 'name' | 'phone' | 'address'>>) => void;
}

const MOCK_USERS: Array<AuthUser & { password: string }> = [
  {
    id: 'admin-1',
    name: 'Admin',
    email: 'admin@asiangroceryng.com',
    password: 'Admin@2024',
    role: 'admin',
  },
  {
    id: 'user-1',
    name: 'Demo Customer',
    email: 'demo@customer.com',
    password: 'Demo@2024',
    role: 'customer',
    phone: '08012345678',
    address: '15 Marina Road, Lagos Island, Lagos',
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: async (email, password) => {
        await new Promise((r) => setTimeout(r, 800));
        const found = MOCK_USERS.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (!found) return { success: false, error: 'Invalid email or password.' };
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _pw, ...user } = found;
        set({ user });
        return { success: true };
      },
      logout: () => set({ user: null }),
      updateProfile: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),
    }),
    { name: 'agng-auth' }
  )
);
