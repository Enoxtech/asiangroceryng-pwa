import Link from 'next/link';
import { Truck, ShieldCheck, Star, Users, MapPin, MessageCircle, ChefHat, Heart } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | Asian Grocery Nigeria',
  description: "Welcome to Asian Grocery Nigeria — Nigeria's premier destination for authentic Asian groceries from Japan, Korea, China, Vietnam and Thailand.",
};

const values = [
  {
    Icon: Star,
    title: 'Authentic Quality',
    desc: 'Every product is sourced directly from trusted suppliers across Japan, Korea, China, Vietnam and Thailand. We never compromise on authenticity — if it\'s on our shelf, it\'s the real thing.',
  },
  {
    Icon: ChefHat,
    title: 'Expert Cooking Guidance',
    desc: 'Our knowledgeable staff are passionate food lovers who can guide you through recipes, ingredient substitutions, and cooking tips — whether you\'re a beginner or a seasoned home chef.',
  },
  {
    Icon: Truck,
    title: 'Fast Nigeria-Wide Delivery',
    desc: 'We deliver to Lagos, Abuja, Port Harcourt and everywhere in between. Orders are carefully packed and dispatched quickly so your ingredients arrive fresh and ready to cook.',
  },
  {
    Icon: Heart,
    title: 'Community & Passion',
    desc: 'Built by food lovers, for food lovers. We serve thousands of families, food enthusiasts, restaurants and home cooks across Nigeria who share our love for Asian cuisine.',
  },
  {
    Icon: ShieldCheck,
    title: 'Safe & Secure Orders',
    desc: 'Every item is quality-checked before dispatch from our Lagos store. We take food safety seriously — all products are stored under proper conditions and within date.',
  },
  {
    Icon: Users,
    title: 'Dedicated Support',
    desc: 'Have a question? Our team is available via WhatsApp and email to help with orders, product enquiries, and anything else you need — before and after your purchase.',
  },
];

const stats = [
  { value: '200+', label: 'Products' },
  { value: '5,000+', label: 'Happy Customers' },
  { value: '12', label: 'Categories' },
  { value: '4.8★', label: 'Average Rating' },
];

