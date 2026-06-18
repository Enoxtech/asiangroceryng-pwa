import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';

interface RecentlyViewedState {
  items: Product[];
  addItem: (product: Product) => void;
  clearItems: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const filtered = get().items.filter((p) => p.id !== product.id);
        set({ items: [product, ...filtered].slice(0, 10) });
      },
      clearItems: () => set({ items: [] }),
    }),
    { name: 'agng-recently-viewed' }
  )
);
