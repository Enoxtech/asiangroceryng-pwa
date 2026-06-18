'use client';

import { X, ShoppingCart, Minus, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice } = useCartStore();
  const subtotal = totalPrice();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm flex flex-col animate-slide-in-right shadow-2xl border-l border-[var(--border-color)]"
        style={{ background: 'var(--surface-glass-strong)', backdropFilter: 'blur(32px) saturate(1.6)', WebkitBackdropFilter: 'blur(32px) saturate(1.6)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-brand-red" />
            <h2 className="font-bold text-[var(--text-primary)] font-display">Your Cart</h2>
            {items.length > 0 && (
              <span className="text-sm text-[var(--text-muted)] font-display">
                ({items.length} {items.length === 1 ? 'item' : 'items'})
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="h-8 w-8 flex items-center justify-center rounded-full glass border border-[var(--border-color)] transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Close cart"
          >
            <X className="h-4 w-4 text-[var(--text-secondary)]" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 py-16 text-center">
              <div className="h-20 w-20 rounded-[28px] glass border border-[var(--border-color)] flex items-center justify-center">
                <ShoppingCart className="h-8 w-8 text-[var(--text-muted)]" />
              </div>
              <div>
                <p className="font-semibold text-[var(--text-primary)] font-display">Your cart is empty</p>
                <p className="text-sm text-[var(--text-muted)] mt-1 font-display">Add some Asian groceries to get started!</p>
              </div>
              <Button onClick={closeCart} variant="outline" size="md">
                <Link href="/shop">Browse Products</Link>
              </Button>
            </div>
          ) : (
            items.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex gap-3 p-3 rounded-[20px] bg-[var(--surface)] border border-[var(--border-color)]"
              >
                <div className="relative w-16 h-16 rounded-[16px] overflow-hidden shrink-0 bg-[var(--surface-raised)]">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] line-clamp-2 leading-snug font-display">
                    {product.name}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5 font-label">{product.weight}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm font-bold text-brand-red font-label tabular-nums">
                      {formatPrice(product.price * quantity)}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="h-7 w-7 flex items-center justify-center rounded-full glass border border-[var(--border-color)] hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="h-3 w-3 text-[var(--text-secondary)]" />
                      </button>
                      <span className="text-sm font-semibold w-5 text-center text-[var(--text-primary)] font-label tabular-nums">
                        {quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        className="h-7 w-7 flex items-center justify-center rounded-full glass border border-[var(--border-color)] hover:scale-105 active:scale-95 transition-all duration-150 cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="h-3 w-3 text-[var(--text-secondary)]" />
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(product.id)}
                  className="self-start p-1.5 rounded-lg text-[var(--text-muted)] hover:text-brand-red transition-colors duration-150 cursor-pointer"
                  aria-label={`Remove ${product.name} from cart`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[var(--border-color)] px-4 py-4 space-y-3">
            {/* Coupon */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Coupon code"
                className="flex-1 px-4 py-2.5 text-sm bg-[var(--surface)] border border-[var(--border-color)] rounded-[44px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-display"
              />
              <button className="px-4 py-2 text-sm font-semibold text-[var(--green)] bg-[var(--surface)] border border-[var(--border-color)] rounded-[44px] hover:bg-[var(--surface-raised)] transition-colors cursor-pointer font-display">
                Apply
              </button>
            </div>

            {/* Order summary */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-[var(--text-secondary)] font-display">
                <span>Subtotal</span>
                <span className="font-label tabular-nums">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[var(--text-muted)] text-xs font-display">
                <span>Delivery fee</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between font-bold text-[var(--text-primary)] pt-2 border-t border-[var(--border-color)]">
                <span className="font-display">Total</span>
                <span className="text-brand-red font-label tabular-nums">{formatPrice(subtotal)}</span>
              </div>
            </div>

            <Link href="/checkout" onClick={closeCart} className="block">
              <Button className="w-full" size="lg">
                Proceed to Checkout
              </Button>
            </Link>
            <button
              onClick={closeCart}
              className="w-full text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors py-1 font-display cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
