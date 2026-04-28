"use client";

import { useEffect, useSyncExternalStore } from "react";
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
  useEffect(() => {
    let cancelled = false;

    Promise.all([import("@/lib/sync"), import("@/lib/storage")]).then(
      ([{ loadFromDrive, scheduleSync, syncNow }, { setWriteCallback }]) => {
        if (cancelled) return;
        setWriteCallback(scheduleSync);
        loadFromDrive();
        window.addEventListener("online", syncNow);
      },
    );

    return () => {
      cancelled = true;
      import("@/lib/storage").then(({ setWriteCallback }) =>
        setWriteCallback(() => {}),
      );
      import("@/lib/sync").then(({ syncNow }) =>
        window.removeEventListener("online", syncNow),
      );
    };
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
