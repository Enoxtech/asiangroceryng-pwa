'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { useAdminAuthStore } from '@/store/adminAuthStore';

export default function AdminLoginPage() {
  const router = useRouter();
  const { session, login } = useAdminAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session) {
      router.replace('/admin');
    }
  }, [session, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Invalid admin credentials.');
      return;
    }
    router.push('/admin');
  }

  const fieldCls = 'w-full px-4 py-3 rounded-xl text-sm font-display border focus:outline-none focus:border-brand-red text-gray-200 bg-[#0f0e0b] border-[rgba(255,255,255,0.08)] placeholder:text-gray-600';

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0f0e0b' }}>
      <div className="w-full max-w-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="relative h-12 w-12 mx-auto">
            <Image src="/logo.png" alt="Asian Grocery NG" fill className="object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
          </div>
          <div>
            <p className="text-[10px] font-label uppercase tracking-widest text-gray-600 mb-1">Admin Access</p>
            <h1 className="text-xl font-bold text-white font-display">Asian Grocery NG</h1>
            <p className="text-xs text-gray-500 font-display mt-0.5">Sign in with your admin credentials</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border p-6 space-y-4" style={{ background: '#1a1814', borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(196,30,58,0.08)', border: '1px solid rgba(196,30,58,0.2)' }}>
            <ShieldCheck className="h-4 w-4 text-brand-red shrink-0" />
            <p className="text-xs font-display text-red-300">Restricted access — authorised personnel only</p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 font-display">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1.5">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@yourstore.com"
                autoComplete="email"
                className={fieldCls}
              />
            </div>
            <div>
              <label className="block text-[10px] font-label uppercase tracking-widest text-gray-500 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={`${fieldCls} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand-red text-white text-sm font-bold font-display transition-all hover:opacity-90 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              {loading ? 'Authenticating…' : 'Sign In to Admin Panel'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-700 font-display">
          Not an admin?{' '}
          <a href="/" className="text-gray-500 hover:text-gray-300 transition-colors">Return to store</a>
        </p>
      </div>
    </div>
  );
}
