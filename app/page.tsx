import { HeroBanner } from '@/components/home/HeroBanner';
import { WalkInBanner } from '@/components/home/WalkInBanner';
import { CategoryChips } from '@/components/home/CategoryChips';
import { ProductSection } from '@/components/home/ProductSection';
import { CountryCollections } from '@/components/home/CountryCollections';
import { InstallPrompt } from '@/components/home/InstallPrompt';
import { PromoBanner } from '@/components/home/PromoBanner';
import { TestimonialSlider } from '@/components/home/TestimonialSlider';
import { RecentlyViewed } from '@/components/home/RecentlyViewed';
import { getFeaturedProducts, getNewProducts, getSaleProducts } from '@/lib/queries';

export const revalidate = 60;

export default async function HomePage() {
  const [featured, newArrivals, deals] = await Promise.all([
    getFeaturedProducts(),
    getNewProducts(),
    getSaleProducts(),
  ]);

  return (
    <div className="pb-10">

      {/* ── BANNER 1: Red "SHOP NOW — ASIAN GROCERY" hero ── */}
      <HeroBanner />

      {/* ── Categories ──────────────────────────────────── */}
      <div className="mt-5">
        <CategoryChips />
      </div>

      {/* ── Products 1: Best Sellers ────────────────────── */}
      <div className="mt-8">
        <ProductSection title="Best Sellers" products={featured} viewAllHref="/shop?featured=true" />
      </div>

      {/* ── BANNER 2: Chalkboard "Satisfy Your Cravings" ── */}
      <div className="mt-8">
        <PromoBanner variant="chalkboard" />
      </div>

      {/* ── Products 2: New Arrivals ────────────────────── */}
      <div className="mt-8">
        <ProductSection title="New Arrivals" products={newArrivals} viewAllHref="/shop?isNew=true" />
      </div>

      {/* ── BANNER 3: Walk-in store ramen ───────────────── */}
      <div className="mt-8">
        <WalkInBanner />
      </div>

      {/* ── Products 3: Deals of the Week ───────────────── */}
      <div className="mt-8">
        <ProductSection title="Deals of the Week" products={deals} viewAllHref="/deals" />
      </div>

      {/* ── Testimonials ─────────────────────────────────── */}
      <div className="mt-8">
        <TestimonialSlider />
      </div>

      {/* ── Korean promo strip ───────────────────────────── */}
      <div className="mt-8">
        <PromoBanner variant="korean" />
      </div>

      {/* ── Country collections ──────────────────────────── */}
      <div className="mt-8">
        <CountryCollections />
      </div>

      {/* ── Recently Viewed ──────────────────────────────── */}
      <div className="mt-8">
        <RecentlyViewed />
      </div>

      {/* ── PWA Install prompt ───────────────────────────── */}
      <div className="mt-8 px-3 sm:px-4">
        <InstallPrompt />
      </div>
    </div>
  );
}
