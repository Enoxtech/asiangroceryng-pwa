'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AdminNotifType = 'order' | 'stock' | 'system' | 'homepage';

export interface AdminNotification {
  id: string;
  type: AdminNotifType;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  actionUrl?: string;
}

interface NotificationStore {
  notifications: AdminNotification[];
  addNotification: (n: Omit<AdminNotification, 'id' | 'read' | 'timestamp'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
  clearAll: () => void;
  unreadCount: () => number;
}

const SEED: AdminNotification[] = [
  {
    id: 'notif-1',
    type: 'order',
    title: 'New Order Received',
    message: 'Order #AGNG-124091 placed by Adaeze Obi — ₦14,500 · Pay on Delivery',
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    actionUrl: '/admin/orders',
  },
  {
    id: 'notif-2',
    type: 'stock',
    title: 'Low Stock Alert',
    message: 'Taro Milk Tea Powder is down to 4 units. Consider restocking.',
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    actionUrl: '/admin/products',
  },
  {
    id: 'notif-3',
    type: 'order',
    title: 'Order Status Updated',
    message: 'Order #AGNG-124088 marked as Delivered by you.',
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    actionUrl: '/admin/orders',
  },
  {
    id: 'notif-4',
    type: 'homepage',
    title: 'Banner Updated',
    message: 'Hero banner "Welcome to Asian Store" is now live on the homepage.',
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    actionUrl: '/admin/banners',
  },
  {
    id: 'notif-5',
    type: 'stock',
    title: 'Out of Stock',
    message: 'Samyang Buldak 2x Spicy is now out of stock.',
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    actionUrl: '/admin/products',
  },
];

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: SEED,

      addNotification: (n) =>
        set((s) => ({
          notifications: [
            {
              ...n,
              id: `notif-${Date.now()}`,
              read: false,
              timestamp: new Date().toISOString(),
            },
            ...s.notifications,
          ],
        })),

      markRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        })),

      markAllRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),

      dismiss: (id) =>
        set((s) => ({
          notifications: s.notifications.filter((n) => n.id !== id),
        })),

      clearAll: () => set({ notifications: [] }),

      unreadCount: () => get().notifications.filter((n) => !n.read).length,
    }),
    { name: 'agng-admin-notifications', version: 1 }
  )
);
