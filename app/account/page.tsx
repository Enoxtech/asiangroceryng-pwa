'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn, Package, Heart, MapPin, User, LogOut, ChevronRight, ShoppingBag, Clock, AlertTriangle, Pencil, Check, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { formatPrice, formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface OrderItem { id: string; name: string; quantity: number; price: number }
interface MyOrder { id: string; total: number; status: string; createdAt: string; items: OrderItem[] }

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
    else router.refresh();
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-label uppercase tracking-wide text-[var(--text-muted)]">Password</label>
              <Link href="/forgot-password" className="text-xs text-brand-red hover:opacity-75 font-display">Forgot?</Link>
            </div>
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

      <p className="mt-4 text-center text-sm text-[var(--text-muted)] font-display">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-semibold text-brand-red hover:opacity-75">Create one</Link>
      </p>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { href: '/shop', Icon: ShoppingBag, label: 'Shop' },
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
  const { user, logout, updateProfile, resendVerification } = useAuthStore();
  const router = useRouter();
  const { items: wishlistItems } = useWishlistStore();
  const [orders, setOrders] = useState<MyOrder[] | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '', address: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent'>('idle');

  useEffect(() => {
    fetch('/api/orders/mine')
      .then((r) => (r.ok ? r.json() : []))
      .then(setOrders)
      .catch(() => setOrders([]));
  }, []);

  if (!user) return null;
  const currentUser = user;

  function startEditing() {
    setEditForm({ name: currentUser.name, phone: currentUser.phone, address: currentUser.address || '' });
    setEditing(true);
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    const result = await updateProfile(editForm);
    setSavingProfile(false);
    if (result.success) setEditing(false);
  }

  async function handleResend() {
    setResendState('sending');
    await resendVerification();
    setResendState('sent');
  }

  const pendingCount = (orders ?? []).filter((o) => o.status === 'pending' || o.status === 'processing').length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Email verification banner */}
      {!user.emailVerified && (
        <div className="rounded-[20px] border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800 font-display">Please verify your email</p>
            <p className="text-xs text-amber-700 mt-0.5 font-display">Check your inbox for a verification link, or resend it below.</p>
          </div>
          <button
            onClick={handleResend}
            disabled={resendState !== 'idle'}
            className="shrink-0 text-xs font-semibold text-amber-800 underline hover:opacity-75 font-display disabled:opacity-50"
          >
            {resendState === 'sent' ? 'Sent!' : resendState === 'sending' ? 'Sending…' : 'Resend'}
          </button>
        </div>
      )}

      {/* Profile card */}
      <div className="rounded-[28px] glass border border-[var(--border-color)] p-6">
        {editing ? (
          <form onSubmit={saveProfile} className="space-y-3">
            <div>
              <label className="block text-xs font-label uppercase tracking-wide text-[var(--text-muted)] mb-1">Name</label>
              <input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border-color)] text-sm font-display" />
            </div>
            <div>
              <label className="block text-xs font-label uppercase tracking-wide text-[var(--text-muted)] mb-1">Phone</label>
              <input value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border-color)] text-sm font-display" />
            </div>
            <div>
              <label className="block text-xs font-label uppercase tracking-wide text-[var(--text-muted)] mb-1">Address</label>
              <input value={editForm.address} onChange={(e) => setEditForm((f) => ({ ...f, address: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border-color)] text-sm font-display" />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={savingProfile} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-red text-white text-xs font-bold font-display disabled:opacity-60">
                <Check className="h-3.5 w-3.5" /> Save
              </button>
              <button type="button" onClick={() => setEditing(false)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--border-color)] text-xs font-semibold text-[var(--text-muted)] font-display">
                <X className="h-3.5 w-3.5" /> Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-brand-red text-white flex items-center justify-center text-xl font-bold shrink-0">
              {user.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-[var(--text-primary)] text-lg font-display">{user.name}</h2>
              <p className="text-sm text-[var(--text-muted)] font-display">{user.email}</p>
              {user.phone && <p className="text-sm text-[var(--text-muted)] font-display">{user.phone}</p>}
            </div>
            <button onClick={startEditing} className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[var(--text-muted)] hover:text-brand-red border border-[var(--border-color)] hover:border-brand-red transition-all font-display">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
            <button
              onClick={() => { logout(); router.push('/'); }}
              className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[var(--text-muted)] hover:text-red-500 border border-[var(--border-color)] hover:border-red-200 transition-all font-display"
            >
              <LogOut className="h-3.5 w-3.5" /> Logout
            </button>
          </div>
        )}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { Icon: ShoppingBag, label: 'Orders', value: orders ? orders.length : '–', href: '/account/orders' },
          { Icon: Heart, label: 'Wishlist', value: wishlistItems.length, href: '/wishlist' },
          { Icon: Clock, label: 'Pending', value: pendingCount, href: '/account/orders' },
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
        {orders === null ? (
          <div className="text-center py-8">
            <span className="inline-block h-5 w-5 rounded-full border-2 border-gray-200 border-t-brand-red animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 rounded-[20px] glass border border-[var(--border-color)]">
            <p className="text-sm text-[var(--text-muted)] font-display">No orders yet.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {orders.slice(0, 3).map((order) => {
              const itemCount = order.items.reduce((sum, i) => sum + i.quantity, 0);
              return (
                <div key={order.id} className="rounded-[20px] glass border border-[var(--border-color)] p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-[var(--text-primary)] font-label">{order.id}</p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5 font-display">{formatDate(order.createdAt)} · {itemCount} items</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={statusMap[order.status] ?? 'default'} className="capitalize text-[10px]">{order.status}</Badge>
                    <span className="text-sm font-bold text-brand-red font-label">{formatPrice(order.total)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
  const { user, hydrated, hydrate } = useAuthStore();

  useEffect(() => { hydrate(); }, [hydrate]);
  if (!hydrated) return null;

  return user ? <UserDashboard /> : <LoginPanel />;
}
