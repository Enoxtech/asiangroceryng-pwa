import Link from 'next/link';

const collections = [
  { name: 'Korean', flag: '🇰🇷', overlay: 'rgba(0,52,120,0.12)', tag: 'korean' },
  { name: 'Japanese', flag: '🇯🇵', overlay: 'rgba(188,0,45,0.12)', tag: 'japanese' },
  { name: 'Chinese', flag: '🇨🇳', overlay: 'rgba(222,41,16,0.12)', tag: 'chinese' },
  { name: 'Thai', flag: '🇹🇭', overlay: 'rgba(0,40,104,0.12)', tag: 'thai' },
  { name: 'Indian', flag: '🇮🇳', overlay: 'rgba(255,153,51,0.12)', tag: 'indian' },
];

export function CountryCollections() {
  return (
    <section className="px-4">
      <h2 className="section-title mb-3">Shop by Country</h2>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
        {collections.map(({ name, flag, overlay, tag }) => (
          <Link
            key={name}
            href={`/shop?tag=${tag}`}
            className="shrink-0 flex flex-col items-center justify-center gap-2 w-24 h-24 rounded-[24px] glass border border-[var(--border-color)] hover:scale-105 hover:shadow-md transition-all duration-200 group relative overflow-hidden"
          >
            {/* Tinted overlay */}
            <div className="absolute inset-0 rounded-[24px]" style={{ background: overlay }} />
            <span className="relative text-3xl" role="img" aria-label={`${name} products`}>{flag}</span>
            <span className="relative text-xs font-semibold text-[var(--text-primary)] font-display">{name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
