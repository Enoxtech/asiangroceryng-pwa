'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';

export default function RegisterPage() {
  const router = useRouter();
  const { user, register, hydrate, hydrated } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => { if (hydrated && user) router.replace('/account'); }, [user, hydrated, router]);

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await register(form);
    setLoading(false);
    if (!result.success) setError(result.error || 'Could not create account');
    else router.push('/account');
  }

  const fieldCls = 'w-full px-4 py-3 rounded-[14px] bg-[var(--surface)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-display';
  const labelCls = 'block text-xs font-label uppercase tracking-wide text-[var(--text-muted)] mb-1.5';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="relative h-16 w-16 mx-auto mb-3">
            <Image src="/logo.png" alt="Asian Grocery NG" fill className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] font-display">Create an Account</h1>
          <p className="text-sm text-[var(--text-muted)] font-display mt-0.5">Track orders &amp; check out faster</p>
        </div>

        <div className="p-6 rounded-[28px] glass border border-[var(--border-color)] space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700 font-display">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelCls}>Full Name</label>
              <input required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="John Doe" autoComplete="name" className={fieldCls} />
            </div>
            <div>
              <label className={labelCls}>Email Address</label>
              <input type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@example.com" autoComplete="email" className={fieldCls} />
            </div>
            <div>
              <label className={labelCls}>Phone Number</label>
              <input type="tel" required value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+234 800 000 0000" autoComplete="tel" className={fieldCls} />
            </div>
            <div>
              <label className={labelCls}>Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  placeholder="At least 10 characters"
                  autoComplete="new-password"
                  className={`${fieldCls} pr-12`}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] mt-1 font-display">Must include at least one letter and one number.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-[44px] bg-brand-red text-white text-sm font-bold font-display transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
            >
              {loading ? <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> : <UserPlus className="h-4 w-4" />}
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center mt-5 text-sm text-[var(--text-muted)] font-display">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-brand-red hover:opacity-75">Sign in</Link>
        </p>
        <p className="text-center mt-2 text-sm text-[var(--text-muted)] font-display">
          <a href="/" className="hover:text-[var(--text-secondary)] transition-colors">← Back to store</a>
        </p>
      </div>
    </div>
  );
}
