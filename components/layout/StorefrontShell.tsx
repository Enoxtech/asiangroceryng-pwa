'use client';

import { usePathname } from 'next/navigation';
import { AnnouncementBar } from './AnnouncementBar';
import { Header } from './Header';
import { Footer } from './Footer';
import { BottomNav } from './BottomNav';
import { QuickViewModal } from '@/components/product/QuickViewModal';

export function StorefrontShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  return (
    <>
      {!isAdmin && <AnnouncementBar />}
      {!isAdmin && <Header />}
      <main className="flex-1 w-full max-w-[1440px] mx-auto">{children}</main>
      {!isAdmin && <Footer />}
      {!isAdmin && <BottomNav />}
      {!isAdmin && <QuickViewModal />}
    </>
  );
}
