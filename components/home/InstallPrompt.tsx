'use client';

import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import Image from 'next/image';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('pwa-install-dismissed')) { setDismissed(true); return; }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show after a 3-second delay so user can see the page first
      setTimeout(() => setVisible(true), 3000);
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
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', '1');
  }

  if (!deferredPrompt || dismissed || !visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-black/50 animate-fade-in"
        onClick={handleDismiss}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[61] sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-sm sm:rounded-[28px] animate-slide-in-left sm:animate-fade-in"
        style={{ background: '#fff', boxShadow: '0 24px 80px rgba(0,0,0,0.30)' }}
      >
        {/* Close */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 h-8 w-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 flex flex-col items-center text-center gap-4">
          {/* App icon */}
          <div className="relative h-20 w-20 rounded-[22px] overflow-hidden shadow-lg" style={{ background: '#c41e3a' }}>
            <Image src="/logo.png" alt="Asian Grocery NG" fill className="object-contain p-1" />
          </div>

          <div>
            <p className="text-lg font-bold text-gray-900">Install Asian Grocery NG</p>
            <p className="text-sm text-gray-500 mt-1">
              Add to your home screen for a faster, app-like shopping experience.
            </p>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <button
              onClick={handleInstall}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-[14px] font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95 cursor-pointer"
              style={{ background: '#c41e3a' }}
            >
              <Download className="h-4 w-4" />
              Add to Home Screen
            </button>
            <button
              onClick={handleDismiss}
              className="w-full py-3 rounded-[14px] text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Maybe Later
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <Smartphone className="h-3 w-3" />
            <span>Works offline · Fast · No app store needed</span>
          </div>
        </div>
      </div>
    </>
  );
}
