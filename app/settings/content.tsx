'use client';

import { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { isConnected, getEmail, startGoogleAuth, disconnect } from '@/lib/google-auth';
import { subscribeSyncStatus, syncNow } from '@/lib/sync';
import type { SyncStatus } from '@/lib/sync';
import { encodeLogs, decodeLogs } from '@/lib/md-codec';
import { getAllLogs, setAllLogs } from '@/lib/storage';

const VERSION = '0.2.0';

const STATUS_LABEL: Record<SyncStatus, string> = {
  idle: 'Not synced yet',
  syncing: 'Syncing…',
  synced: 'Synced',
  error: 'Sync failed',
};

function SettingsInner() {
  const searchParams = useSearchParams();
  const [connected, setConnected] = useState(() => isConnected());
  const [email, setEmail] = useState(() => getEmail());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
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
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'habit-log.md';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        setAllLogs(decodeLogs(ev.target?.result as string));
        setImportError(null);
        syncNow();
      } catch {
        setImportError("Could not parse file. Make sure it's a valid habit-log.md.");
      }
    };
    reader.readAsText(file);
  }, []);

  const authError = searchParams.get('error');

  return (
    <div className="px-4 pt-10 pb-20 max-w-lg mx-auto w-full">
      <header className="mb-8">
        <p className="text-muted text-xs uppercase tracking-widest">App</p>
        <h1 className="text-3xl font-bold text-foreground mt-0.5" style={{ fontFamily: 'var(--font-syne)' }}>
          Settings
        </h1>
      </header>

      <section className="mb-8">
        <p className="font-bold uppercase tracking-widest text-muted mb-3" style={{ fontSize: 10 }}>Google Drive</p>
        <div className="bg-surface rounded-2xl p-4 shadow-sm flex flex-col gap-4">
          {authError && (
            <p className="text-xs" style={{ color: '#E8412A' }}>Connection failed. Please try again.</p>
          )}
          {connected ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Connected</p>
                  <p className="text-xs text-muted">{email}</p>
                </div>
                <button type="button" onClick={handleDisconnect}
                  className="text-xs text-muted font-medium px-3 py-1.5 rounded-lg bg-background">
                  Disconnect
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-foreground">{STATUS_LABEL[syncStatus]}</p>
                  {lastSynced && (
                    <p className="text-xs text-muted">
                      {lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
                <button type="button" onClick={syncNow} disabled={syncStatus === 'syncing'}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-background text-foreground disabled:opacity-40">
                  Sync now
                </button>
              </div>
            </>
          ) : (
            <button type="button" onClick={handleConnect}
              className="w-full py-3 rounded-xl text-sm font-bold text-surface"
              style={{ backgroundColor: 'var(--color-foreground)' }}>
              Connect Google Drive
            </button>
          )}
        </div>
      </section>

      <section className="mb-8">
        <p className="font-bold uppercase tracking-widest text-muted mb-3" style={{ fontSize: 10 }}>Data</p>
        <div className="bg-surface rounded-2xl p-4 shadow-sm flex flex-col gap-3">
          <button type="button" onClick={handleExport}
            className="w-full py-3 rounded-xl text-sm font-medium text-foreground bg-background">
            Export habit-log.md
          </button>
          <button type="button" onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 rounded-xl text-sm font-medium text-foreground bg-background">
            Import habit-log.md
          </button>
          <input ref={fileInputRef} type="file" accept=".md,text/markdown"
            className="hidden" onChange={handleImport} />
          {importError && <p className="text-xs" style={{ color: '#E8412A' }}>{importError}</p>}
        </div>
      </section>

      <section>
        <p className="font-bold uppercase tracking-widest text-muted mb-3" style={{ fontSize: 10 }}>About</p>
        <div className="bg-surface rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-foreground font-medium">Habits</p>
          <p className="text-xs text-muted mt-0.5">Version {VERSION}</p>
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
