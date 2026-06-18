'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const current = document.documentElement.getAttribute('data-theme') as 'light' | 'dark' | null;
    setTheme(current || 'light');
  }, []);

  function toggle() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('agng-theme', next);
  }

  if (!mounted) return <div className="h-9 w-9" aria-hidden />;

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className="relative h-9 w-9 flex items-center justify-center rounded-full glass border border-[var(--border-color)] transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
    >
      {theme === 'light' ? (
        <Moon className="h-4 w-4 text-[var(--text-secondary)]" />
      ) : (
        <Sun className="h-4 w-4 text-[var(--accent)]" />
      )}
    </button>
  );
}
