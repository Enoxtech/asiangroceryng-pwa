import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Product } from '@/types';
import { ProductCard } from '@/components/product/ProductCard';

interface ProductSectionProps {
  title: string;
  products: Product[];
  viewAllHref?: string;
  emoji?: string;
}

export function ProductSection({ title, products, viewAllHref = '/shop' }: ProductSectionProps) {
  if (products.length === 0) return null;

  return (
    <section className="px-4 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">{title}</h2>
        <Link
          href={viewAllHref}
          className="flex items-center gap-1 text-xs text-brand-red font-semibold hover:opacity-70 transition-opacity font-display"
        >
          View All
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Mobile: horizontal scroll — Tablet+: responsive grid */}
      <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-2 sm:grid sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 sm:gap-3 sm:overflow-visible -mx-1 px-1 sm:mx-0 sm:px-0">
        {products.slice(0, 12).map((product) => (
          <div key={product.id} className="shrink-0 w-36 sm:w-auto">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
