'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Package, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Badge } from '@/components/ui/Badge';
import { formatPrice, formatDate } from '@/lib/utils';

const mockOrders = [
  { id: 'AGNG-001234', date: '2024-07-10', total: 9600, status: 'delivered', items: 3, area: 'Lagos Island' },
  { id: 'AGNG-001189', date: '2024-06-28', total: 5500, status: 'shipped', items: 2, area: 'Abuja' },
  { id: 'AGNG-001102', date: '2024-06-15', total: 12300, status: 'delivered', items: 5, area: 'Lagos Mainland' },
];

const statusMap: Record<string, 'success' | 'warning' | 'default'> = {
  delivered: 'success',
  shipped: 'warning',
  pending: 'default',
  processing: 'default',
};

export default function OrdersPage() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <Package className="h-12 w-12 mx-auto mb-4 text-[var(--text-muted)]" />
        <p className="font-bold text-[var(--text-primary)] font-display">Sign in to view orders</p>
        <Link href="/account" className="mt-4 inline-block px-5 py-2.5 rounded-[44px] bg-brand-red text-white text-sm font-bold font-display">
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
          <p className="text-sm text-[var(--text-muted)] font-display">{mockOrders.length} orders</p>
        </div>
        <Link href="/track-order" className="text-sm text-brand-red font-semibold hover:opacity-75 font-display flex items-center gap-1">
          Track Order <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {mockOrders.length === 0 ? (
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
          {mockOrders.map((order) => (
            <div key={order.id} className="rounded-[22px] glass border border-[var(--border-color)] p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-[var(--text-primary)] font-label text-sm">{order.id}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5 font-display">{formatDate(order.date)} · {order.area}</p>
                </div>
                <Badge variant={statusMap[order.status] ?? 'default'} className="capitalize text-[10px]">
                  {order.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)]">
                <p className="text-sm text-[var(--text-secondary)] font-display">{order.items} {order.items === 1 ? 'item' : 'items'}</p>
                <p className="font-bold text-brand-red font-label">{formatPrice(order.total)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
