import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function HeroBanner() {
  return (
    <div
      className="relative overflow-hidden rounded-[20px] sm:rounded-[28px] mx-3 sm:mx-4 mt-3 sm:mt-4"
      style={{
        backgroundImage: 'url(/banners/hero.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center top',
        minHeight: 'clamp(240px, 50vw, 500px)',
      }}
    >
      {/* Bottom gradient for CTA legibility */}
      <div
        className="absolute inset-x-0 bottom-0 h-36 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)' }}
      />

      {/* Shop Now CTA */}
      <div className="absolute bottom-5 sm:bottom-8 left-1/2 -translate-x-1/2">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.05] active:scale-95 whitespace-nowrap"
          style={{ background: 'rgba(255,255,255,0.95)', color: '#c41e3a', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
        >
          Shop Now <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
