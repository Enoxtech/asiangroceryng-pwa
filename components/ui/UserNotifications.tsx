'use client';

import { useRef, useEffect, useState } from 'react';
import { Bell, X, ShoppingBag, Tag, Package, Info, Check } from 'lucide-react';
import { useUserNotificationStore, UserNotifType } from '@/store/userNotificationStore';
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

const typeIcon: Record<UserNotifType, React.ElementType> = {
  order: ShoppingBag,
  promo: Tag,
  arrival: Package,
  system: Info,
};

const typeColor: Record<UserNotifType, string> = {
  order: '#c41e3a',
  promo: '#F59E0B',
  arrival: '#10B981',
  system: '#3B82F6',
};

export function UserNotifications() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { notifications, markRead, markAllRead, dismiss, unreadCount } = useUserNotificationStore();
  const [count, setCount] = useState(0);

  useEffect(() => {
    setCount(unreadCount());
  }, [notifications, unreadCount]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') setOpen(false); }
    function onClickOut(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClickOut);
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onClickOut); };
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
        className="relative h-9 w-9 flex items-center justify-center rounded-full glass border border-[var(--border-color)] transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
      >
        <Bell className="h-4 w-4 text-[var(--text-secondary)]" />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 flex items-center justify-center rounded-full bg-brand-red text-white text-[9px] font-bold font-label">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-11 w-80 rounded-2xl border shadow-2xl z-[70] overflow-hidden animate-quick-view-in"
          style={{ background: 'var(--bg)', borderColor: 'var(--border-color)', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-[var(--text-secondary)]" />
              <span className="font-bold text-sm text-[var(--text-primary)] font-display">Notifications</span>
              {count > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold font-label bg-brand-red/15 text-brand-red">
                  {count} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {count > 0 && (
                <button
                  onClick={() => markAllRead()}
                  className="text-[10px] font-medium text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors font-display cursor-pointer"
                >
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-[var(--surface)] transition-colors cursor-pointer">
                <X className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto scrollbar-hide divide-y" style={{ borderColor: 'var(--border-color)' }}>
            {notifications.length === 0 && (
              <div className="py-10 text-center">
                <Bell className="h-8 w-8 text-[var(--text-muted)] mx-auto mb-2 opacity-40" />
                <p className="text-sm text-[var(--text-muted)] font-display">No notifications yet</p>
              </div>
            )}
            {notifications.map((n) => {
              const Icon = typeIcon[n.type];
              const color = typeColor[n.type];
              const content = (
                <div
                  className={cn(
                    'flex gap-3 px-4 py-3.5 transition-colors relative',
                    !n.read ? 'bg-[var(--surface)]' : 'hover:bg-[var(--surface)]'
                  )}
                  onClick={() => { if (!n.read) markRead(n.id); }}
                >
                  {/* Unread dot */}
                  {!n.read && (
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-brand-red" />
                  )}
                  <div className="h-8 w-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}18` }}>
                    <Icon className="h-4 w-4" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-xs font-semibold leading-tight truncate font-display', n.read ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)]')}>
                      {n.title}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-relaxed line-clamp-2 font-display">
                      {n.body}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1 font-label opacity-70">{timeAgo(n.timestamp)}</p>
                  </div>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); dismiss(n.id); }}
                    className="shrink-0 p-1 rounded hover:bg-[var(--border-color)] transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                  >
                    <X className="h-3 w-3 text-[var(--text-muted)]" />
                  </button>
                </div>
              );
              return (
                <div key={n.id} className="group">
                  {n.link ? <Link href={n.link} onClick={() => setOpen(false)}>{content}</Link> : content}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-3 border-t text-center" style={{ borderColor: 'var(--border-color)' }}>
              <button
                onClick={() => { markAllRead(); }}
                className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] hover:text-[var(--text-secondary)] font-display mx-auto transition-colors cursor-pointer"
              >
                <Check className="h-3 w-3" /> Mark all as read
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
