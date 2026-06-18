'use client';

import { useState, useLayoutEffect } from 'react';
import Image from 'next/image';

export function SplashScreen() {
  // 'loading'  — covers screen before first paint; never visible to user
  // 'splash'   — show logo + animation
  // 'done'     — unmount
  const [phase, setPhase] = useState<'loading' | 'splash' | 'done'>('loading');

  useLayoutEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as { standalone?: boolean }).standalone === true;

    if (!isStandalone) { setPhase('done'); return; }

    const key = 'splash-shown-v1';
    if (sessionStorage.getItem(key)) { setPhase('done'); return; }

    sessionStorage.setItem(key, '1');
    setPhase('splash');

    const t = setTimeout(() => setPhase('done'), 2400);
    return () => clearTimeout(t);
  }, []);

  if (phase === 'done') return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center${phase === 'splash' ? ' animate-fade-out' : ''}`}
      style={{ background: 'var(--bg)' }}
      aria-hidden="true"
    >
      {phase === 'splash' && (
        <>
          <div className="animate-bounce-logo">
            <div
              className="relative h-28 w-28 rounded-[32px] overflow-hidden shadow-2xl"
              style={{ background: '#c41e3a' }}
            >
              <Image
                src="/logo.png"
                alt="Asian Grocery NG"
                fill
                className="object-contain p-3"
                style={{ filter: 'brightness(0) invert(1)' }}
                priority
              />
            </div>
          </div>
          <p className="mt-5 text-base font-bold font-display tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Asian Grocery NG
          </p>
          <p className="text-xs font-label tracking-widest uppercase mt-1" style={{ color: 'var(--text-muted)' }}>
            Exploring Asia Through Food
          </p>
        </>
      )}
    </div>
  );
}
