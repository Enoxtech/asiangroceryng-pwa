'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import { Suspense } from 'react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  const { user, login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      router.replace(user.role === 'admin' ? '/admin' : '/account');
    }
  }, [user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Login failed');
    } else {
      const dest = from === 'admin' ? '/admin' : '/account';
      router.push(dest);
    }
  }

  function fillDemo(type: 'admin' | 'customer') {
    if (type === 'admin') { setEmail('admin@asiangroceryng.com'); setPassword('Admin@2024'); }
    else { setEmail('demo@customer.com'); setPassword('Demo@2024'); }
    setError('');
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: 'var(--bg)' }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="relative h-16 w-16 mx-auto mb-3">
            <Image src="/logo.png" alt="Asian Grocery NG" fill className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] font-display">Asian Grocery NG</h1>
          <p className="text-sm text-[var(--text-muted)] font-display mt-0.5">Sign in to continue</p>
        </div>

        {/* Form card */}
        <div className="p-6 rounded-[28px] glass border border-[var(--border-color)] space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700 font-display">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-label uppercase tracking-wide text-[var(--text-muted)] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full px-4 py-3 rounded-[14px] bg-[var(--surface)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-display"
              />
            </div>
            <div>
              <label className="block text-xs font-label uppercase tracking-wide text-[var(--text-muted)] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 rounded-[14px] bg-[var(--surface)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-display"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-[44px] bg-brand-red text-white text-sm font-bold font-display transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
            >
              {loading ? (
                <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Demo credentials */}
        <div className="mt-5 p-4 rounded-[20px] border border-[var(--border-color)] bg-[var(--surface)]">
          <p className="text-[11px] font-label uppercase tracking-widest text-[var(--text-muted)] mb-3 text-center">Demo Credentials</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => fillDemo('admin')}
              className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border-color)] text-left hover:border-brand-red transition-colors group"
            >
              <p className="text-[10px] font-label uppercase tracking-widest text-[var(--text-muted)] mb-0.5">Admin</p>
              <p className="text-xs font-semibold text-[var(--text-primary)] font-display truncate group-hover:text-brand-red">admin@asiangroceryng.com</p>
              <p className="text-[10px] text-[var(--text-muted)] font-label">Admin@2024</p>
            </button>
            <button
              onClick={() => fillDemo('customer')}
              className="p-3 rounded-xl bg-[var(--bg)] border border-[var(--border-color)] text-left hover:border-[var(--green)] transition-colors group"
            >
              <p className="text-[10px] font-label uppercase tracking-widest text-[var(--text-muted)] mb-0.5">Customer</p>
              <p className="text-xs font-semibold text-[var(--text-primary)] font-display truncate group-hover:text-[var(--green)]">demo@customer.com</p>
              <p className="text-[10px] text-[var(--text-muted)] font-label">Demo@2024</p>
            </button>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] text-center mt-2 font-display">Click a card above to auto-fill credentials</p>
        </div>

        <p className="text-center mt-4 text-sm text-[var(--text-muted)] font-display">
          <a href="/" className="hover:text-[var(--text-secondary)] transition-colors">← Back to store</a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
