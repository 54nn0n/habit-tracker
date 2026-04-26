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
  idle: 'NOT SYNCED YET',
  syncing: 'SYNCING...',
  synced: 'SYNCED',
  error: 'SYNC FAILED',
};

const STATUS_COLOR: Record<SyncStatus, string> = {
  idle: 'var(--color-muted)',
  syncing: 'var(--color-yellow)',
  synced: 'var(--color-green)',
  error: 'var(--color-red)',
};

const sectionLabel: React.CSSProperties = {
  fontFamily: 'var(--font-syne)',
  fontSize: 8,
  color: 'var(--color-accent)',
  letterSpacing: 2,
  textTransform: 'uppercase' as const,
  marginBottom: 8,
};

const panel: React.CSSProperties = {
  backgroundColor: 'var(--color-surface)',
  border: '2px solid var(--color-border)',
  boxShadow: 'var(--px-shadow) var(--color-border)',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column' as const,
  gap: 12,
};

const btnGhost: React.CSSProperties = {
  fontFamily: 'var(--font-dm-sans)',
  fontSize: 10,
  color: 'var(--color-accent)',
  border: '2px solid var(--color-accent)',
  boxShadow: '4px 4px 0 var(--color-cyan-dim)',
  padding: '8px 14px',
  background: 'transparent',
  cursor: 'pointer',
  letterSpacing: 0.5,
};

const btnBlock: React.CSSProperties = {
  ...btnGhost,
  width: '100%',
  padding: '12px',
  textAlign: 'center' as const,
};

const btnMuted: React.CSSProperties = {
  fontFamily: 'var(--font-dm-sans)',
  fontSize: 10,
  color: 'var(--color-muted)',
  border: '1px solid var(--color-border)',
  padding: '6px 12px',
  background: 'transparent',
  cursor: 'pointer',
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
    a.download = '93_Habits_Log.md';
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
        setImportError('Could not parse file.');
      }
    };
    reader.readAsText(file);
  }, []);

  const authError = searchParams.get('error');

  return (
    <div className="px-4 pt-10 pb-20 max-w-lg mx-auto w-full">
      <header className="mb-8">
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 9, color: 'var(--color-muted)', letterSpacing: 3, textTransform: 'uppercase' }}>
          App
        </p>
        <h1 className="mt-2 leading-tight" style={{ fontFamily: 'var(--font-syne)', fontSize: 22, color: 'var(--color-accent)' }}>
          SETTINGS
        </h1>
      </header>

      <section className="mb-8">
        <p style={sectionLabel}>// Google Drive</p>
        <div style={panel}>
          {authError && (
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 10, color: 'var(--color-red)' }}>
              ✕ Connection failed. Please try again.
            </p>
          )}
          {connected ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 11, color: 'var(--color-green)' }}>
                    ▶ CONNECTED
                  </p>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 9, color: 'var(--color-muted)', marginTop: 2 }}>
                    {email}
                  </p>
                </div>
                <button type="button" onClick={handleDisconnect} style={btnMuted}>
                  DISCONNECT
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 10, color: STATUS_COLOR[syncStatus] }}>
                    {STATUS_LABEL[syncStatus]}
                  </p>
                  {lastSynced && (
                    <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 9, color: 'var(--color-muted)', marginTop: 2 }}>
                      {lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
                <button type="button" onClick={syncNow} disabled={syncStatus === 'syncing'} style={{ ...btnMuted, opacity: syncStatus === 'syncing' ? 0.4 : 1 }}>
                  SYNC NOW
                </button>
              </div>
            </>
          ) : (
            <button type="button" onClick={handleConnect} style={{
              ...btnBlock,
              backgroundColor: 'var(--color-accent)',
              color: '#0a0a0f',
              border: '2px solid var(--color-accent)',
              boxShadow: '4px 4px 0 var(--color-cyan-dim)',
              fontFamily: 'var(--font-syne)',
              fontSize: 9,
            }}>
              CONNECT GOOGLE DRIVE
            </button>
          )}
        </div>
      </section>

      <section className="mb-8">
        <p style={sectionLabel}>// Data</p>
        <div style={panel}>
          <button type="button" onClick={handleExport} style={btnBlock}>
            EXPORT 93_HABITS_LOG.MD
          </button>
          <button type="button" onClick={() => fileInputRef.current?.click()} style={btnBlock}>
            IMPORT 93_HABITS_LOG.MD
          </button>
          <input ref={fileInputRef} type="file" accept=".md,text/markdown"
            className="hidden" onChange={handleImport} />
          {importError && (
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 10, color: 'var(--color-red)' }}>
              ✕ {importError}
            </p>
          )}
        </div>
      </section>

      <section>
        <p style={sectionLabel}>// About</p>
        <div style={{ ...panel, gap: 4 }}>
          <p style={{ fontFamily: 'var(--font-syne)', fontSize: 9, color: 'var(--color-foreground)' }}>
            93 HABITS
          </p>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 10, color: 'var(--color-muted)' }}>
            v{VERSION}
          </p>
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
