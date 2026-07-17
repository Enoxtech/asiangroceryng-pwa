'use client';

import { useState } from 'react';
import { Search, Package, CheckCircle, Truck, Home, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface OrderItem { id: string; name: string; quantity: number; price: number }
interface TrackedOrder {
  id: string;
  status: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'expired' | 'refunded';
  total: number;
  area: string;
  address: string | null;
  createdAt: string;
  items: OrderItem[];
}

const STEP_ORDER = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

function buildSteps(status: string) {
  if (status === 'cancelled') {
    return [{ id: 'cancelled', label: 'Order Cancelled', done: true, cancelled: true }];
  }
  if (status === 'awaiting_payment') {
    return [{ id: 'awaiting_payment', label: 'Waiting for Payment', done: true, active: true }];
  }
  const currentIndex = STEP_ORDER.indexOf(status);
  const labels: Record<string, string> = {
    pending: 'Order Placed',
    confirmed: 'Order Confirmed',
    processing: 'Being Packed',
    shipped: 'Out for Delivery',
    delivered: 'Delivered',
  };
  return STEP_ORDER.map((id, i) => ({
    id,
    label: labels[id],
    done: currentIndex >= 0 && i <= currentIndex,
    active: i === currentIndex,
  }));
}

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, phone }),
      });
      const json = await res.json();
      if (!res.ok) {
        setResult(null);
        setError(json.error || 'Order not found');
      } else {
        setResult(json);
      }
    } catch {
      setResult(null);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const steps = result ? buildSteps(result.status) : [];

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Track Your Order</h1>
      <p className="text-gray-500 text-sm mb-6">Enter your order ID and the phone number used at checkout.</p>

      <form onSubmit={handleSearch} className="space-y-3 mb-8">
        <input
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="Order ID, e.g. AGNG-123456"
          required
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
        />
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone number used at checkout"
          required
          type="tel"
          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
        />
        <Button type="submit" size="md" loading={loading} className="w-full">
          <Search className="h-4 w-4" />
          Track Order
        </Button>
      </form>

      {searched && !result && !loading && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-semibold text-gray-800">{error || 'Order not found'}</p>
          <p className="text-sm text-gray-500 mt-1">Check your order ID and phone number, or contact us on WhatsApp.</p>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <div className="bg-green-50 rounded-2xl p-4">
            <p className="text-xs text-green-600 font-semibold mb-1">Order ID</p>
            <p className="font-mono font-bold text-gray-900">{result.id}</p>
            <p className="text-sm text-green-700 mt-1">Total: <strong>{formatPrice(result.total)}</strong> · {result.area}</p>
            <p className={cn('text-xs font-semibold mt-2 capitalize', result.paymentStatus === 'paid' ? 'text-green-700' : 'text-amber-700')}>
              Payment: {result.paymentStatus}
            </p>
          </div>

          {/* Tracking stepper */}
          <div className="space-y-0">
            {steps.map((step, i) => (
              <div key={step.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2',
                    'cancelled' in step && step.cancelled ? 'bg-red-500 border-red-500 text-white' :
                    step.done ? 'bg-brand-red border-brand-red text-white' : 'bg-white border-gray-200 text-gray-300'
                  )}>
                    {'cancelled' in step && step.cancelled ? <XCircle className="h-4 w-4" /> :
                      step.done ? <CheckCircle className="h-4 w-4" /> :
                      i === 3 ? <Truck className="h-4 w-4" /> :
                      i === 4 ? <Home className="h-4 w-4" /> :
                      <Package className="h-4 w-4" />}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={cn('w-0.5 h-10 mt-1', step.done ? 'bg-brand-red' : 'bg-gray-200')} />
                  )}
                </div>
                <div className="pb-8">
                  <p className={cn('text-sm font-semibold', step.done ? 'text-gray-900' : 'text-gray-400')}>{step.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Items */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Items in this order</p>
            {result.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm text-gray-600 py-1">
                <span>{item.name}</span>
                <span>×{item.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
