"use client";

import { useState, useEffect, useCallback } from "react";
import {
  isConnected,
  getEmail,
  startGoogleAuth,
  disconnect,
} from "@/lib/google-auth";
import { subscribeSyncStatus, syncNow } from "@/lib/sync";
import type { SyncStatus } from "@/lib/sync";
import Button from "@/components/button";

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

const PANEL =
  "bg-surface border-2 border-border p-4 flex flex-col gap-3 shadow-px";

interface DriveSectionProps {
  authError: string | null;
}

export default function DriveSection({ authError }: DriveSectionProps) {
  const [connected, setConnected] = useState(() => isConnected());
  const [email, setEmail] = useState(() => getEmail());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

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

  return (
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
              <p className="font-body text-[11px] text-green">▶ CONNECTED</p>
              <p className="font-body text-xs text-muted mt-0.5">{email}</p>
            </div>
            <Button variant="ghost" onClick={handleDisconnect}>
              DISCONNECT
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-body text-xs ${STATUS_CLASS[syncStatus]}`}>
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
              variant="ghost"
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
  );
}
