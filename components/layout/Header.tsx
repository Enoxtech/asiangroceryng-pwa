'use client';

import Link from 'next/link';
import { ShoppingCart, Search, Menu, MessageCircle, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { getWhatsAppSupportUrl } from '@/lib/utils';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ThemeToggle } from './ThemeToggle';
import { categories } from '@/data/categories';
import { UserNotifications } from '@/components/ui/UserNotifications';

export function Header() {
  const { totalItems, openCart } = useCartStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  const itemCount = totalItems();

  return (
    <header className="sticky top-0 z-40 glass-strong border-b border-[var(--border-color)]">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 max-w-7xl mx-auto">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="relative h-10 w-10 shrink-0 group-hover:scale-105 transition-transform duration-200">
            <Image
              src="/logo.png"
              alt="Asian Grocery Nigeria"
              fill
              className="object-contain logo-adaptive"
              priority
            />
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="text-sm font-bold text-[var(--text-primary)] tracking-tight font-display">Asian Grocery</p>
            <p className="text-[10px] font-semibold text-[var(--accent)] uppercase tracking-widest leading-none font-label">Exploring Asia Through Food</p>
          </div>
        </Link>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ramen, kimchi, boba..."
              className="w-full pl-10 pr-4 py-2.5 rounded-[44px] bg-[var(--surface)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all duration-200 font-display"
            />
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          <a
            href={getWhatsAppSupportUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-[44px] text-[var(--green)] hover:bg-[var(--surface)] transition-colors text-sm font-medium font-display"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Chat</span>
          </a>
          <Link
            href="/account"
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-[44px] text-[var(--text-secondary)] hover:bg-[var(--surface)] transition-colors text-sm font-medium font-display"
            aria-label="My account"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
            <span>Account</span>
          </Link>

          <ThemeToggle />

          <UserNotifications />

          <button
            onClick={openCart}
            className="relative h-9 w-9 flex items-center justify-center rounded-full glass border border-[var(--border-color)] transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Open cart"
          >
            <ShoppingCart className="h-4 w-4 text-[var(--text-secondary)]" />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-5 w-5 flex items-center justify-center rounded-full bg-brand-red text-white text-xs font-bold font-label">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="h-9 w-9 flex items-center justify-center rounded-full glass border border-[var(--border-color)] transition-all duration-200 hover:scale-105 active:scale-95 lg:hidden cursor-pointer"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen
              ? <X className="h-4 w-4 text-[var(--text-secondary)]" />
              : <Menu className="h-4 w-4 text-[var(--text-secondary)]" />}
          </button>
        </div>
      </div>

      {/* Desktop nav */}
      <nav className="hidden lg:flex items-center gap-6 px-6 py-2 border-t border-[var(--border-color)] max-w-7xl mx-auto text-sm">
        {[
          { href: '/shop', label: 'All Products', primary: true },
          { href: '/shop?category=noodles-ramen', label: 'Noodles' },
          { href: '/shop?category=boba', label: 'Boba' },
          { href: '/shop?category=snacks', label: 'Snacks' },
          { href: '/shop?category=drinks', label: 'Drinks' },
          { href: '/shop?category=sauces-condiments', label: 'Sauces' },
          { href: '/shop?category=frozen-products', label: 'Frozen' },
        ].map(({ href, label, primary }) => (
          <Link
            key={href}
            href={href}
            className={`transition-colors duration-150 font-display ${primary
              ? 'font-semibold text-[var(--text-primary)] hover:text-[var(--green)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {label}
          </Link>
        ))}
        <Link
          href="/deals"
          className="font-semibold text-brand-red hover:opacity-75 transition-opacity font-display"
        >
          Hot Deals
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <Link href="/track-order" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors font-display">Track Order</Link>
          <Link href="/contact" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors font-display">Contact</Link>
        </div>
      </nav>



      {/* ── MOBILE SIDEBAR DRAWER ─────────────────────────────────── */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[59] bg-black/50 animate-fade-in"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer panel — z-[60] beats BottomNav (z-40) and InstallPrompt (z-[61]) */}
          <div
            className="fixed top-0 left-0 bottom-0 z-[60] w-[82vw] max-w-xs flex flex-col animate-slide-in-left lg:hidden overflow-hidden"
            style={{ background: 'var(--bg)', boxShadow: '6px 0 40px rgba(0,0,0,0.35)' }}
          >
            {/* Close button */}
            <div className="px-5 pt-5 pb-3 shrink-0">
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="p-1 -ml-1 rounded-lg hover:bg-[var(--surface)] transition-colors cursor-pointer"
              >
                <X className="h-5 w-5 text-[var(--text-primary)]" />
              </button>
            </div>

            {/* Scrollable nav */}
            <nav className="flex-1 overflow-y-auto px-5 scrollbar-hide min-h-0">
              {/* Fixed top pages */}
              {[
                { href: '/', label: 'Home' },
                { href: '/shop', label: 'Shop' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="block py-[14px] text-[17px] font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] hover:text-brand-red transition-colors"
                >
                  {label}
                </Link>
              ))}

              {/* All categories */}
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/shop?category=${cat.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="block py-[14px] text-[17px] font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] hover:text-brand-red transition-colors"
                >
                  {cat.name}
                </Link>
              ))}

              {/* Fixed bottom pages */}
              {[
                { href: '/about', label: 'About Us' },
                { href: '/contact', label: 'Contact Us' },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="block py-[14px] text-[17px] font-bold text-[var(--text-primary)] border-b border-[var(--border-color)] hover:text-brand-red transition-colors"
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Contact info — always pinned at bottom, extra padding clears phone/browser UI */}
            <div
              className="shrink-0 px-5 pt-4"
              style={{
                borderTop: '1px solid var(--border-color)',
                paddingBottom: 'calc(88px + env(safe-area-inset-bottom, 0px))',
              }}
            >
              <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">
                <span className="font-semibold text-[var(--text-secondary)]">Address:</span> Store F11 Ikeja Town-Square Alausa
              </p>
              <p className="text-[13px] mt-2" style={{ color: '#c41e3a' }}>
                <span className="font-semibold">Phone:</span>{' '}
                <a href="tel:+2347076930636" className="hover:underline">
                  +2347076930636
                </a>
              </p>
              <p className="text-[13px] mt-1.5" style={{ color: '#c41e3a' }}>
                <span className="font-semibold">Email:</span>{' '}
                <a href="mailto:asiangroceryng@gmail.com" className="hover:underline">
                  asiangroceryng@gmail.com
                </a>
              </p>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
