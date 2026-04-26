'use client';

import { useEffect } from 'react';

export function useSync(): void {
  useEffect(() => {
    let cleanupFn = () => {};

    Promise.all([
      import('./sync'),
      import('./storage'),
    ]).then(([{ loadFromDrive, scheduleSync, syncNow }, { setWriteCallback }]) => {
      setWriteCallback(scheduleSync);
      cleanupFn = () => setWriteCallback(() => {});
      loadFromDrive();

      window.addEventListener('online', syncNow);
      const prev = cleanupFn;
      cleanupFn = () => { prev(); window.removeEventListener('online', syncNow); };
    });

    return () => cleanupFn();
  }, []);
}
