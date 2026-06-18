'use client';

import { useRef, useEffect, useState } from 'react';
import { Bell, X, ShoppingBag, Package, Globe, Cpu, Check } from 'lucide-react';
import { useNotificationStore, AdminNotifType } from '@/store/notificationStore';
import Link from 'next/link';
import { cn } from '@/lib/utils';

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const typeIcon: Record<AdminNotifType, React.ElementType> = {
  order: ShoppingBag,
  stock: Package,
  homepage: Globe,
  system: Cpu,
};

const typeColor: Record<AdminNotifType, string> = {
  order: '#c41e3a',
  stock: '#F59E0B',
  homepage: '#3B82F6',
  system: '#8B5CF6',
};

export function AdminNotifications() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { notifications, markRead, markAllRead, dismiss, unreadCount } = useNotificationStore();
  const [count, setCount] = useState(0);

  useEffect(() => { setCount(unreadCount()); }, [notifications, unreadCount]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false); }
    function onOut(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onOut);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onOut); };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label="Admin notifications"
        className="relative h-8 w-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center rounded-full bg-brand-red text-white text-[9px] font-bold font-label">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-10 w-80 rounded-2xl border shadow-2xl z-[70] overflow-hidden animate-quick-view-in"
          style={{ background: '#1a1814', borderColor: 'rgba(255,255,255,0.08)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-gray-400" />
              <span className="font-bold text-sm text-white font-display">Notifications</span>
              {count > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold font-label bg-brand-red/20 text-red-400">
                  {count} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {count > 0 && (
                <button onClick={markAllRead}
                  className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors font-display cursor-pointer">
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-white/5 transition-colors cursor-pointer">
                <X className="h-3.5 w-3.5 text-gray-500" />
              </button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto scrollbar-hide divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {notifications.length === 0 && (
              <div className="py-10 text-center">
                <Bell className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500 font-display">No notifications</p>
              </div>
            )}
            {notifications.map((n) => {
              const Icon = typeIcon[n.type];
              const color = typeColor[n.type];
              const inner = (
                <div
                  className={cn('flex gap-3 px-4 py-3.5 transition-colors relative group', !n.read && 'bg-white/[0.02]')}
                  onClick={() => { if (!n.read) markRead(n.id); }}
                >
                  {!n.read && <span className="absolute left-1.5 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-brand-red" />}
                  <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}15` }}>
                    <Icon className="h-4 w-4" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-xs font-semibold leading-tight font-display', n.read ? 'text-gray-400' : 'text-gray-200')}>
                      {n.title}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed line-clamp-2 font-display">{n.message}</p>
                    <p className="text-[10px] text-gray-600 mt-1 font-label">{timeAgo(n.timestamp)}</p>
                  </div>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); dismiss(n.id); }}
                    className="shrink-0 p-1 rounded hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    <X className="h-3 w-3 text-gray-500" />
                  </button>
                </div>
              );
              return (
                <div key={n.id}>
                  {n.actionUrl ? <Link href={n.actionUrl} onClick={() => setOpen(false)}>{inner}</Link> : inner}
                </div>
              );
            })}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t text-center" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <button onClick={markAllRead}
                className="flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-gray-300 font-display mx-auto transition-colors cursor-pointer">
                <Check className="h-3 w-3" /> Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
