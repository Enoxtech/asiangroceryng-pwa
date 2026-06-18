'use client';

import { useState } from 'react';
import { useAdminStore } from '@/store/adminStore';
import { formatPrice, formatDate } from '@/lib/utils';

const STATUS_OPTIONS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const statusColors: Record<string, string> = {
  pending:    'bg-amber-500/15 text-amber-400',
  confirmed:  'bg-blue-400/15 text-blue-300',
  processing: 'bg-blue-500/15 text-blue-400',
  shipped:    'bg-green-500/15 text-green-400',
  delivered:  'bg-gray-500/15 text-gray-400',
  cancelled:  'bg-red-500/15 text-red-400',
};

const FILTERS = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus } = useAdminStore();
  const [filter, setFilter] = useState('All');
  const [saved, setSaved] = useState<string | null>(null);

  const filtered = filter === 'All'
    ? orders
    : orders.filter((o) => o.status.toLowerCase() === filter.toLowerCase());

  function handleStatusChange(id: string, status: string) {
    if (!status) return;
    updateOrderStatus(id, status);
    setSaved(id);
    setTimeout(() => setSaved(null), 1500);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white font-display">Orders</h1>
        <p className="text-gray-500 text-sm mt-0.5 font-display">{orders.length} total orders</p>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`shrink-0 px-4 py-2 text-xs rounded-xl font-medium font-display transition-colors cursor-pointer ${
              filter === f
                ? 'bg-brand-red text-white'
                : 'text-gray-400 hover:text-white border'
            }`}
            style={filter !== f ? { borderColor: 'rgba(255,255,255,0.08)' } : {}}>
            {f}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border overflow-hidden" style={{ background: '#1a1814', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0f0e0b' }}>
                <th className="text-left px-4 py-3 text-[10px] font-label uppercase tracking-wide text-gray-500">Order</th>
                <th className="text-left px-4 py-3 text-[10px] font-label uppercase tracking-wide text-gray-500 hidden md:table-cell">Customer</th>
                <th className="text-left px-4 py-3 text-[10px] font-label uppercase tracking-wide text-gray-500 hidden lg:table-cell">Area</th>
                <th className="text-left px-4 py-3 text-[10px] font-label uppercase tracking-wide text-gray-500">Total</th>
                <th className="text-left px-4 py-3 text-[10px] font-label uppercase tracking-wide text-gray-500">Status</th>
                <th className="text-left px-4 py-3 text-[10px] font-label uppercase tracking-wide text-gray-500 hidden sm:table-cell">Date</th>
                <th className="px-4 py-3 text-[10px] font-label uppercase tracking-wide text-gray-500">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-mono font-bold text-gray-200 text-xs">{order.id}</p>
                    <p className="text-[10px] text-gray-500 font-label mt-0.5">{order.items} {order.items === 1 ? 'item' : 'items'} · {order.payment.replace('_', ' ')}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="font-medium text-gray-200 text-xs font-display">{order.customer}</p>
                    <p className="text-[10px] text-gray-500 font-label">{order.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs font-display hidden lg:table-cell">{order.area}</td>
                  <td className="px-4 py-3 font-bold text-gray-200 text-xs font-label tabular-nums">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize font-label ${statusColors[order.status] ?? ''}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[10px] text-gray-500 font-label hidden sm:table-cell">
                    {formatDate(order.date)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <select
                        defaultValue=""
                        onChange={(e) => { handleStatusChange(order.id, e.target.value); e.target.value = ''; }}
                        className="text-xs border rounded-lg px-2 py-1.5 focus:outline-none focus:border-brand-red font-display text-gray-200"
                        style={{ background: '#0f0e0b', borderColor: 'rgba(255,255,255,0.08)' }}
                      >
                        <option value="" disabled>Update…</option>
                        {STATUS_OPTIONS.filter((s) => s !== order.status).map((s) => (
                          <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                      {saved === order.id && (
                        <span className="text-[10px] text-green-400 font-label">Saved ✓</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-gray-500 text-sm font-display">No {filter.toLowerCase()} orders.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
