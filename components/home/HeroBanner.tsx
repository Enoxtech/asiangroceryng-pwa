'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    image: '/banners/hero.png',
    cta: { label: 'Shop Now', href: '/shop' },
  },
  {
    image: '/banners/walkin.png',
    cta: { label: 'Visit Us', href: '/contact' },
  },
  {
    image: '/banners/chalkboard.png',
    cta: { label: 'Order Now', href: '/shop' },
  },
];

export function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCurrent((p) => (p + 1) % SLIDES.length), []);
  const prev = useCallback(() => setCurrent((p) => (p - 1 + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(next, 4800);
    return () => clearInterval(id);
  }, [paused, next]);

  return (
    <div
      className="relative overflow-hidden w-full"
      style={{ height: 'clamp(220px, 58vw, 580px)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {SLIDES.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            opacity: i === current ? 1 : 0,
            backgroundImage: `url(${slide.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            pointerEvents: i === current ? 'auto' : 'none',
          }}
          aria-hidden={i !== current}
        />
      ))}

      {/* Bottom gradient */}
      <div
        className="absolute inset-x-0 bottom-0 h-48 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)' }}
      />

      {/* CTA */}
      <div className="absolute bottom-10 sm:bottom-12 left-1/2 -translate-x-1/2 z-10">
        <Link
          href={SLIDES[current].cta.href}
          className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-black text-sm uppercase tracking-widest whitespace-nowrap transition-all hover:scale-105 active:scale-95"
          style={{ background: 'rgba(255,255,255,0.95)', color: '#c41e3a', boxShadow: '0 4px 24px rgba(0,0,0,0.35)' }}
        >
          {SLIDES[current].cta.label} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Prev arrow */}
      <button
        onClick={prev}
        aria-label="Previous slide"
        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90"
        style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)' }}
      >
        <ChevronLeft className="h-5 w-5 text-gray-800" />
      </button>

      {/* Next arrow */}
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-90"
        style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)' }}
      >
        <ChevronRight className="h-5 w-5 text-gray-800" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
        {SLIDES.map((_, i) => (
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
