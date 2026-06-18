'use client';

import { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const testimonials = [
  {
    quote: "Shopping here has been a smooth and reliable experience every time. The product quality is great and the selection is always fresh. It makes daily grocery shopping simple and enjoyable for our family.",
    name: 'Patricia Gilbert',
    role: 'Verified Buyer',
    rating: 5,
  },
  {
    quote: "I've been ordering Korean ingredients from Asian Grocery NG for months and I'm always impressed. The prices are fair, delivery to Abuja is surprisingly fast, and the packaging keeps everything fresh.",
    name: 'David Okafor',
    role: 'Verified Buyer',
    rating: 5,
  },
  {
    quote: "The boba tea kits are fantastic! Everything arrived well-packaged and tasted authentic. My kids now make bubble tea at home every weekend. We're loyal customers for life.",
    name: 'Amaka Johnson',
    role: 'Verified Buyer',
    rating: 5,
  },
  {
    quote: "Best place to find authentic Japanese and Chinese grocery products in Nigeria. The website is easy to use, WhatsApp support is fast, and my orders always arrive on time.",
    name: 'Chukwuemeka Eze',
    role: 'Verified Buyer',
    rating: 5,
  },
];

export function TestimonialSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % testimonials.length), 5500);
    return () => clearInterval(timer);
  }, []);

  const t = testimonials[current];

  return (
    <section className="px-4 py-2">
      <div className="relative max-w-3xl mx-auto rounded-[32px] border border-[var(--border-color)] overflow-hidden px-8 sm:px-16 py-12 text-center" style={{ background: 'var(--bg-offset)' }}>

        {/* Prev */}
        <button
          onClick={() => setCurrent((c) => (c - 1 + testimonials.length) % testimonials.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-full glass border border-[var(--border-color)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="h-4 w-4 text-[var(--text-muted)]" />
        </button>

        {/* Next */}
        <button
          onClick={() => setCurrent((c) => (c + 1) % testimonials.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-full glass border border-[var(--border-color)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
          aria-label="Next testimonial"
        >
          <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
        </button>

        <div key={current} className="animate-fade-up">
          <blockquote className="text-base sm:text-lg leading-relaxed text-[var(--text-primary)] font-body italic mb-6">
            &ldquo;{t.quote}&rdquo;
          </blockquote>

          <div className="flex items-center justify-center gap-1 mb-5">
            {Array.from({ length: t.rating }).map((_, i) => (
              <Star key={i} className="h-4 w-4 text-amber-400 fill-current" />
            ))}
          </div>

          <p className="text-lg font-body italic mb-1" style={{ color: 'var(--green)' }}>{t.name}</p>
          <p className="text-[11px] font-label uppercase tracking-widest text-[var(--text-muted)]">{t.role}</p>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300 cursor-pointer',
                i === current ? 'w-6 bg-[var(--green)]' : 'w-1.5 bg-[var(--border-strong)]'
              )}
              aria-label={`Testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
