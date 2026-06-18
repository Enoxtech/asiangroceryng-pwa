'use client';

import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';
import { useWishlistStore } from '@/store/wishlistStore';
import { ProductGrid } from '@/components/product/ProductGrid';

export default function WishlistPage() {
  const { items } = useWishlistStore();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <Heart className="h-5 w-5 text-brand-red fill-current" />
        <h1 className="text-xl font-bold text-gray-900">Wishlist</h1>
        {items.length > 0 && <span className="text-sm text-gray-500">({items.length} {items.length === 1 ? 'item' : 'items'})</span>}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="text-5xl">💝</div>
          <div>
            <p className="font-semibold text-gray-800 text-lg">Your wishlist is empty</p>
            <p className="text-gray-500 text-sm mt-1">Save items you love by tapping the heart icon.</p>
          </div>
          <Link href="/shop" className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-red text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors">
            <ShoppingBag className="h-4 w-4" />
            Browse Products
          </Link>
        </div>
      ) : (
        <ProductGrid products={items} />
      )}
    </div>
  );
}
