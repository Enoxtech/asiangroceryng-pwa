'use client';

import { useState, useEffect } from 'react';
import { useAdminStore } from '@/store/adminStore';
import { useAdminAuthStore } from '@/store/adminAuthStore';
import { formatPrice, formatDate } from '@/lib/utils';
import { ChevronDown, ChevronUp, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';

const STATUS_OPTIONS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const statusColors: Record<string, string> = {
  pending:    'bg-amber-500/15 text-amber-400',
  confirmed:  'bg-blue-400/15 text-blue-300',
  processing: 'bg-blue-500/15 text-blue-400',
  shipped:    'bg-green-500/15 text-green-400',
  delivered:  'bg-gray-500/15 text-gray-400',
  cancelled:  'bg-red-500/15 text-red-400',
};

const FILTERS = ['All', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

function paymentLabel(pm: string) {
  const map: Record<string, string> = {
    paystack: 'Paystack',
    flutterwave: 'Flutterwave',
    bank_transfer: 'Bank Transfer',
    pay_on_delivery: 'Pay on Delivery',
  };
  return map[pm] ?? pm.replace(/_/g, ' ');
}

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus, hydrateOrders } = useAdminStore();
  const { session } = useAdminAuthStore();
  const canWrite = session?.role !== 'product_manager';
  const [filter, setFilter] = useState('All');
  const [saved, setSaved] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    hydrateOrders();
  }, [hydrateOrders]);

  const filtered = filter === 'All'
    ? orders
    : orders.filter((o) => o.status.toLowerCase() === filter.toLowerCase());

  function handleStatusChange(id: string, status: string) {
    if (!status) return;
    updateOrderStatus(id, status);
    setSaved(id);
    setTimeout(() => setSaved(null), 1500);
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => (prev === id ? null : id));
  }

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '';

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

      <div className="space-y-2">
        {filtered.map((order) => {
          const isOpen = expanded === order.id;
          return (
            <div key={order.id} className="rounded-2xl border overflow-hidden" style={{ background: '#1a1814', borderColor: isOpen ? 'rgba(196,30,58,0.4)' : 'rgba(255,255,255,0.06)' }}>

              {/* Summary row — click to expand */}
              <button
                type="button"
                onClick={() => toggleExpand(order.id)}
                className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-white/[0.02] transition-colors"
              >
                {/* Expand icon */}
                <span className="text-gray-600 shrink-0">
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </span>

                {/* Order ID + item count */}
                <div className="min-w-0 flex-1">
                  <p className="font-mono font-bold text-gray-200 text-xs">{order.id}</p>
                  <p className="text-[10px] text-gray-500 font-label mt-0.5">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'items'} · {paymentLabel(order.payment)}
                  </p>
                </div>

                {/* Customer */}
                <div className="hidden sm:block min-w-0 w-36">
                  <p className="font-medium text-gray-200 text-xs font-display truncate">{order.customer}</p>
                  <p className="text-[10px] text-gray-500 font-label">{order.phone}</p>
                </div>

                {/* Area */}
                <p className="hidden lg:block text-gray-400 text-xs font-display w-28 truncate">{order.area}</p>

                {/* Total */}
                <p className="font-bold text-gray-200 text-xs font-label tabular-nums shrink-0">{formatPrice(order.total)}</p>

                {/* Status badge */}
                <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold capitalize font-label ${statusColors[order.status] ?? ''}`}>
                  {order.status}
                </span>

                {/* Date */}
                <p className="hidden md:block text-[10px] text-gray-500 font-label shrink-0">{formatDate(order.date)}</p>
              </button>

              {/* Expanded detail panel */}
              {isOpen && (
                <div className="border-t px-4 pb-5 pt-4 space-y-5" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>

                  {/* Two-column layout on wider screens */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                    {/* Customer details */}
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-label mb-3">Customer Details</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-20 shrink-0 font-label">Name</span>
                          <span className="text-sm text-gray-200 font-medium font-display">{order.customer}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-20 shrink-0 font-label">Phone</span>
                          <a href={`tel:${order.phone}`} className="text-sm text-brand-red hover:underline flex items-center gap-1 font-label">
                            <Phone className="h-3 w-3" />{order.phone}
                          </a>
                        </div>
                        {order.email && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 w-20 shrink-0 font-label">Email</span>
                            <a href={`mailto:${order.email}`} className="text-sm text-blue-400 hover:underline flex items-center gap-1 font-label truncate">
                              <Mail className="h-3 w-3 shrink-0" />{order.email}
                            </a>
                          </div>
                        )}
                        <div className="flex items-start gap-2">
                          <span className="text-xs text-gray-500 w-20 shrink-0 font-label mt-0.5">Area</span>
                          <span className="text-sm text-gray-300 font-display">{order.area}</span>
                        </div>
                        {order.address && (
                          <div className="flex items-start gap-2">
                            <span className="text-xs text-gray-500 w-20 shrink-0 font-label mt-0.5">Address</span>
                            <span className="text-sm text-gray-300 font-display flex items-start gap-1">
                              <MapPin className="h-3 w-3 shrink-0 mt-0.5 text-gray-500" />{order.address}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-20 shrink-0 font-label">Payment</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 font-label font-bold">{paymentLabel(order.payment)}</span>
                        </div>
                        {order.paymentRef && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 w-20 shrink-0 font-label">Ref</span>
                            <span className="text-xs text-gray-400 font-mono">{order.paymentRef}</span>
                          </div>
                        )}
                        {order.notes && (
                          <div className="flex items-start gap-2">
                            <span className="text-xs text-gray-500 w-20 shrink-0 font-label mt-0.5">Notes</span>
                            <span className="text-sm text-amber-300 italic font-display">"{order.notes}"</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order summary */}
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gray-500 font-label mb-3">Order Summary</p>
                      <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                        {/* Items */}
                        <table className="w-full text-xs">
                          <thead>
                            <tr style={{ background: '#0f0e0b' }}>
                              <th className="text-left px-3 py-2 text-gray-500 font-label font-normal">Item</th>
                              <th className="text-center px-3 py-2 text-gray-500 font-label font-normal">Qty</th>
                              <th className="text-right px-3 py-2 text-gray-500 font-label font-normal">Unit</th>
                              <th className="text-right px-3 py-2 text-gray-500 font-label font-normal">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items.map((it, i) => (
                              <tr key={i} className="border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                                <td className="px-3 py-2 text-gray-200 font-display">{it.name}</td>
                                <td className="px-3 py-2 text-center text-gray-400 tabular-nums">{it.quantity}</td>
                                <td className="px-3 py-2 text-right text-gray-400 tabular-nums">{formatPrice(it.price)}</td>
                                <td className="px-3 py-2 text-right text-gray-200 font-bold tabular-nums">{formatPrice(it.price * it.quantity)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {/* Totals breakdown */}
                        <div className="border-t px-3 py-3 space-y-1" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#0f0e0b' }}>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span className="font-label">Subtotal</span>
                            <span className="tabular-nums">{formatPrice(order.subtotal)}</span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span className="font-label">Delivery Fee</span>
                            <span className="tabular-nums">{order.deliveryFee > 0 ? formatPrice(order.deliveryFee) : 'FREE'}</span>
                          </div>
                          {order.tax && order.tax > 0 ? (
                            <div className="flex justify-between text-xs text-gray-500">
                              <span className="font-label">VAT</span>
                              <span className="tabular-nums">{formatPrice(order.tax)}</span>
                            </div>
                          ) : null}
                          {order.discount && order.discount > 0 ? (
                            <div className="flex justify-between text-xs text-green-400">
                              <span className="font-label">Discount{order.couponCode ? ` (${order.couponCode})` : ''}</span>
                              <span className="tabular-nums">−{formatPrice(order.discount)}</span>
                            </div>
                          ) : null}
                          <div className="flex justify-between text-sm font-bold text-white border-t pt-2" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                            <span className="font-label">TOTAL</span>
                            <span className="tabular-nums text-brand-red">{formatPrice(order.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action row */}
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    {/* WhatsApp customer button */}
                    <a
                      href={`https://wa.me/${order.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${order.customer}, your order ${order.id} from Asian Grocery Nigeria has been confirmed! We'll process it shortly.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-600/20 text-green-400 text-xs font-semibold hover:bg-green-600/30 transition-colors font-label"
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Customer
                    </a>

                    {/* Status update */}
                    {canWrite && (
                      <div className="flex items-center gap-2 ml-auto">
                        <select
                          defaultValue=""
                          onChange={(e) => { handleStatusChange(order.id, e.target.value); e.target.value = ''; }}
                          className="text-xs border rounded-lg px-2 py-1.5 focus:outline-none focus:border-brand-red font-display text-gray-200"
                          style={{ background: '#0f0e0b', borderColor: 'rgba(255,255,255,0.08)' }}
                        >
                          <option value="" disabled>Update status…</option>
                          {STATUS_OPTIONS.filter((s) => s !== order.status).map((s) => (
                            <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                        {saved === order.id && (
                          <span className="text-[10px] text-green-400 font-label">Saved ✓</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="py-12 text-center rounded-2xl border" style={{ background: '#1a1814', borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="text-gray-500 text-sm font-display">No {filter.toLowerCase()} orders.</p>
          </div>
        )}
      </div>
    </div>
  );
}
