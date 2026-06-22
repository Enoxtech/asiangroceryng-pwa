'use client';

import { useEffect } from 'react';
import { useAdminStore } from '@/store/adminStore';

export function StoreHydrator() {
  const hydrate = useAdminStore((s) => s.hydrate);

  useEffect(() => {
    hydrate().catch((err) => console.error('[StoreHydrator]', err));
  }, [hydrate]);

  return null;
}
