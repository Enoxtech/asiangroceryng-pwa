import Link from 'next/link';
import { Truck, Sparkles, ArrowRight } from 'lucide-react';

type BannerVariant = 'delivery' | 'korean' | 'snacks' | 'chalkboard';

interface PromoBannerProps {
  variant: BannerVariant;
}

// ── Standard coded banners ───────────────────────────────────────────────────

const codedConfig: Record<Exclude<BannerVariant, 'chalkboard'>, {
  bg: string;
  Icon: typeof Truck;
  eyebrow: string;
  headline: string;
  subline: string;
  cta: string;
  href: string;
  accent: string;
  blob: string;
}> = {
  delivery: {
    bg: 'linear-gradient(135deg, #2d6a4f 0%, #4F5343 100%)',
    Icon: Truck,
    eyebrow: 'LIMITED TIME OFFER',
    headline: 'Free Delivery',
    subline: 'On all orders above ₦15,000 in Lagos',
    cta: 'Order Now',
    href: '/shop',
    accent: '#CEBFA9',
    blob: 'rgba(206,191,169,0.18)',
  },
  korean: {
    bg: 'linear-gradient(135deg, #1a1814 0%, #2a2720 100%)',
    Icon: Sparkles,
    eyebrow: 'JUST ARRIVED',
    headline: 'Fresh Korean Collection',
    subline: 'Authentic Korean ingredients imported directly',
    cta: 'Explore Now',
    href: '/shop?tag=korean',
    accent: '#CEBFA9',
    blob: 'rgba(196,30,58,0.18)',
  },
  snacks: {
    bg: 'linear-gradient(135deg, #c41e3a 0%, #8B1429 100%)',
    Icon: Sparkles,
    eyebrow: 'TRENDING NOW',
    headline: 'Asian Snack Packs',
    subline: 'Try chips, crackers & candy from across Asia',
    cta: 'Shop Snacks',
    href: '/shop?category=snacks',
    accent: '#fff',
    blob: 'rgba(255,255,255,0.12)',
  },
};

function CodedBanner({ variant }: { variant: Exclude<BannerVariant, 'chalkboard'> }) {
  const { bg, Icon, eyebrow, headline, subline, cta, href, accent, blob } = codedConfig[variant];
  return (
    <div
      className="relative overflow-hidden rounded-[22px] px-6 sm:px-10 py-8 flex items-center gap-5"
      style={{ background: bg }}
    >
      <div className="absolute right-[-5%] top-[-40%] h-56 w-56 rounded-full blur-[60px] pointer-events-none" style={{ background: blob }} />
      <div className="shrink-0 h-12 w-12 rounded-[18px] hidden sm:flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.12)' }}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div className="flex-1 min-w-0 relative z-10">
        <p className="text-[11px] font-label uppercase tracking-widest mb-1" style={{ color: accent }}>{eyebrow}</p>
        <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight font-display">{headline}</h3>
        <p className="text-white/60 text-sm font-display mt-0.5">{subline}</p>
      </div>
      <Link
        href={href}
        className="relative z-10 shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold font-display whitespace-nowrap transition-all duration-200 hover:scale-[1.04] active:scale-95"
        style={{ background: 'rgba(255,255,255,0.14)', color: 'white', border: '1px solid rgba(255,255,255,0.22)' }}
      >
        {cta}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

// ── Chalkboard banner (uses actual chalkboard.png image) ────────────────────

function ChalkboardBanner() {
  return (
    <div
      className="relative overflow-hidden rounded-[22px]"
      style={{
        backgroundImage: 'url(/banners/chalkboard.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: 'clamp(200px, 45vw, 380px)',
      }}
    >
      {/* Subtle vignette so the image feels framed */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)' }}
      />

      {/* Bottom CTA */}
      <div className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-black text-sm uppercase tracking-widest transition-all hover:scale-[1.05] active:scale-95 whitespace-nowrap"
          style={{
            background: 'rgba(255,255,255,0.15)',
            color: 'white',
            border: '2px solid rgba(255,255,255,0.45)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}
        >
          Order Now <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

// ── Export ───────────────────────────────────────────────────────────────────

export function PromoBanner({ variant }: PromoBannerProps) {
  return (
    <div className="px-3 sm:px-4">
      {variant === 'chalkboard' ? <ChalkboardBanner /> : <CodedBanner variant={variant} />}
    </div>
  );
}