const countries = [
  { flag: '🇯🇵', name: 'Japan', desc: 'Ramen, miso, matcha, wasabi, sushi essentials & more' },
  { flag: '🇰🇷', name: 'Korea', desc: 'Kimchi, gochujang, BBQ marinades, tteok & Korean snacks' },
  { flag: '🇨🇳', name: 'China', desc: 'Soy sauces, sesame oil, dumplings, dim sum & noodles' },
  { flag: '🇻🇳', name: 'Vietnam', desc: 'Pho noodles, fish sauce, rice paper & lemongrass pastes' },
  { flag: '🇹🇭', name: 'Thailand', desc: 'Curry pastes, coconut milk, pad thai kits & jasmine rice' },
  { flag: '🇮🇩', name: 'Indonesia', desc: 'Sambal, kecap manis, tempeh & Indonesian spice pastes' },
];

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-14">

      {/* Hero */}
      <div className="text-center space-y-4 pt-4">
        <p className="text-xs font-label uppercase tracking-widest text-[var(--accent)]">Our Story</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] leading-tight font-display">
          Welcome to the Asian Store Grocery!
        </h1>
        <p className="text-base text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed font-body">
          Here, we offer a wide range of products that cater to your Asian culinary needs. From traditional ingredients
          like rice, noodles, and various spices, to snacks, beverages, and even cooking utensils, we have it all.
        </p>
        <p className="text-base text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed font-body">
          Our store is designed to provide you with an authentic Asian shopping experience. Our shelves are stocked with
          products from different parts of Asia, including Japan, Korea, China, Vietnam, Thailand, and Indonesia. We take pride in
          offering you the best quality products at affordable prices.
        </p>
        <p className="text-base text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed font-body">
          Whether you&apos;re a seasoned home cook or just starting to explore Asian cuisine, our friendly staff are always
          ready to assist you in finding the right ingredients or products for your needs. We also offer cooking tips and
          recipe suggestions to help you create delicious and authentic Asian dishes.
        </p>
        <p className="text-base text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed font-body">
          Thank you for choosing Asian Store Grocery as your one-stop-shop for all your Asian grocery needs. We hope you
          enjoy your shopping experience with us!
        </p>
      </div>

      {/* Countries we source from */}
      <div>
        <p className="text-xs font-label uppercase tracking-widest text-center text-[var(--accent)] mb-6">Products Sourced From</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {countries.map((c) => (
            <div key={c.name} className="p-4 rounded-[20px] glass border border-[var(--border-color)] text-center group hover:border-[var(--accent)] transition-colors">
              <span className="text-3xl block mb-2">{c.flag}</span>
              <p className="font-bold text-sm text-[var(--text-primary)] font-display">{c.name}</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-1 leading-relaxed font-display hidden sm:block">{c.desc}</p>
            </div>
          ))}
        </div>
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

      {/* Values grid */}
      <div>
        <p className="text-xs font-label uppercase tracking-widest text-center text-[var(--accent)] mb-6">What We Stand For</p>
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
      </div>

      {/* Staff / Cooking Tips section */}
      <div className="rounded-[32px] overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a1814 0%, #2a2720 100%)' }}>
        <div className="px-8 py-12 sm:py-14 space-y-5">
          <p className="text-xs font-label uppercase tracking-widest" style={{ color: 'var(--accent)' }}>Our Team</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-display">More Than Just a Grocery Store</h2>
          <p className="text-white/60 max-w-lg text-sm leading-relaxed font-display">
            At Asian Grocery Nigeria, we believe shopping for ingredients should be an inspiring experience. Our staff don&apos;t
            just process orders — they&apos;re passionate about Asian food and culture, and love sharing that knowledge with you.
          </p>
          <p className="text-white/60 max-w-lg text-sm leading-relaxed font-display">
            Need advice on which miso to pick for your ramen? Unsure which Korean chilli paste works best for your recipe?
            Curious about the difference between Vietnamese and Thai fish sauce? Just ask — our team is always ready to help
            with cooking tips, product recommendations, and recipe ideas.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-[44px] text-sm font-bold font-display transition-all hover:scale-[1.03] active:scale-95"
              style={{ background: 'var(--accent)', color: '#111827' }}
            >
              Browse Products
            </Link>
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '2348000000000'}?text=${encodeURIComponent('Hi! I need help choosing some products.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-[44px] text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition-all font-display"
            >
              <MessageCircle className="h-4 w-4" /> Ask Our Team
            </a>
          </div>
        </div>
      </div>

      {/* Mission statement */}
      <div className="text-center space-y-3 py-4">
        <p className="text-xs font-label uppercase tracking-widest text-[var(--accent)]">Our Mission</p>
        <blockquote className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] font-display leading-relaxed max-w-2xl mx-auto">
          &ldquo;To make authentic Asian flavours accessible to every kitchen in Nigeria.&rdquo;
        </blockquote>
        <p className="text-sm text-[var(--text-secondary)] max-w-xl mx-auto font-display">
          We started Asian Grocery Nigeria because we knew how hard it was to find genuine Asian ingredients locally. Today,
          we&apos;re proud to serve thousands of customers who trust us to bring them the real thing — fresh, authentic, and always reliable.
        </p>
      </div>

      {/* Location card */}
      <div className="flex items-center gap-4 p-5 rounded-[24px] glass border border-[var(--border-color)]">
        <div className="h-10 w-10 rounded-[16px] bg-red-50 flex items-center justify-center shrink-0">
          <MapPin className="h-5 w-5 text-brand-red" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-[var(--text-primary)] font-display">Store F11, Ikeja Town-Square, Lagos</p>
          <p className="text-sm text-[var(--text-secondary)] font-display">
            131 Obafemi Awolowo Way, Ikeja · Pickup: 12:00PM–4:00PM Mon–Sat · Delivering nationwide
          </p>
        </div>
        <a
          href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '2348000000000'}?text=${encodeURIComponent('Hi! I have a question about Asian Grocery Nigeria.')}`}
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
