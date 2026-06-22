import Link from 'next/link';
import {
  Coffee, Utensils, ChefHat, GlassWater, Leaf, Snowflake,
  Wheat, Box, UtensilsCrossed, ShoppingBasket, FlaskConical,
  Cookie, ShoppingBag,
} from 'lucide-react';
import { getAllCategories } from '@/lib/queries';

const categoryIcons: Record<string, React.ElementType> = {
  boba: Coffee,
  chopsticks: Utensils,
  cookwares: ChefHat,
  drinks: GlassWater,
  'fresh-produce': Leaf,
  'frozen-products': Snowflake,
  grains: Wheat,
  molds: Box,
  'noodles-ramen': UtensilsCrossed,
  'pantry-staples': ShoppingBasket,
  'sauces-condiments': FlaskConical,
  snacks: Cookie,
  wholesale: Box,
};

export async function CategoryChips() {
  const categories = await getAllCategories();
  const featured = categories.filter((c) =>
    ['boba', 'noodles-ramen', 'drinks', 'pantry-staples', 'sauces-condiments', 'frozen-products', 'cookwares', 'grains', 'snacks', 'wholesale'].includes(c.slug)
  );

  return (
    <section className="px-4">
      <h2 className="section-title mb-3">Shop by Category</h2>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
        {featured.map((cat) => {
          const Icon = categoryIcons[cat.slug] ?? ShoppingBag;
          return (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="flex flex-col items-center gap-2 shrink-0 group"
            >
              <div className="w-16 h-16 rounded-[24px] glass border border-[var(--border-color)] flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all duration-200">
                <Icon className="h-6 w-6" style={{ color: 'var(--text-secondary)' }} aria-hidden="true" />
              </div>
              <span className="text-[11px] text-[var(--text-secondary)] font-medium font-display text-center w-16 leading-tight">
                {cat.name}
              </span>
            </Link>
          );
        })}

        {/* View All */}
        <Link
          href="/shop"
          className="flex flex-col items-center gap-2 shrink-0 group"
        >
          <div className="w-16 h-16 rounded-[24px] flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all duration-200" style={{ background: 'var(--green)' }}>
            <ShoppingBag className="h-6 w-6 text-white" />
          </div>
          <span className="text-[11px] text-[var(--text-secondary)] font-medium font-display text-center w-16 leading-tight">View All</span>
        </Link>
      </div>
    </section>
  );
}
