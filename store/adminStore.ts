import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, Category } from '@/types';
import { products as staticProducts } from '@/data/products';
import { categories as staticCategories } from '@/data/categories';

export interface AdminOrder {
  id: string;
  customer: string;
  phone: string;
  total: number;
  status: string;
  items: number;
  area: string;
  date: string;
  payment: string;
}

export type SlideTransition = 'fade' | 'slide' | 'zoom';
export type SlideAlign = 'left' | 'center' | 'right';

export interface BannerSlide {
  id: string;
  image: string;
  headline: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  transition: SlideTransition;
  align: SlideAlign;
  enabled: boolean;
}

const defaultBanners: BannerSlide[] = [
  {
    id: 'banner-1',
    image: '/banners/hero.png',
    headline: 'Asia In Every Aisle',
    subtitle: 'Korean · Japanese · Thai · Chinese',
    ctaLabel: 'Shop Now',
    ctaHref: '/shop',
    transition: 'fade',
    align: 'left',
    enabled: true,
  },
  {
    id: 'banner-2',
    image: '/banners/walkin.png',
    headline: 'Visit Our Store',
    subtitle: 'Fresh arrivals every week',
    ctaLabel: 'Find Us',
    ctaHref: '/contact',
    transition: 'slide',
    align: 'center',
    enabled: true,
  },
  {
    id: 'banner-3',
    image: '/banners/chalkboard.png',
    headline: 'Fresh Deals Daily',
    subtitle: 'Save big on Asian favourites',
    ctaLabel: 'See Deals',
    ctaHref: '/deals',
    transition: 'zoom',
    align: 'right',
    enabled: true,
  },
];

const mockOrders: AdminOrder[] = [
  { id: 'AGNG-001240', customer: 'Amara Okafor', phone: '08012345678', total: 8400, status: 'pending', items: 3, area: 'Lagos Island', date: '2024-07-15', payment: 'pay_on_delivery' },
  { id: 'AGNG-001239', customer: 'Femi Adeleke', phone: '08087654321', total: 5500, status: 'processing', items: 2, area: 'Abuja', date: '2024-07-15', payment: 'bank_transfer' },
  { id: 'AGNG-001238', customer: 'Chioma Eze', phone: '08055544433', total: 12300, status: 'shipped', items: 5, area: 'Lagos Mainland', date: '2024-07-14', payment: 'bank_transfer' },
  { id: 'AGNG-001237', customer: 'Kola Abiodun', phone: '09011122233', total: 3200, status: 'delivered', items: 1, area: 'Port Harcourt', date: '2024-07-14', payment: 'pay_on_delivery' },
  { id: 'AGNG-001236', customer: 'Ngozi Nwosu', phone: '07033344455', total: 7800, status: 'delivered', items: 4, area: 'Lagos Island', date: '2024-07-13', payment: 'bank_transfer' },
  { id: 'AGNG-001235', customer: 'Bayo Ogundimu', phone: '08099988877', total: 4500, status: 'cancelled', items: 2, area: 'Ibadan', date: '2024-07-12', payment: 'pay_on_delivery' },
];

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
  bankBranch: string;
  note: string;
}

const defaultBankDetails: BankDetails = {
  bankName: '',
  accountNumber: '',
  accountName: '',
  bankBranch: '',
  note: 'Send proof of payment via WhatsApp after transfer.',
};

interface AdminStore {
  products: Product[];
  orders: AdminOrder[];
  banners: BannerSlide[];
  categories: Category[];
  bankDetails: BankDetails;

  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addProduct: (product: Product) => void;

  addOrder: (order: AdminOrder) => void;
  updateOrderStatus: (id: string, status: string) => void;

  updateBanner: (id: string, updates: Partial<BannerSlide>) => void;
  addBanner: (banner: BannerSlide) => void;
  deleteBanner: (id: string) => void;
  moveBanner: (id: string, direction: 'up' | 'down') => void;

  updateCategory: (id: string, updates: Partial<Category>) => void;
  updateBankDetails: (details: Partial<BankDetails>) => void;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      products: staticProducts,
      orders: mockOrders,
      banners: defaultBanners,
      categories: staticCategories,
      bankDetails: defaultBankDetails,

      updateProduct: (id, updates) =>
        set({ products: get().products.map((p) => (p.id === id ? { ...p, ...updates } : p)) }),
      deleteProduct: (id) =>
        set({ products: get().products.filter((p) => p.id !== id) }),
      addProduct: (product) =>
        set({ products: [product, ...get().products] }),

      addOrder: (order) =>
        set({ orders: [order, ...get().orders] }),
      updateOrderStatus: (id, status) =>
        set({ orders: get().orders.map((o) => (o.id === id ? { ...o, status } : o)) }),

      updateBanner: (id, updates) =>
        set({ banners: get().banners.map((b) => (b.id === id ? { ...b, ...updates } : b)) }),
      addBanner: (banner) =>
        set({ banners: [...get().banners, banner] }),
      deleteBanner: (id) =>
        set({ banners: get().banners.filter((b) => b.id !== id) }),
      moveBanner: (id, direction) => {
        const banners = [...get().banners];
        const idx = banners.findIndex((b) => b.id === id);
        if (idx === -1) return;
        const newIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= banners.length) return;
        [banners[idx], banners[newIdx]] = [banners[newIdx], banners[idx]];
        set({ banners });
      },

      updateCategory: (id, updates) =>
        set({ categories: get().categories.map((c) => (c.id === id ? { ...c, ...updates } : c)) }),
      updateBankDetails: (details) =>
        set({ bankDetails: { ...get().bankDetails, ...details } }),
    }),
    { name: 'agng-admin', version: 2 }
  )
);
