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

const VERSION = "0.2.0";

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

const SECTION_LABEL =
  "font-display text-[8px] text-accent tracking-[2px] uppercase mb-2";
const PANEL =
  "bg-surface border-2 border-border p-4 flex flex-col gap-3 shadow-px";
const BTN_GHOST =
  "font-body text-[10px] text-accent border-2 border-accent px-3.5 py-2 bg-transparent cursor-pointer tracking-[0.5px] shadow-px-accent";
const BTN_BLOCK = `${BTN_GHOST} w-full p-3 text-center`;
const BTN_MUTED =
  "font-body text-[10px] text-muted border border-border px-3 py-1.5 bg-transparent cursor-pointer";

function SettingsInner() {
  const searchParams = useSearchParams();
  const [connected, setConnected] = useState(() => isConnected());
  const [email, setEmail] = useState(() => getEmail());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return subscribeSyncStatus((s, t) => {
      setSyncStatus(s);
      setLastSynced(t);
    });
  }, []);

  const handleConnect = useCallback(() => startGoogleAuth(), []);

  const handleDisconnect = useCallback(() => {
    disconnect();
    setConnected(false);
    setEmail(null);
  }, []);

  const handleExport = useCallback(() => {
    const md = encodeLogs(getAllLogs());
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "93_Habits_Log.md";
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleImport = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        setAllLogs(decodeLogs(ev.target?.result as string));
        setImportError(null);
        syncNow();
      } catch {
        setImportError("Could not parse file.");
      }
    };
    reader.readAsText(file);
  }, []);

  const authError = searchParams.get("error");

  return (
    <div className="px-4 pt-10 pb-20 max-w-lg mx-auto w-full">
      <header className="mb-8">
        <p className="font-body text-[9px] text-muted uppercase tracking-[3px]">
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
            <p className="font-body text-[10px] text-red">
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
                  <p className="font-body text-[9px] text-muted mt-0.5">
                    {email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className={BTN_MUTED}
                >
                  DISCONNECT
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`font-body text-[10px] ${STATUS_CLASS[syncStatus]}`}
                  >
                    {STATUS_LABEL[syncStatus]}
                  </p>
                  {lastSynced && (
                    <p className="font-body text-[9px] text-muted mt-0.5">
                      {lastSynced.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={syncNow}
                  disabled={syncStatus === "syncing"}
                  className={`${BTN_MUTED} disabled:opacity-40`}
                >
                  SYNC NOW
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={handleConnect}
              className="font-display text-[9px] text-background bg-accent border-2 border-accent w-full p-3 text-center cursor-pointer shadow-px-accent"
            >
              CONNECT GOOGLE DRIVE
            </button>
          )}
        </div>
      </section>

      <section className="mb-8">
        <p className={SECTION_LABEL}>{"// Data"}</p>
        <div className={PANEL}>
          <button type="button" onClick={handleExport} className={BTN_BLOCK}>
            EXPORT 93_HABITS_LOG.MD
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={BTN_BLOCK}
          >
            IMPORT 93_HABITS_LOG.MD
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,text/markdown"
            className="hidden"
            onChange={handleImport}
          />
          {importError && (
            <p className="font-body text-[10px] text-red">✕ {importError}</p>
          )}
        </div>
      </section>

      <section>
        <p className={SECTION_LABEL}>{"// About"}</p>
        <div className={`${PANEL} gap-1`}>
          <p className="font-display text-[9px] text-foreground">93 HABITS</p>
          <p className="font-body text-[10px] text-muted">v{VERSION}</p>
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
