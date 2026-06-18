import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'cart';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  emoji?: string;
}

interface ToastStore {
  toasts: Toast[];
  show: (message: string, type?: ToastType, emoji?: string) => void;
  dismiss: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  show: (message, type = 'success', emoji) => {
    const id = Math.random().toString(36).slice(2);
    set((s) => ({ toasts: [...s.toasts, { id, message, type, emoji }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3200);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
