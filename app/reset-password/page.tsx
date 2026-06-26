'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, KeyRound, CheckCircle2 } from 'lucide-react';

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/customer-auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Could not reset password');
      setDone(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reset password');
    } finally {
      setLoading(false);
    }
  }

  const fieldCls = 'w-full px-4 py-3 pr-12 rounded-[14px] bg-[var(--surface)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-display';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="relative h-16 w-16 mx-auto mb-3">
            <Image src="/logo.png" alt="Asian Grocery Nigeria" fill className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] font-display">Reset Password</h1>
        </div>

        <div className="p-6 rounded-[28px] glass border border-[var(--border-color)] space-y-4">
          {done ? (
            <div className="text-center py-4">
              <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-green-600" />
              <p className="text-sm text-[var(--text-primary)] font-display">Password updated! Redirecting you to sign in…</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700 font-display">{error}</div>}
              <div>
                <label className="block text-xs font-label uppercase tracking-wide text-[var(--text-muted)] mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 10 characters"
                    autoComplete="new-password"
                    className={fieldCls}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading || !token} className="w-full flex items-center justify-center gap-2 py-3 rounded-[44px] bg-brand-red text-white text-sm font-bold font-display transition-all hover:opacity-90 active:scale-95 disabled:opacity-60">
                {loading ? <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> : <KeyRound className="h-4 w-4" />}
                {loading ? 'Updating…' : 'Update Password'}
              </button>
              {!token && <p className="text-xs text-red-500 text-center font-display">Missing or invalid reset link.</p>}
            </form>
          )}
        </div>

        <p className="text-center mt-5 text-sm text-[var(--text-muted)] font-display">
          <Link href="/login" className="font-semibold text-brand-red hover:opacity-75">← Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordInner />
    </Suspense>
  );
}
