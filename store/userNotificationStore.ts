'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserNotifType = 'order' | 'promo' | 'arrival' | 'system';

export interface UserNotification {
  id: string;
  type: UserNotifType;
  title: string;
  body: string;
  read: boolean;
  timestamp: string;
  link?: string;
}

interface UserNotificationStore {
  notifications: UserNotification[];
  addNotification: (n: Omit<UserNotification, 'id' | 'read' | 'timestamp'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
  unreadCount: () => number;
}

const SEED: UserNotification[] = [
  {
    id: 'un-1',
    type: 'order',
    title: 'Order Confirmed!',
    body: 'Your order #AGNG-124091 has been received and is being prepared.',
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    link: '/orders',
  },
  {
    id: 'un-2',
    type: 'promo',
    title: 'Weekend Special — 15% Off',
    body: 'Use code ASIAN15 on all Korean products this weekend only. Min. order ₦5,000.',
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    link: '/shop?category=sauces-condiments',
  },
  {
    id: 'un-3',
    type: 'arrival',
    title: 'New Arrivals: Japanese Snacks',
    body: 'Fresh stock just landed — Pocky, Pretz, and Hello Panda now available!',
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    link: '/shop?category=snacks',
  },
  {
    id: 'un-4',
    type: 'order',
    title: 'Order Shipped',
    body: 'Your order #AGNG-124088 is on its way! Expected delivery: 1–2 business days.',
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    link: '/orders',
  },
  {
    id: 'un-5',
    type: 'system',
    title: 'Welcome to Asian Grocery NG!',
    body: 'Discover authentic flavours from Japan, Korea, China, Vietnam, and Thailand.',
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    link: '/about',
  },
];

export const useUserNotificationStore = create<UserNotificationStore>()(
  persist(
    (set, get) => ({
      notifications: SEED,

      addNotification: (n) =>
        set((s) => ({
          notifications: [
            {
              ...n,
              id: `un-${Date.now()}`,
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

      unreadCount: () => get().notifications.filter((n) => !n.read).length,
    }),
    { name: 'agng-user-notifications', version: 1 }
  )
);
