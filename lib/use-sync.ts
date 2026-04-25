'use client';

import { useEffect } from 'react';

export function useSync(): void {
  useEffect(() => {
    let cleanupFn = () => {};

    Promise.all([
      import('./sync'),
      import('./storage'),
    ]).then(([{ loadFromDrive, scheduleSync }, { setWriteCallback }]) => {
      setWriteCallback(scheduleSync);
      cleanupFn = () => setWriteCallback(() => {});
      loadFromDrive();
    });

    return () => cleanupFn();
  }, []);
}
