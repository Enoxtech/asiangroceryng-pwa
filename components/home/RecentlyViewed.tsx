'use client';

import { useRecentlyViewedStore } from '@/store/recentlyViewedStore';
import { ProductCard } from '@/components/product/ProductCard';

export function RecentlyViewed() {
  const { items } = useRecentlyViewedStore();
  if (items.length === 0) return null;

  return (
    <section className="px-4">
      <h2 className="section-title mb-4">Recently Viewed</h2>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
        {items.map((product) => (
          <div key={product.id} className="shrink-0 w-40">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
