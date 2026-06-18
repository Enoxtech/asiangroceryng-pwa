'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice } = useCartStore();
  const subtotal = totalPrice();
  const deliveryFee = subtotal > 0 ? 1500 : 0;
  const total = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 px-4 text-center">
        <div className="text-6xl">🛒</div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Your cart is empty</h2>
          <p className="text-gray-500 mt-2">Looks like you haven&apos;t added anything yet.</p>
        </div>
        <Link href="/shop">
          <Button size="lg">
            <ShoppingBag className="h-5 w-5" />
            Browse Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Cart</h1>

      <div className="space-y-3 mb-6">
        {items.map(({ product, quantity }) => (
          <div key={product.id} className="flex gap-3 bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-50 shrink-0">
              <Image src={product.images[0]} alt={product.name} fill className="object-cover" sizes="80px" />
            </div>
            <div className="flex-1 min-w-0">
              <Link href={`/shop/${product.slug}`} className="text-sm font-semibold text-gray-900 hover:text-brand-red line-clamp-2 block">
                {product.name}
              </Link>
              <p className="text-xs text-gray-400 mt-0.5">{product.weight} · {product.countryFlag}</p>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg overflow-hidden">
                  <button onClick={() => updateQuantity(product.id, quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                  <button onClick={() => updateQuantity(product.id, quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <span className="font-bold text-brand-red">{formatPrice(product.price * quantity)}</span>
              </div>
            </div>
            <button onClick={() => removeItem(product.id)} className="self-start p-1.5 text-gray-400 hover:text-red-500 transition-colors">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Coupon */}
      <div className="flex gap-2 mb-6">
        <input type="text" placeholder="Coupon code" className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-red" />
        <Button variant="outline" size="md">Apply</Button>
      </div>

      {/* Order summary */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3 mb-6">
        <h3 className="font-bold text-gray-900">Order Summary</h3>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Delivery fee</span>
          <span>{formatPrice(deliveryFee)}</span>
        </div>
        <div className="border-t pt-3 flex justify-between font-bold text-gray-900 text-base">
          <span>Total</span>
          <span className="text-brand-red">{formatPrice(total)}</span>
        </div>
      </div>

      <Link href="/checkout">
        <Button size="lg" className="w-full">Proceed to Checkout</Button>
      </Link>
      <Link href="/shop" className="block text-center text-sm text-gray-500 hover:text-gray-700 transition-colors mt-3">
        Continue Shopping
      </Link>
    </div>
  );
}
