"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import type { ReactNode } from "react";

interface AppShellProps {
  children: ReactNode;
}

function subscribeOnlineStatus(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function SyncMount() {
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    let cleanupFn = () => {};

    Promise.all([import("@/lib/sync"), import("@/lib/storage")]).then(
      ([{ loadFromDrive, scheduleSync, syncNow }, { setWriteCallback }]) => {
        setWriteCallback(scheduleSync);
        cleanupFn = () => setWriteCallback(() => {});
        loadFromDrive();

        window.addEventListener("online", syncNow);
        const prev = cleanupFn;
        cleanupFn = () => {
          prev();
          window.removeEventListener("online", syncNow);
        };
      },
    );

    return () => cleanupFn();
  }, []);

  return null;
}

export default function AppShell({ children }: AppShellProps) {
  const offline = useSyncExternalStore(
    subscribeOnlineStatus,
    () => !navigator.onLine,
    () => false,
  );

  return (
    <>
      <SyncMount />
      {offline && (
        <div className="sticky top-0 z-50 w-full flex items-center justify-center py-2 px-4 bg-yellow text-background font-body text-xs tracking-[1px]">
          NO INTERNET — CHANGES SAVED LOCALLY
        </div>
      )}
      {children}
    </>
  );
}
