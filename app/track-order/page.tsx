'use client';

import { useState } from 'react';
import { Search, Package, CheckCircle, Truck, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const mockOrder = {
  id: 'AGNG-001234',
  status: 'shipped',
  estimatedDelivery: '16 Jun 2024',
  items: [
    { name: 'Nongshim Shin Ramyun Bowl', qty: 2 },
    { name: 'Kimchi 500g', qty: 1 },
  ],
  steps: [
    { id: 'confirmed', label: 'Order Confirmed', date: '14 Jun 2024, 10:30am', done: true },
    { id: 'processing', label: 'Being Packed', date: '14 Jun 2024, 2:00pm', done: true },
    { id: 'shipped', label: 'Out for Delivery', date: '16 Jun 2024, 9:00am', done: true, active: true },
    { id: 'delivered', label: 'Delivered', date: null, done: false },
  ],
};

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [result, setResult] = useState<typeof mockOrder | null>(null);
  const [searched, setSearched] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearched(true);
    if (orderId.toUpperCase().includes('AGNG') || orderId === 'AGNG-001234') {
      setResult(mockOrder);
    } else {
      setResult(null);
    }
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Track Your Order</h1>
      <p className="text-gray-500 text-sm mb-6">Enter your order ID to check the status.</p>

      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <input
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="e.g. AGNG-001234"
          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-red"
        />
        <Button type="submit" size="md">
          <Search className="h-4 w-4" />
          Track
        </Button>
      </form>

      {searched && !result && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🔍</div>
          <p className="font-semibold text-gray-800">Order not found</p>
          <p className="text-sm text-gray-500 mt-1">Check your order ID and try again, or contact us on WhatsApp.</p>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          <div className="bg-green-50 rounded-2xl p-4">
            <p className="text-xs text-green-600 font-semibold mb-1">Order ID</p>
            <p className="font-mono font-bold text-gray-900">{result.id}</p>
            {result.estimatedDelivery && (
              <p className="text-sm text-green-700 mt-1">Estimated delivery: <strong>{result.estimatedDelivery}</strong></p>
            )}
          </div>

          {/* Tracking stepper */}
          <div className="space-y-0">
            {result.steps.map((step, i) => (
              <div key={step.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2',
                    step.done ? 'bg-brand-red border-brand-red text-white' : 'bg-white border-gray-200 text-gray-300'
                  )}>
                    {step.done ? <CheckCircle className="h-4 w-4" /> :
                      i === 2 ? <Truck className="h-4 w-4" /> :
                      i === 3 ? <Home className="h-4 w-4" /> :
                      <Package className="h-4 w-4" />}
                  </div>
                  {i < result.steps.length - 1 && (
                    <div className={cn('w-0.5 h-10 mt-1', step.done ? 'bg-brand-red' : 'bg-gray-200')} />
                  )}
                </div>
                <div className="pb-8">
                  <p className={cn('text-sm font-semibold', step.done ? 'text-gray-900' : 'text-gray-400')}>{step.label}</p>
                  {step.date && <p className="text-xs text-gray-400 mt-0.5">{step.date}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* Items */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Items in this order</p>
            {result.items.map((item) => (
              <div key={item.name} className="flex justify-between text-sm text-gray-600 py-1">
                <span>{item.name}</span>
                <span>×{item.qty}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Demo hint */}
      <p className="text-xs text-gray-400 text-center mt-8">Demo: try order ID <span className="font-mono">AGNG-001234</span></p>
    </div>
  );
}
