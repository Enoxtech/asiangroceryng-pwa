import type { Metadata, Viewport } from 'next';
import { Manrope, Playfair_Display, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Footer } from '@/components/layout/Footer';
import { ToastContainer } from '@/components/ui/Toast';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  style: ['normal', 'italic'],
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  weight: ['400', '500', '600'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Asian Grocery NG', template: '%s | Asian Grocery NG' },
  description: 'Fresh Asian groceries delivered across Nigeria. Korean, Japanese, Chinese, Thai & more.',
  keywords: ['asian grocery', 'nigeria', 'korean food', 'japanese food', 'ramen', 'boba', 'kimchi'],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Asian Grocery NG',
    statusBarStyle: 'default',
  },
  openGraph: {
    title: 'Asian Grocery NG',
    description: 'Fresh Asian groceries delivered across Nigeria.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#4F5343',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${playfair.variable} ${jetbrains.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        {/* Anti-FOUC: set theme before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('agng-theme')||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t)}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-dvh flex flex-col antialiased">
        {/* Ambient background blobs — fixed, behind all content */}
        <div className="bg-ambient" aria-hidden="true">
          <div className="bg-blob bg-blob-1" />
          <div className="bg-blob bg-blob-2" />
          <div className="bg-blob bg-blob-3" />
        </div>
        <AnnouncementBar />
        <Header />
        <main className="flex-1 w-full max-w-[1440px] mx-auto">{children}</main>
        <Footer />
        <BottomNav />
        <CartDrawer />
        <ToastContainer />
      </body>
    </html>
  );
}
