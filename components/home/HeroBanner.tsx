'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAdminStore, BannerSlide } from '@/store/adminStore';

const DEFAULT_SLIDES: BannerSlide[] = [
  {
    id: 'banner-1',
    image: '/banners/hero.png',
    headline: 'Asia In Every Aisle',
    subtitle: 'Korean · Japanese · Thai · Chinese',
    ctaLabel: 'Shop Now',
    ctaHref: '/shop',
    transition: 'fade',
    align: 'left',
    enabled: true,
  },
  {
    id: 'banner-2',
    image: '/banners/walkin.png',
    headline: 'Visit Our Store',
    subtitle: 'Fresh arrivals every week',
    ctaLabel: 'Find Us',
    ctaHref: '/contact',
    transition: 'slide',
    align: 'center',
    enabled: true,
  },
  {
    id: 'banner-3',
    image: '/banners/chalkboard.png',
    headline: 'Fresh Deals Daily',
    subtitle: 'Save big on Asian favourites',
    ctaLabel: 'See Deals',
    ctaHref: '/deals',
    transition: 'zoom',
    align: 'right',
    enabled: true,
  },
];

const transitionClass: Record<string, string> = {
  fade:  'animate-hero-fade',
  slide: 'animate-hero-slide',
  zoom:  'animate-hero-zoom',
};

const alignStyle: Record<string, React.CSSProperties> = {
  left:   { alignItems: 'flex-start', textAlign: 'left' },
  center: { alignItems: 'center',     textAlign: 'center' },
  right:  { alignItems: 'flex-end',   textAlign: 'right' },
};

export function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [slides, setSlides] = useState<BannerSlide[]>(DEFAULT_SLIDES);

  // Read from admin store only on client (avoids SSR hydration mismatch)
  useEffect(() => {
    const syncSlides = (state: { banners: BannerSlide[] }) => {
      const enabled = state.banners.filter((b) => b.enabled);
      setSlides(enabled.length > 0 ? enabled : DEFAULT_SLIDES);
    };
    syncSlides(useAdminStore.getState());
    return useAdminStore.subscribe(syncSlides);
  }, []);

  // Reset current index if slides shrink
  useEffect(() => {
    if (current >= slides.length) setCurrent(0);
  }, [slides.length, current]);

  const next = useCallback(() => setCurrent((p) => (p + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (paused || slides.length < 2) return;
    const id = setInterval(next, 6500);
    return () => clearInterval(id);
  }, [paused, next, slides.length]);

  if (slides.length === 0) return null;
  const slide = slides[current];

  return (
    <div
      className="relative overflow-hidden w-full"
      style={{ height: 'clamp(220px, 58vw, 580px)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slide layers — active remounts on key change to re-trigger CSS animation */}
      {slides.map((s, i) =>
        i === current ? (
          <div
            key={`active-${i}-${current}`}
            className={`absolute inset-0 ${transitionClass[s.transition] ?? 'animate-hero-fade'}`}
            style={{
              backgroundImage: `url(${s.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        ) : (
          <div
            key={`inactive-${i}`}
            className="absolute inset-0 opacity-0 transition-opacity duration-500"
            style={{
              backgroundImage: `url(${s.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            aria-hidden
          />
        )
      )}

      {/* Gradient — stronger at bottom for text legibility */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.32) 52%, rgba(0,0,0,0.12) 100%)' }}
      />

      {/* Text overlay */}
      <div
        className="absolute bottom-14 sm:bottom-18 left-0 right-0 z-10 flex flex-col gap-2 px-6 sm:px-10 pointer-events-none"
        style={alignStyle[slide.align]}
      >
        <h2
          className="text-white font-black font-display text-2xl sm:text-4xl lg:text-5xl leading-tight drop-shadow-lg"
          style={{ maxWidth: '28rem' }}
        >
          {slide.headline}
        </h2>
        <p className="text-white/80 text-sm sm:text-base font-display drop-shadow" style={{ maxWidth: '22rem' }}>
          {slide.subtitle}
        </p>
        <Link
          href={slide.ctaHref}
          className="mt-2 pointer-events-auto inline-flex items-center gap-2 px-6 py-2.5 rounded-full font-black text-sm uppercase tracking-widest whitespace-nowrap transition-all hover:scale-105 active:scale-95 self-start"
          style={{ background: 'rgba(255,255,255,0.95)', color: '#c41e3a', boxShadow: '0 4px 24px rgba(0,0,0,0.35)' }}
        >
          {slide.ctaLabel} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Prev arrow */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90"
        style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(6px)', color: '#111827' }}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Next arrow */}
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90"
        style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(6px)', color: '#111827' }}
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="rounded-full transition-all duration-300"
            style={{
              height: '6px',
              width: i === current ? '24px' : '6px',
              background: i === current ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.45)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
