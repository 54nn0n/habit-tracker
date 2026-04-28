"use client";

import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useSync } from "@/lib/use-sync";

interface AppShellProps {
  children: ReactNode;
}

function SyncMount() {
  useSync();
  return null;
}

export default function AppShell({ children }: AppShellProps) {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    setOffline(!navigator.onLine);
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  return (
    <>
      <SyncMount />
      {offline && (
        <div className="sticky top-0 z-50 w-full flex items-center justify-center py-2 px-4 bg-yellow text-background font-body text-[9px] tracking-[1px]">
          NO INTERNET — CHANGES SAVED LOCALLY
        </div>
      )}
      {children}
    </>
  );
}
