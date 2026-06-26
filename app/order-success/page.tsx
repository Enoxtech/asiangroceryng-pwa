'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Package, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Suspense } from 'react';

function OrderSuccessContent() {
  const params = useSearchParams();
  const orderId = params.get('order') || 'AGNG-000000';

  return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed! 🎉</h1>
      <p className="text-gray-500 mb-2">Thank you for shopping with Asian Grocery Nigeria.</p>
      <p className="text-sm text-gray-400 mb-6">Order ID: <span className="font-mono font-bold text-gray-700">{orderId}</span></p>

      <div className="bg-gray-50 rounded-2xl p-5 mb-8 text-left space-y-3">
        <div className="flex items-center gap-3">
          <Package className="h-5 w-5 text-brand-red shrink-0" />
          <div>
            <p className="font-semibold text-gray-800 text-sm">What happens next?</p>
          </div>
        </div>
        {[
          { step: '1', text: 'You will receive a confirmation call or WhatsApp message within 30 minutes.' },
          { step: '2', text: 'We will confirm your items are available and confirm delivery time.' },
          { step: '3', text: 'Your order is packed and dispatched. Lagos orders: 1–2 days.' },
          { step: '4', text: 'Your order arrives at your door!' },
        ].map(({ step, text }) => (
          <div key={step} className="flex items-start gap-3 pl-8">
            <div className="w-5 h-5 rounded-full bg-brand-red text-white text-xs flex items-center justify-center shrink-0 mt-0.5">{step}</div>
            <p className="text-sm text-gray-600">{text}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <Link href="/track-order">
          <Button className="w-full" variant="outline">Track My Order</Button>
        </Link>
        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '2348000000000'}?text=${encodeURIComponent(`Hi! I just placed order ${orderId}. Please confirm my order.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors"
        >
          <MessageCircle className="h-5 w-5" /> Chat on WhatsApp
        </a>
        <Link href="/shop">
          <Button variant="ghost" className="w-full">Continue Shopping</Button>
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
