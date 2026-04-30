"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import type { ChangeEvent } from "react";
import { useSearchParams } from "next/navigation";
import {
  isConnected,
  getEmail,
  startGoogleAuth,
  disconnect,
} from "@/lib/google-auth";
import { subscribeSyncStatus, syncNow } from "@/lib/sync";
import type { SyncStatus } from "@/lib/sync";
import { encodeLogs, decodeLogs } from "@/lib/md-codec";
import { getAllLogs, setAllLogs } from "@/lib/storage";
import BackButton from "@/components/back-button";
import Button from "@/components/button";

const VERSION = "0.2.2";

const STATUS_LABEL: Record<SyncStatus, string> = {
  idle: "NOT SYNCED YET",
  syncing: "SYNCING...",
  synced: "SYNCED",
  error: "SYNC FAILED",
};

const STATUS_CLASS: Record<SyncStatus, string> = {
  idle: "text-muted",
  syncing: "text-yellow",
  synced: "text-green",
  error: "text-red",
};

const TOAST_CLASS: Record<"success" | "error", string> = {
  success: "text-green",
  error: "text-red",
};

const SECTION_LABEL =
  "font-display text-[8px] text-accent tracking-[2px] uppercase mb-2";
const PANEL =
  "bg-surface border-2 border-border p-4 flex flex-col gap-3 shadow-px";

function SettingsInner() {
  const searchParams = useSearchParams();
  const [connected, setConnected] = useState(() => isConnected());
  const [email, setEmail] = useState(() => getEmail());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return subscribeSyncStatus((s, t) => {
      setSyncStatus(s);
      setLastSynced(t);
    });
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = useCallback(
    (type: "success" | "error", message: string) => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      setToast({ type, message });
      toastTimer.current = setTimeout(() => setToast(null), 2500);
    },
    [],
  );

  const handleConnect = useCallback(() => startGoogleAuth(), []);

  const handleDisconnect = useCallback(() => {
    disconnect();
    setConnected(false);
    setEmail(null);
  }, []);

  const handleExport = useCallback(() => {
    try {
      const md = encodeLogs(getAllLogs());
      const blob = new Blob([md], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "93_Habits_Log.md";
      a.click();
      URL.revokeObjectURL(url);
      showToast("success", "✓ EXPORTED");
    } catch {
      showToast("error", "✕ Export failed.");
    }
  }, [showToast]);

  const handleImport = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          setAllLogs(decodeLogs(ev.target?.result as string));
          showToast("success", "✓ IMPORTED");
          syncNow();
        } catch {
          showToast("error", "✕ Could not parse file.");
        }
      };
      reader.readAsText(file);
    },
    [showToast],
  );

  const authError = searchParams.get("error");

  return (
    <div className="px-4 pt-10 pb-20 max-w-lg mx-auto w-full">
      <header className="mb-8">
        <BackButton href="/" />
        <p className="font-body text-xs text-muted uppercase tracking-[3px]">
          App
        </p>
        <h1 className="font-display mt-2 leading-tight text-[22px] text-accent">
          SETTINGS
        </h1>
      </header>

      <section className="mb-8">
        <p className={SECTION_LABEL}>{"// Google Drive"}</p>
        <div className={PANEL}>
          {authError && (
            <p className="font-body text-xs text-red">
              ✕ Connection failed. Please try again.
            </p>
          )}
          {connected ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-body text-[11px] text-green">
                    ▶ CONNECTED
                  </p>
                  <p className="font-body text-xs text-muted mt-0.5">{email}</p>
                </div>
                <Button variant="muted" onClick={handleDisconnect}>
                  DISCONNECT
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`font-body text-xs ${STATUS_CLASS[syncStatus]}`}
                  >
                    {STATUS_LABEL[syncStatus]}
                  </p>
                  {lastSynced && (
                    <p className="font-body text-xs text-muted mt-0.5">
                      {lastSynced.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
                <Button
                  variant="muted"
                  onClick={syncNow}
                  disabled={syncStatus === "syncing"}
                >
                  SYNC NOW
                </Button>
              </div>
            </>
          ) : (
            <Button
              variant="primary"
              onClick={handleConnect}
              className="w-full text-center"
            >
              CONNECT GOOGLE DRIVE
            </Button>
          )}
        </div>
      </section>

      <section className="mb-8">
        <p className={SECTION_LABEL}>{"// Data"}</p>
        <div className={PANEL}>
          <Button
            variant="secondary"
            onClick={handleExport}
            className="w-full text-center"
          >
            EXPORT 93_HABITS_LOG.MD
          </Button>
          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            className="w-full text-center"
          >
            IMPORT 93_HABITS_LOG.MD
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,text/markdown"
            className="hidden"
            onChange={handleImport}
          />
          {toast && (
            <p className={`font-body text-xs ${TOAST_CLASS[toast.type]}`}>
              {toast.message}
            </p>
          )}
        </div>
      </section>

      <section>
        <p className={SECTION_LABEL}>{"// About"}</p>
        <div className={`${PANEL} gap-1`}>
          <p className="font-display text-xs text-foreground">93 HABITS</p>
          <p className="font-body text-xs text-muted">v{VERSION}</p>
        </div>
      </section>
    </div>
  );
}

export default function SettingsContent() {
  return (
    <Suspense>
      <SettingsInner />
    </Suspense>
  );
}
