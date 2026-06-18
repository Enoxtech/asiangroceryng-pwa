import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

interface ProductGridProps {
  products: Product[];
  className?: string;
}

export function ProductGrid({ products, className }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="h-16 w-16 rounded-[20px] bg-[var(--surface)] flex items-center justify-center mx-auto">
          <ShoppingBag className="h-8 w-8 text-[var(--text-muted)]" />
        </div>
        <div>
          <p className="font-semibold text-[var(--text-primary)] text-lg font-display">No products found</p>
          <p className="text-[var(--text-secondary)] text-sm mt-1 font-display">Try adjusting your filters or search terms</p>
        </div>
        <Link
          href="/shop"
          className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-brand-red text-white rounded-[44px] text-sm font-semibold hover:opacity-85 transition-opacity font-display"
        >
          <ShoppingBag className="h-4 w-4" />
          Browse All Products
        </Link>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3 ${className ?? ''}`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
