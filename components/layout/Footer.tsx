import Link from 'next/link';
import { Package, Truck, Star, ShieldCheck } from 'lucide-react';

const features = [
  { Icon: Package, title: 'Fresh groceries delivered daily', desc: 'Fresh products prepared and delivered' },
  { Icon: Truck, title: 'Fast home delivery', desc: 'Fast delivery service designed.' },
  { Icon: Star, title: 'Products carefully selected', desc: 'Quality groceries selected with care.' },
  { Icon: ShieldCheck, title: 'Easy and secure shopping', desc: 'Simple ordering with secure payment.' },
];

function InstagramIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

const socialLinks = [
  { Icon: InstagramIcon, href: 'https://www.instagram.com/asiangroceryng?igsh=ZHJlZTE2amlsNnA5', label: 'Instagram' },
  { Icon: XIcon, href: 'https://x.com/asiangroceryng?s=21', label: 'X (Twitter)' },
  { Icon: YouTubeIcon, href: 'https://youtube.com', label: 'YouTube' },
  { Icon: FacebookIcon, href: 'https://facebook.com', label: 'Facebook' },
];

export function Footer() {
  return (
    <footer className="border-t border-[var(--border-color)] mt-16" style={{ background: 'var(--bg-offset)' }}>

      {/* Feature strip */}
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map(({ Icon, title, desc }) => (
          <div key={title} className="flex items-start gap-3">
            <div className="shrink-0 h-9 w-9 rounded-xl bg-[var(--surface)] border border-[var(--border-color)] flex items-center justify-center">
              <Icon className="h-4 w-4 text-[var(--green)]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--text-primary)] font-display leading-tight">{title}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5 font-display leading-tight">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-[var(--border-color)]" />

      {/* Social + Apps row */}
      <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Follow */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[var(--text-secondary)] font-display">Follow:</span>
          <div className="flex items-center gap-2">
            {socialLinks.map(({ Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="h-8 w-8 rounded-full bg-[var(--surface)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-all"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        {/* App badges */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[var(--text-secondary)] font-display">Our Apps:</span>
          <a
            href="#"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--text-primary)] text-[var(--bg)] text-xs font-semibold font-display hover:opacity-80 transition-opacity"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
            App Store
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--text-primary)] text-[var(--bg)] text-xs font-semibold font-display hover:opacity-80 transition-opacity"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M3.18 23.76c.3.16.63.24.97.24.4 0 .8-.1 1.15-.32l12.47-7.07-2.89-2.89-11.7 10.04zm-1.62-20.3A2 2 0 0 0 1 5v14a2 2 0 0 0 .56 1.54l.09.08 7.84-7.84v-.18L1.56 3.46zM20.89 9.69l-2.18-1.24-3.24 3.24 3.24 3.24 2.2-1.25c.63-.36 1.06-1.03 1.06-1.77.01-.75-.41-1.43-1.08-1.22zM4.15.57L16.62 7.64l-2.89 2.89L.86.57A1.93 1.93 0 0 1 2 .25c.37 0 .75.1 1.08.32z"/></svg>
            Google Play
          </a>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[var(--border-color)]" />

      {/* Copyright + payment */}
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-[var(--text-muted)] font-display">
          © {new Date().getFullYear()} <Link href="/" className="hover:text-[var(--text-secondary)] transition-colors">Asiangrocery</Link>. All Rights Reserved.
        </p>
        {/* Payment method icons */}
        <div className="flex items-center gap-3">
          {/* Mastercard */}
          <div className="flex items-center gap-0.5" aria-label="Mastercard">
            <div className="h-5 w-5 rounded-full bg-red-500 opacity-90" />
            <div className="h-5 w-5 rounded-full bg-amber-400 opacity-90 -ml-2" />
          </div>
          {/* Visa */}
          <span className="text-xs font-bold font-label tracking-tight" style={{ color: '#1434CB' }}>VISA</span>
          {/* PayPal */}
          <span className="text-xs font-bold font-label" style={{ color: '#003087' }}>Pay<span style={{ color: '#009cde' }}>Pal</span></span>
        </div>
      </div>
    </footer>
  );
}
