'use client';

import { useState, useEffect } from 'react';
import { X, Download, Wifi, Zap, Smartphone, Share, SquarePlus } from 'lucide-react';
import Image from 'next/image';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isIosDevice() {
  if (typeof navigator === 'undefined') return false;
  // iPadOS 13+ reports as "MacIntel" with touch support — catch that too
  const ua = navigator.userAgent;
  const isAppleMobile = /iPad|iPhone|iPod/.test(ua);
  const isIpadOsDesktopUa = ua.includes('Macintosh') && navigator.maxTouchPoints > 1;
  return isAppleMobile || isIpadOsDesktopUa;
}

function isStandaloneDisplay() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('pwa-install-dismissed')) { setDismissed(true); return; }
    if (isStandaloneDisplay()) return; // already installed — nothing to prompt

    // Safari on iOS/iPadOS never fires beforeinstallprompt — show manual instructions instead
    if (isIosDevice()) {
      setIsIos(true);
      const t = setTimeout(() => setVisible(true), 3500);
      return () => clearTimeout(t);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setVisible(true), 3500);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
    setVisible(false);
  }

  function handleDismiss() {
    setVisible(false);
    setTimeout(() => setDismissed(true), 400);
    localStorage.setItem('pwa-install-dismissed', '1');
  }

  if ((!deferredPrompt && !isIos) || dismissed || !visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/40 animate-fade-in"
        onClick={handleDismiss}
        aria-hidden="true"
        style={{ backdropFilter: 'blur(2px)' }}
      />

      {/* Sheet — slides up from bottom on mobile, floats centered on desktop */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[61] animate-slide-up sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-sm sm:rounded-[28px] rounded-t-[28px]"
        style={{
          background: 'var(--bg)',
          boxShadow: '0 -12px 60px rgba(0,0,0,0.25), 0 0 0 1px var(--border-color)',
        }}
        role="dialog"
        aria-label="Install app"
      >
        {/* Drag handle pill — mobile only */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full" style={{ background: 'var(--border-strong)' }} />
        </div>

        {/* Close */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center transition-colors cursor-pointer"
          style={{ background: 'var(--surface)' }}
          aria-label="Close"
        >
          <X className="h-4 w-4" style={{ color: 'var(--text-muted)' }} />
        </button>

        <div className="px-6 pb-6 pt-4 flex flex-col items-center text-center gap-4">
          {/* App icon with red background */}
          <div
            className="relative h-20 w-20 rounded-[22px] shadow-lg overflow-hidden"
            style={{ background: '#c41e3a' }}
          >
            <Image src="/logo.png" alt="Asian Grocery Nigeria" fill className="object-contain p-2" style={{ filter: 'brightness(0) invert(1)' }} />
          </div>

          <div>
            <p className="text-lg font-bold font-display" style={{ color: 'var(--text-primary)' }}>
              Install Asian Grocery Nigeria
            </p>
            <p className="text-sm mt-1 font-display" style={{ color: 'var(--text-muted)' }}>
              Add to your home screen for a faster, app-like shopping experience.
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {[
              { Icon: Wifi, label: 'Works offline' },
              { Icon: Zap, label: 'Lightning fast' },
              { Icon: Smartphone, label: 'No app store' },
            ].map(({ Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold font-label"
                style={{ background: 'var(--surface)', color: 'var(--text-secondary)' }}
              >
                <Icon className="h-3 w-3" />
                {label}
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-2 w-full">
            {isIos ? (
              <div
                className="w-full rounded-[14px] py-3.5 px-4 text-left flex flex-col gap-2.5"
                style={{ background: 'var(--surface)' }}
              >
                <p className="flex items-center gap-2.5 text-sm font-display" style={{ color: 'var(--text-primary)' }}>
                  <span
                    className="shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-bold"
                    style={{ background: '#c41e3a', color: 'white' }}
                  >1</span>
                  Tap <Share className="h-4 w-4 inline shrink-0" style={{ color: 'var(--accent)' }} /> Share in Safari&apos;s toolbar
                </p>
                <p className="flex items-center gap-2.5 text-sm font-display" style={{ color: 'var(--text-primary)' }}>
                  <span
                    className="shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-bold"
                    style={{ background: '#c41e3a', color: 'white' }}
                  >2</span>
                  Scroll down and tap <SquarePlus className="h-4 w-4 inline shrink-0" style={{ color: 'var(--accent)' }} /> &quot;Add to Home Screen&quot;
                </p>
              </div>
            ) : (
              <button
                onClick={handleInstall}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[14px] font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95 cursor-pointer"
                style={{ background: '#c41e3a' }}
              >
                <Download className="h-4 w-4" />
                Add to Home Screen
              </button>
            )}
            <button
              onClick={handleDismiss}
              className="w-full py-3 rounded-[14px] text-sm font-display transition-colors cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
            >
              {isIos ? 'Got It' : 'Maybe Later'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
