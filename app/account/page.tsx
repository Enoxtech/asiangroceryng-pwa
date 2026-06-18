'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn, Package, Heart, MapPin, User, LogOut, ChevronRight, ShoppingBag, Clock } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { formatPrice, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

const mockOrders = [
  { id: 'AGNG-001234', date: '2024-07-10', total: 9600, status: 'delivered', items: 3 },
  { id: 'AGNG-001189', date: '2024-06-28', total: 5500, status: 'shipped', items: 2 },
  { id: 'AGNG-001102', date: '2024-06-15', total: 12300, status: 'delivered', items: 5 },
];

const statusMap: Record<string, 'success' | 'warning' | 'default'> = {
  delivered: 'success',
  shipped: 'warning',
  pending: 'default',
  processing: 'default',
};

// ── LOGIN FORM ────────────────────────────────────────────────────────────────

function LoginPanel() {
  const { login } = useAuthStore();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) setError(result.error || 'Login failed');
    else if (email === 'admin@asiangroceryng.com') router.push('/admin');
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <div className="h-14 w-14 rounded-[20px] flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--green)' }}>
          <User className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] font-display">My Account</h1>
        <p className="text-sm text-[var(--text-muted)] font-display mt-0.5">Sign in to view your orders & profile</p>
      </div>

      <div className="p-6 rounded-[28px] glass border border-[var(--border-color)] space-y-4">
        {error && (
          <div className="p-3 rounded-xl text-sm font-display" style={{ background: 'rgba(196,30,58,0.1)', color: '#ef4444', border: '1px solid rgba(196,30,58,0.2)' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-label uppercase tracking-wide text-[var(--text-muted)] mb-1.5">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-[14px] bg-[var(--surface)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-display" />
          </div>
          <div>
            <label className="block text-xs font-label uppercase tracking-wide text-[var(--text-muted)] mb-1.5">Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                className="w-full px-4 py-3 pr-11 rounded-[14px] bg-[var(--surface)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-display" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-[44px] bg-brand-red text-white text-sm font-bold font-display transition-all hover:opacity-90 active:scale-95 disabled:opacity-60">
            {loading ? <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> : <LogIn className="h-4 w-4" />}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>

      {/* Demo hint */}
      <div className="mt-4 p-4 rounded-[18px] border border-[var(--border-color)] bg-[var(--surface)] text-center">
        <p className="text-[10px] font-label uppercase tracking-widest text-[var(--text-muted)] mb-2">Demo credentials</p>
        <p className="text-xs text-[var(--text-secondary)] font-display">
          <span className="font-semibold">Customer:</span> demo@customer.com / Demo@2024
        </p>
        <Link href="/login" className="mt-2 inline-block text-xs font-semibold text-brand-red font-display hover:opacity-75">
          Or go to login page →
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { href: '/account/orders', Icon: Package, label: 'Orders' },
          { href: '/wishlist', Icon: Heart, label: 'Wishlist' },
          { href: '/track-order', Icon: MapPin, label: 'Track' },
        ].map(({ href, Icon, label }) => (
          <Link key={href} href={href}
            className="flex flex-col items-center gap-2 p-4 rounded-[18px] border border-[var(--border-color)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-brand-red hover:border-brand-red transition-all font-display">
            <Icon className="h-5 w-5" />
            <span className="text-xs font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── USER DASHBOARD ────────────────────────────────────────────────────────────

function UserDashboard() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const { items: wishlistItems } = useWishlistStore();

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Profile card */}
      <div className="rounded-[28px] glass border border-[var(--border-color)] p-6 flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-brand-red text-white flex items-center justify-center text-xl font-bold shrink-0">
          {user.name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-[var(--text-primary)] text-lg font-display">{user.name}</h2>
          <p className="text-sm text-[var(--text-muted)] font-display">{user.email}</p>
          {user.phone && <p className="text-sm text-[var(--text-muted)] font-display">{user.phone}</p>}
        </div>
        <button
          onClick={() => { logout(); router.push('/'); }}
          className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[var(--text-muted)] hover:text-red-500 border border-[var(--border-color)] hover:border-red-200 transition-all font-display"
        >
          <LogOut className="h-3.5 w-3.5" /> Logout
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { Icon: ShoppingBag, label: 'Orders', value: mockOrders.length, href: '/account/orders' },
          { Icon: Heart, label: 'Wishlist', value: wishlistItems.length, href: '/wishlist' },
          { Icon: Clock, label: 'Pending', value: '0', href: '/account/orders' },
        ].map(({ Icon, label, value, href }) => (
          <Link key={label} href={href}
            className="rounded-[20px] glass border border-[var(--border-color)] p-4 text-center hover:border-[var(--border-strong)] transition-all group">
            <Icon className="h-5 w-5 mx-auto mb-2 text-[var(--text-muted)] group-hover:text-brand-red transition-colors" />
            <p className="text-xl font-bold text-[var(--text-primary)] font-label">{value}</p>
            <p className="text-xs text-[var(--text-muted)] font-display">{label}</p>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-[var(--text-primary)] font-display">Recent Orders</h3>
          <Link href="/account/orders" className="text-xs font-semibold text-brand-red hover:opacity-75 font-display flex items-center gap-1">
            View all <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="space-y-2.5">
          {mockOrders.map((order) => (
            <div key={order.id} className="rounded-[20px] glass border border-[var(--border-color)] p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-[var(--text-primary)] font-label">{order.id}</p>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5 font-display">{formatDate(order.date)} · {order.items} items</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Badge variant={statusMap[order.status] ?? 'default'} className="capitalize text-[10px]">{order.status}</Badge>
                <span className="text-sm font-bold text-brand-red font-label">{formatPrice(order.total)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Saved address */}
      {user.address && (
        <div className="rounded-[20px] glass border border-[var(--border-color)] p-4 flex items-start gap-3">
          <div className="h-9 w-9 rounded-[14px] flex items-center justify-center shrink-0" style={{ background: 'var(--surface-raised)' }}>
            <MapPin className="h-4 w-4 text-[var(--text-secondary)]" />
          </div>
          <div>
            <p className="text-[10px] font-label uppercase tracking-widest text-[var(--text-muted)] mb-0.5">Saved Address</p>
            <p className="text-sm font-medium text-[var(--text-primary)] font-display">{user.address}</p>
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { href: '/shop', Icon: ShoppingBag, label: 'Continue Shopping', desc: 'Browse all products' },
          { href: '/track-order', Icon: MapPin, label: 'Track Order', desc: 'Check delivery status' },
          { href: '/contact', Icon: Heart, label: 'Get Help', desc: 'Contact our support' },
          { href: '/deals', Icon: Package, label: 'Today\'s Deals', desc: 'View active offers' },
        ].map(({ href, Icon, label, desc }) => (
          <Link key={href} href={href}
            className="rounded-[18px] glass border border-[var(--border-color)] p-4 flex items-center gap-3 hover:border-[var(--border-strong)] transition-all group">
            <div className="h-9 w-9 rounded-[14px] flex items-center justify-center shrink-0" style={{ background: 'var(--surface-raised)' }}>
              <Icon className="h-4 w-4 text-[var(--text-secondary)] group-hover:text-brand-red transition-colors" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--text-primary)] font-display">{label}</p>
              <p className="text-[10px] text-[var(--text-muted)] font-display">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── PAGE ──────────────────────────────────────────────────────────────────────

export default function AccountPage() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return user ? <UserDashboard /> : <LoginPanel />;
}
