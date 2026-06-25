'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Badge } from '@/components/ui/Badge';
import { formatPrice, formatDate } from '@/lib/utils';

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface MyOrder {
  id: string;
  total: number;
  status: string;
  area: string;
  createdAt: string;
  items: OrderItem[];
}

const statusMap: Record<string, 'success' | 'warning' | 'default'> = {
  delivered: 'success',
  shipped: 'warning',
  pending: 'default',
  processing: 'default',
};

export default function OrdersPage() {
  const { user, hydrated, hydrate } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<MyOrder[] | null>(null);

  useEffect(() => {
    setMounted(true);
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!user) return;
    fetch('/api/orders/mine')
      .then((r) => (r.ok ? r.json() : []))
      .then(setOrders)
      .catch(() => setOrders([]));
  }, [user]);

  if (!mounted || !hydrated) return null;

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <Package className="h-12 w-12 mx-auto mb-4 text-[var(--text-muted)]" />
        <p className="font-bold text-[var(--text-primary)] font-display">Sign in to view orders</p>
        <Link href="/login" className="mt-4 inline-block px-5 py-2.5 rounded-[44px] bg-brand-red text-white text-sm font-bold font-display">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)] font-display">My Orders</h1>
          <p className="text-sm text-[var(--text-muted)] font-display">{orders ? `${orders.length} orders` : 'Loading…'}</p>
        </div>
        <Link href="/track-order" className="text-sm text-brand-red font-semibold hover:opacity-75 font-display flex items-center gap-1">
          Track Order <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {orders === null ? (
        <div className="text-center py-16">
          <span className="inline-block h-6 w-6 rounded-full border-2 border-gray-200 border-t-brand-red animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 rounded-[28px] glass border border-[var(--border-color)]">
          <Package className="h-12 w-12 mx-auto mb-4 text-[var(--text-muted)]" />
          <p className="font-semibold text-[var(--text-primary)] font-display">No orders yet</p>
          <p className="text-sm text-[var(--text-muted)] mt-1 font-display">Your orders will appear here after purchase.</p>
          <Link href="/shop" className="inline-block mt-4 px-5 py-2.5 bg-brand-red text-white rounded-[44px] text-sm font-bold font-display">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
            return (
              <div key={order.id} className="rounded-[22px] glass border border-[var(--border-color)] p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-[var(--text-primary)] font-label text-sm">{order.id}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5 font-display">{formatDate(order.createdAt)} · {order.area}</p>
                  </div>
                  <Badge variant={statusMap[order.status] ?? 'default'} className="capitalize text-[10px]">
                    {order.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)]">
                  <p className="text-sm text-[var(--text-secondary)] font-display">{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
                  <p className="font-bold text-brand-red font-label">{formatPrice(order.total)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
