'use client';

import { useState, useLayoutEffect } from 'react';
import Image from 'next/image';

export function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  useLayoutEffect(() => {
    // __sp is created by the inline <head> script only when:
    //   1. Running as installed PWA (standalone)
    //   2. First open of the session (sessionStorage key not yet set)
    const cover = document.getElementById('__sp');
    if (!cover) return;

    // Show our animated splash on top of the pre-cover
    setVisible(true);

    // After 1700ms start fade-out
    const t1 = setTimeout(() => setFading(true), 1700);

    // After fade-out completes, remove cover and unmount
    const t2 = setTimeout(() => {
      cover.style.transition = 'opacity 350ms ease';
      cover.style.opacity = '0';
      setTimeout(() => cover.remove(), 360);
      setVisible(false);
      setFading(false);
    }, 2050);

    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ background: 'var(--bg)', pointerEvents: 'none', opacity: fading ? 0 : 1, transition: 'opacity 350ms ease' }}
      aria-hidden="true"
    >
      <div className="animate-bounce-logo">
        <div
          className="relative h-28 w-28 rounded-[32px] overflow-hidden shadow-2xl"
          style={{ background: '#c41e3a' }}
        >
          <Image
            src="/logo.png"
            alt="Asian Grocery Nigeria"
            fill
            className="object-contain p-3"
            style={{ filter: 'brightness(0) invert(1)' }}
            priority
            unoptimized
          />
        </div>
      </div>
      <p className="mt-5 text-base font-bold font-display tracking-tight" style={{ color: 'var(--text-primary)' }}>
        Asian Grocery Nigeria
      </p>
      <p className="text-xs font-label tracking-widest uppercase mt-1" style={{ color: 'var(--text-muted)' }}>
        Exploring Asia Through Food
      </p>
    </div>
  );
}
