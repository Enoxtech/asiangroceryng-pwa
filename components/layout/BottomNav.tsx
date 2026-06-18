'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Tag, ShoppingCart, User } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Home', Icon: Home },
  { href: '/shop', label: 'Shop', Icon: ShoppingBag },
  { href: '/deals', label: 'Deals', Icon: Tag },
  { href: '/cart', label: 'Cart', Icon: ShoppingCart, isCart: true },
  { href: '/account', label: 'Account', Icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const { totalItems } = useCartStore();
  const itemCount = totalItems();

  if (pathname.startsWith('/admin')) return null;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-[var(--border-color)] safe-area-pb">
      <div className="flex items-center justify-around px-2 py-1.5">
        {navItems.map(({ href, label, Icon, isCart }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all duration-200 min-w-[56px]',
                active
                  ? 'text-[var(--text-primary)] bg-[var(--surface)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              )}
            >
              <div className="relative">
                <Icon
                  className={cn('h-5 w-5 transition-all duration-200', active && 'stroke-[2.5]')}
                />
                {isCart && itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 flex items-center justify-center rounded-full bg-brand-red text-white text-[10px] font-bold font-label">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-semibold tracking-wide font-display">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
