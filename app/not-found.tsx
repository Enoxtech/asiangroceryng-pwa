import Link from 'next/link';
import { ArrowRight, ShoppingBag, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-8xl mb-5 select-none" aria-hidden="true">🍜</div>

      <h1
        className="font-black text-[var(--text-primary)] mb-1"
        style={{ fontSize: 'clamp(3rem, 10vw, 5rem)', lineHeight: 1 }}
      >
        404
      </h1>

      <p className="text-xl font-bold text-[var(--text-primary)] mb-2 font-display">
        Page Not Found
      </p>
      <p className="text-[var(--text-muted)] mb-8 max-w-sm font-display leading-relaxed">
        This page may have moved or doesn&apos;t exist. Let&apos;s get you back to the good stuff.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-red text-white font-bold text-sm hover:bg-red-700 active:scale-95 transition-all font-display"
        >
          <ShoppingBag className="h-4 w-4" />
          Keep Shopping
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[var(--border-color)] text-[var(--text-primary)] font-bold text-sm hover:bg-[var(--surface)] active:scale-95 transition-all font-display"
        >
          <Home className="h-4 w-4" />
          Go Home
        </Link>
      </div>
    </div>
  );
}
