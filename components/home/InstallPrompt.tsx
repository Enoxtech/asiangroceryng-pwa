'use client';

import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('pwa-install-dismissed');
    if (stored) setDismissed(true);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  }

  function handleDismiss() {
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', '1');
  }

  if (!deferredPrompt || dismissed) return null;

  return (
    <div className="mx-4 bg-gradient-to-r from-brand-red to-red-700 text-white rounded-2xl p-4 flex items-center gap-3 shadow-lg">
      <div className="text-3xl shrink-0">🥡</div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm">Install Asian Grocery NG</p>
        <p className="text-xs text-red-200 mt-0.5">Add to your home screen for a faster, app-like experience.</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleInstall}
          className="flex items-center gap-1.5 bg-white text-brand-red font-bold text-xs px-3 py-2 rounded-full hover:bg-red-50 transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          Install
        </button>
        <button onClick={handleDismiss} className="p-1 hover:bg-white/20 rounded-full transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
