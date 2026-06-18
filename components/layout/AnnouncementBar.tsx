'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const messages = [
  { text: 'Weekly grocery deals are live — Discover new savings today.', link: '/deals', cta: 'Shop Now' },
  { text: 'Free delivery on all orders above ₦15,000 in Lagos!', link: '/shop', cta: 'Order Now' },
  { text: 'New Korean BBQ collection just arrived — limited stock!', link: '/shop?tag=korean', cta: 'View Now' },
];

export function AnnouncementBar() {
  const [current, setCurrent] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrent((c) => (c + 1) % messages.length), 4500);
    return () => clearInterval(timer);
  }, []);

  if (dismissed) return null;

  const msg = messages[current];

  return (
    <div className="relative bg-brand-red text-white text-xs sm:text-sm py-2.5 flex items-center justify-center gap-2 min-h-[40px]">
      <button
        onClick={() => setCurrent((c) => (c - 1 + messages.length) % messages.length)}
        className="absolute left-2 sm:left-4 p-1.5 hover:opacity-70 transition-opacity cursor-pointer"
        aria-label="Previous announcement"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2.5 text-center px-14">
        <span className="font-display font-medium leading-tight">{msg.text}</span>
        <Link
          href={msg.link}
          className="shrink-0 bg-white text-brand-red text-[11px] font-bold px-3 py-1 rounded-[9999px] hover:bg-white/90 transition-colors font-display whitespace-nowrap"
        >
          {msg.cta}
        </Link>
      </div>

      <button
        onClick={() => setCurrent((c) => (c + 1) % messages.length)}
        className="absolute right-10 sm:right-14 p-1.5 hover:opacity-70 transition-opacity cursor-pointer"
        aria-label="Next announcement"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      <button
        onClick={() => setDismissed(true)}
        className="absolute right-2 sm:right-4 p-1.5 hover:opacity-70 transition-opacity cursor-pointer"
        aria-label="Dismiss announcement"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
