'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle } from 'lucide-react';

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('Missing verification token.');
      return;
    }
    fetch('/api/customer-auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Verification failed');
        setStatus('success');
      })
      .catch((err) => {
        setStatus('error');
        setError(err.message);
      });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm text-center p-8 rounded-[28px] glass border border-[var(--border-color)]">
        {status === 'loading' && (
          <span className="inline-block h-8 w-8 rounded-full border-2 border-gray-200 border-t-brand-red animate-spin" />
        )}
        {status === 'success' && (
          <>
            <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-600" />
            <h1 className="text-xl font-bold text-[var(--text-primary)] font-display">Email Verified!</h1>
            <p className="text-sm text-[var(--text-muted)] mt-2 font-display">Your email address has been confirmed.</p>
            <Link href="/account" className="mt-5 inline-block px-6 py-3 rounded-[44px] bg-brand-red text-white text-sm font-bold font-display">
              Go to My Account
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h1 className="text-xl font-bold text-[var(--text-primary)] font-display">Verification Failed</h1>
            <p className="text-sm text-[var(--text-muted)] mt-2 font-display">{error}</p>
            <Link href="/account" className="mt-5 inline-block px-6 py-3 rounded-[44px] bg-brand-red text-white text-sm font-bold font-display">
              Go to My Account
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailInner />
    </Suspense>
  );
}
