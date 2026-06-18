import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function WalkInBanner() {
  return (
    <div className="px-3 sm:px-4">
      <div
        className="relative overflow-hidden rounded-[20px] sm:rounded-[28px]"
        style={{
          backgroundImage: 'url(/banners/walkin.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: 'clamp(160px, 35vw, 280px)',
        }}
      >
        {/* Left-to-right gradient overlay for legibility */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(90deg, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.40) 50%, rgba(0,0,0,0.15) 100%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 sm:px-10 py-8" style={{ minHeight: 'inherit' }}>
          <div className="flex-1 min-w-0">
            <p
              className="font-black uppercase leading-tight"
              style={{
                fontSize: 'clamp(1rem, 3.5vw, 1.65rem)',
                color: 'white',
                textShadow: '0 2px 14px rgba(0,0,0,0.7)',
              }}
            >
              Self Service Available<br />at Our Walk-In Store
            </p>
            <p className="text-sm mt-2 font-display" style={{ color: 'rgba(255,220,150,0.90)', textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>
              Visit us in Lagos — browse and shop in person
            </p>
          </div>

          <Link
            href="/contact"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all hover:scale-[1.04] active:scale-95 font-display"
            style={{
              background: 'rgba(245,200,66,0.18)',
              color: '#f5c842',
              border: '1.5px solid rgba(245,200,66,0.45)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          >
            Get Directions <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
