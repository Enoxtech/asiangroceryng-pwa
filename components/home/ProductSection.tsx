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

      {/* Full grid — 2 cols mobile, more on wider screens */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3">
        {products.slice(0, 12).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
