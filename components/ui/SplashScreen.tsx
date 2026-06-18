'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export function SplashScreen() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (navigator as { standalone?: boolean }).standalone === true;

    if (!isStandalone) return;

    const key = 'splash-shown-v1';
    if (sessionStorage.getItem(key)) return;

    sessionStorage.setItem(key, '1');
    setVisible(true);

    const timer = setTimeout(() => setVisible(false), 2400);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center animate-fade-out"
      style={{ background: 'var(--bg)' }}
      aria-hidden="true"
    >
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

      <p
        className="mt-5 text-base font-bold font-display tracking-tight"
        style={{ color: 'var(--text-primary)' }}
      >
        Asian Grocery NG
      </p>
      <p
        className="text-xs font-label tracking-widest uppercase mt-1"
        style={{ color: 'var(--text-muted)' }}
      >
        Exploring Asia Through Food
      </p>
    </div>
  );
}
