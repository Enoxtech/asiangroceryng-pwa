'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, Package, ShoppingBag, Users,
  Settings, LogOut, ChevronRight, Store, ImageIcon, LayoutGrid,
} from 'lucide-react';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { AdminNotifications } from '@/components/ui/AdminNotifications';

const navItems = [
  { href: '/admin', label: 'Dashboard', Icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Products', Icon: Package },
  { href: '/admin/orders', label: 'Orders', Icon: ShoppingBag },
  { href: '/admin/banners', label: 'Banners', Icon: ImageIcon },
  { href: '/admin/categories', label: 'Categories', Icon: LayoutGrid },
  { href: '/admin/customers', label: 'Customers', Icon: Users },
  { href: '/admin/settings', label: 'Settings', Icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user?.role !== 'admin') {
      router.replace('/login?from=admin');
    }
  }, [mounted, user, router]);

  if (!mounted || user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="h-8 w-8 rounded-full border-2 border-brand-red border-t-transparent animate-spin" />
      </div>
    );
  }

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0f0e0b' }}>
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r" style={{ background: '#161411', borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="p-4 border-b flex items-center gap-2.5" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="relative h-9 w-9 shrink-0">
            <Image src="/logo.png" alt="Asian Grocery NG" fill className="object-contain" />
          </div>
          <div>
            <p className="text-xs font-bold text-white font-display">Asian Grocery NG</p>
            <p className="text-[10px] text-red-400 font-label uppercase tracking-wide">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(({ href, label, Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive(href, exact)
                  ? 'bg-brand-red/15 text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
              {isActive(href, exact) && <ChevronRight className="h-3 w-3 ml-auto text-brand-red" />}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t space-y-1" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors">
            <Store className="h-4 w-4" /> View Store
          </Link>
          <button
            onClick={() => { logout(); router.push('/login'); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="border-b px-5 py-3 flex items-center justify-between shrink-0" style={{ background: '#161411', borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            {/* Mobile logo */}
            <div className="relative h-7 w-7 lg:hidden shrink-0">
              <Image src="/logo.png" alt="Asian Grocery NG" fill className="object-contain" />
            </div>
            <p className="font-bold text-white text-sm lg:hidden font-display">Admin</p>
          </div>

          {/* Mobile nav */}
          <nav className="flex lg:hidden items-center gap-2 overflow-x-auto scrollbar-hide">
            {navItems.map(({ href, label, exact }) => (
              <Link key={href} href={href}
                className={`shrink-0 px-3 py-1.5 text-xs rounded-lg font-medium transition-colors ${
                  isActive(href, exact) ? 'bg-brand-red text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <AdminNotifications />
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-white font-display">{user.name}</p>
              <p className="text-[10px] text-gray-500 font-display">{user.email}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-brand-red text-white flex items-center justify-center text-sm font-bold shrink-0">
              {user.name[0]}
            </div>
            <button
              onClick={() => { logout(); router.push('/login'); }}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors font-display"
            >
              <LogOut className="h-3.5 w-3.5" /> Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-5 overflow-auto" style={{ background: '#0f0e0b' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
