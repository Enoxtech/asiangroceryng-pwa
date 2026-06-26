'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/customer-auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Something went wrong');
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const fieldCls = 'w-full px-4 py-3 rounded-[14px] bg-[var(--surface)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] font-display';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="relative h-16 w-16 mx-auto mb-3">
            <Image src="/logo.png" alt="Asian Grocery Nigeria" fill className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] font-display">Forgot Password</h1>
          <p className="text-sm text-[var(--text-muted)] font-display mt-0.5">We&apos;ll email you a reset link</p>
        </div>

        <div className="p-6 rounded-[28px] glass border border-[var(--border-color)] space-y-4">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-green-600" />
              <p className="text-sm text-[var(--text-primary)] font-display">If an account exists for <strong>{email}</strong>, a password reset link is on its way.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700 font-display">{error}</div>}
              <div>
                <label className="block text-xs font-label uppercase tracking-wide text-[var(--text-muted)] mb-1.5">Email Address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className={fieldCls} />
              </div>
              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3 rounded-[44px] bg-brand-red text-white text-sm font-bold font-display transition-all hover:opacity-90 active:scale-95 disabled:opacity-60">
                {loading ? <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" /> : <Mail className="h-4 w-4" />}
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
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
