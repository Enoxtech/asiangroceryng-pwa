import Link from 'next/link';
import { Truck, ShieldCheck, Star, Users, MapPin, MessageCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: "Learn the story behind Asian Grocery NG — Nigeria's trusted source for authentic Asian groceries.",
};

const values = [
  { Icon: Star, title: 'Authentic Quality', desc: 'Every product is sourced directly from trusted suppliers across Asia. We never compromise on authenticity.' },
  { Icon: Truck, title: 'Nigeria-Wide Delivery', desc: 'We deliver to Lagos, Abuja, Port Harcourt and everywhere in between — fast and reliably.' },
  { Icon: ShieldCheck, title: 'Safe & Secure Orders', desc: 'Your orders are carefully packed and quality-checked before dispatch from our Lagos warehouse.' },
  { Icon: Users, title: 'Community First', desc: 'Built by food lovers, for food lovers. We serve thousands of families and food enthusiasts across Nigeria.' },
];

const stats = [
  { value: '200+', label: 'Products' },
  { value: '5,000+', label: 'Happy Customers' },
  { value: '12', label: 'Categories' },
  { value: '4.8★', label: 'Average Rating' },
];

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-14">

      {/* Hero section */}
      <div className="text-center space-y-4 pt-4">
        <p className="text-xs font-label uppercase tracking-widest text-[var(--accent)]">Our Story</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] leading-tight font-display">
          Bringing Asia&apos;s Finest<br />Flavours to Nigeria
        </h1>
        <p className="text-base text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed font-body italic">
          Asian Grocery NG was born from a simple craving — authentic Asian ingredients, available right here in Nigeria. We&apos;ve grown from a passion project into the country&apos;s most trusted Asian grocery destination.
        </p>
      </div>

      {/* Values grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {values.map(({ Icon, title, desc }) => (
          <div key={title} className="p-6 rounded-[28px] glass border border-[var(--border-color)]">
            <div className="h-10 w-10 rounded-[16px] flex items-center justify-center mb-4" style={{ background: 'var(--green)', color: 'white' }}>
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-[var(--text-primary)] mb-1.5 font-display">{title}</h3>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed font-display">{desc}</p>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        {stats.map(({ value, label }) => (
          <div key={label} className="p-5 rounded-[24px] bg-[var(--surface)] border border-[var(--border-color)]">
            <p className="text-2xl font-bold text-[var(--text-primary)] font-label">{value}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1 font-display">{label}</p>
          </div>
        ))}
      </div>

      {/* Story section */}
      <div className="rounded-[32px] overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1814 0%, #2a2720 100%)' }}>
        <div className="px-8 py-12 sm:py-14 text-center space-y-4">
          <p className="text-xs font-label uppercase tracking-widest" style={{ color: 'var(--accent)' }}>Why Choose Us</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">Your Asian Kitchen, Delivered</h2>
          <p className="text-white/55 max-w-lg mx-auto text-sm leading-relaxed font-display">
            From Japanese ramen to Korean BBQ, Chinese sauces to Thai curry paste — we curate only the best. Every product is checked for quality, freshness and authenticity before it reaches you.
          </p>
          <div className="flex flex-wrap gap-3 justify-center pt-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-[44px] text-sm font-bold font-display transition-all hover:scale-[1.03] active:scale-95"
              style={{ background: 'var(--accent)', color: '#111827' }}
            >
              Browse Products
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-[44px] text-sm font-semibold bg-white/10 text-white border border-white/15 hover:bg-white/18 transition-all font-display"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      {/* Location card */}
      <div className="flex items-center gap-4 p-5 rounded-[24px] glass border border-[var(--border-color)]">
        <div className="h-10 w-10 rounded-[16px] bg-red-50 flex items-center justify-center shrink-0">
          <MapPin className="h-5 w-5 text-brand-red" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[var(--text-primary)] font-display">Based in Lagos, Nigeria</p>
          <p className="text-sm text-[var(--text-secondary)] font-display">Delivering nationwide — Lagos, Abuja, Port Harcourt &amp; more.</p>
        </div>
        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '2348000000000'}?text=${encodeURIComponent('Hi! I have a question about Asian Grocery NG.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--green)] hover:opacity-70 transition-opacity font-display"
        >
          <MessageCircle className="h-4 w-4" />
          Chat
        </a>
      </div>
    </div>
  );
}
