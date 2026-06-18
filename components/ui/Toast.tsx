'use client';

import { useToastStore } from '@/store/toastStore';
import { X, CheckCircle2, AlertCircle, Info, ShoppingCart } from 'lucide-react';

export function ToastContainer() {
  const { toasts, dismiss } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-sm"
      style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 88px)' }}
    >
      {toasts.map((toast) => {
        const Icon =
          toast.type === 'cart' ? ShoppingCart
          : toast.type === 'error' ? AlertCircle
          : toast.type === 'info' ? Info
          : CheckCircle2;

        const iconColor =
          toast.type === 'cart' ? '#c41e3a'
          : toast.type === 'error' ? '#f87171'
          : toast.type === 'info' ? '#60a5fa'
          : '#4ade80';

        return (
          <div
            key={toast.id}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl animate-fade-up"
            style={{
              background: 'rgba(22, 20, 15, 0.95)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.10)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
            }}
          >
            {toast.emoji ? (
              <span className="text-lg shrink-0" aria-hidden="true">{toast.emoji}</span>
            ) : (
              <Icon className="h-4 w-4 shrink-0" style={{ color: iconColor }} />
            )}
            <span className="text-sm font-semibold text-white flex-1 font-display">
              {toast.message}
            </span>
            <button
              onClick={() => dismiss(toast.id)}
              className="shrink-0 opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
