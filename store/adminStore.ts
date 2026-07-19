import { create } from 'zustand';
import { Product, Category } from '@/types';

export interface OrderLineItem {
  name: string;
  quantity: number;
  price: number;
  productId?: string;
  categorySlug?: string;
}

export interface AdminOrder {
  id: string;
  customer: string;
  phone: string;
  email?: string;
  subtotal: number;
  deliveryFee: number;
  discount?: number;
  tax?: number;
  couponCode?: string;
  total: number;
  status: string;
  items: OrderLineItem[];
  area: string;
  address?: string;
  date: string;
  payment: string;
  paymentRef?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'expired' | 'refunded';
  paymentProvider?: string;
  paidAt?: string;
  paymentExpiresAt?: string;
  deliveryMethod?: 'ship' | 'pickup';
  deliveryAreaId?: string;
  notes?: string;
  bankDetails?: BankDetails;
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
  note: '',
};

async function api<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  });
  const data = await res.json().catch(() => null) as (T & { error?: string }) | null;
  if (!res.ok) throw new Error(data?.error || `API error ${res.status}: ${url}`);
  if (!data) throw new Error(`Invalid API response: ${url}`);
  return data;
}

interface AdminStore {
  products: Product[];
  orders: AdminOrder[];
  banners: BannerSlide[];
  categories: Category[];
  bankDetails: BankDetails;
  hydrated: boolean;
  ordersHydrated: boolean;

  /** Public storefront data only — safe to call for any visitor, admin or not. */
  hydrate: () => Promise<void>;
  /** Admin-only order list — only call this from authenticated admin pages. */
  hydrateOrders: () => Promise<void>;

  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addProduct: (product: Product) => Promise<void>;

  addOrder: (order: AdminOrder) => Promise<AdminOrder>;
  updateOrderStatus: (id: string, status: string) => Promise<void>;
  confirmOrderPayment: (id: string) => Promise<AdminOrder>;

  updateBanner: (id: string, updates: Partial<BannerSlide>) => Promise<void>;
  addBanner: (banner: BannerSlide) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  moveBanner: (id: string, direction: 'up' | 'down') => Promise<void>;

  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  addCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  updateBankDetails: (details: Partial<BankDetails>) => Promise<void>;
}

export const useAdminStore = create<AdminStore>()((set, get) => ({
  products: [],
  orders: [],
  banners: [],
  categories: [],
  bankDetails: defaultBankDetails,
  hydrated: false,
  ordersHydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    const [products, categories, banners, bankDetails] = await Promise.all([
      api<Product[]>('/api/products'),
      api<Category[]>('/api/categories'),
      api<BannerSlide[]>('/api/banners'),
      api<BankDetails>('/api/bank-details'),
    ]);
    set({ products, categories, banners, bankDetails, hydrated: true });
  },

  hydrateOrders: async () => {
    if (get().ordersHydrated) return;
    const orders = await api<(AdminOrder & { createdAt: string })[]>('/api/orders');
    set({
      orders: orders.map((o) => ({ ...o, date: o.createdAt.slice(0, 10) })),
      ordersHydrated: true,
    });
  },

  updateProduct: async (id, updates) => {
    const product = await api<Product>(`/api/products/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
    set({ products: get().products.map((p) => (p.id === id ? product : p)) });
  },
  deleteProduct: async (id) => {
    await api(`/api/products/${id}`, { method: 'DELETE' });
    set({ products: get().products.filter((p) => p.id !== id) });
  },
  addProduct: async (product) => {
    const created = await api<Product>('/api/products', { method: 'POST', body: JSON.stringify(product) });
    set({ products: [created, ...get().products] });
  },

  addOrder: async (order) => {
    const created = await api<AdminOrder>('/api/orders', { method: 'POST', body: JSON.stringify(order) });
    set({ orders: [{ ...created, date: order.date }, ...get().orders] });
    return created;
  },
  updateOrderStatus: async (id, status) => {
    const updated = await api<AdminOrder>(`/api/orders/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    set({ orders: get().orders.map((o) => (o.id === id ? { ...o, status: updated.status } : o)) });
  },
  confirmOrderPayment: async (id) => {
    const updated = await api<AdminOrder>(`/api/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ action: 'confirm_payment' }),
    });
    set({
      orders: get().orders.map((o) => (o.id === id
        ? { ...o, ...updated, date: o.date }
        : o)),
    });
    return updated;
  },

  updateBanner: async (id, updates) => {
    const banner = await api<BannerSlide>(`/api/banners/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
    set({ banners: get().banners.map((b) => (b.id === id ? banner : b)) });
  },
  addBanner: async (banner) => {
    const created = await api<BannerSlide>('/api/banners', { method: 'POST', body: JSON.stringify(banner) });
    set({ banners: [...get().banners, created] });
  },
  deleteBanner: async (id) => {
    await api(`/api/banners/${id}`, { method: 'DELETE' });
    set({ banners: get().banners.filter((b) => b.id !== id) });
  },
  moveBanner: async (id, direction) => {
    const banners = [...get().banners];
    const idx = banners.findIndex((b) => b.id === id);
    if (idx === -1) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= banners.length) return;
    [banners[idx], banners[newIdx]] = [banners[newIdx], banners[idx]];
    set({ banners });
    await Promise.all(
      banners.map((b, i) => api(`/api/banners/${b.id}`, { method: 'PATCH', body: JSON.stringify({ position: i }) }))
    );
  },

  updateCategory: async (id, updates) => {
    const category = await api<Category>(`/api/categories/${id}`, { method: 'PATCH', body: JSON.stringify(updates) });
    set({ categories: get().categories.map((c) => (c.id === id ? category : c)) });
  },
  addCategory: async (category) => {
    const created = await api<Category>('/api/categories', { method: 'POST', body: JSON.stringify(category) });
    set({ categories: [...get().categories, created] });
  },
  deleteCategory: async (id) => {
    await api(`/api/categories/${id}`, { method: 'DELETE' });
    set({ categories: get().categories.filter((c) => c.id !== id) });
  },
  updateBankDetails: async (details) => {
    const bankDetails = await api<BankDetails>('/api/bank-details', { method: 'PATCH', body: JSON.stringify(details) });
    set({ bankDetails });
  },
}));
