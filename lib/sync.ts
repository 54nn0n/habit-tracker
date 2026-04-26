export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

type Listener = (status: SyncStatus, lastSynced: Date | null) => void;

let status: SyncStatus = 'idle';
let lastSynced: Date | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<Listener>();

function emit(): void {
  listeners.forEach((fn) => fn(status, lastSynced));
}

export function subscribeSyncStatus(fn: Listener): () => void {
  listeners.add(fn);
  fn(status, lastSynced);
  return () => listeners.delete(fn);
}

export function scheduleSync(): void {
  if (timer) clearTimeout(timer);
  timer = setTimeout(syncNow, 2000);
}

export async function syncNow(): Promise<void> {
  const [{ isConnected }, { writeFile }, { encodeLogs }, { getAllLogs }] = await Promise.all([
    import('./google-auth'),
    import('./google-drive'),
    import('./md-codec'),
    import('./storage'),
  ]);

  if (!isConnected()) return;
  status = 'syncing';
  emit();
  try {
    await writeFile(encodeLogs(getAllLogs()));
    lastSynced = new Date();
    status = 'synced';
  } catch {
    status = 'error';
  }
  emit();
}

export async function loadFromDrive(): Promise<void> {
  const [{ isConnected }, { readFile }, { decodeLogs }, { getAllLogs, setAllLogs }] =
    await Promise.all([
      import('./google-auth'),
      import('./google-drive'),
      import('./md-codec'),
      import('./storage'),
    ]);

  if (!isConnected()) return;
  try {
    const md = await readFile();
    if (!md) return;
    setAllLogs({ ...decodeLogs(md), ...getAllLogs() });
  } catch {
    // silent — local data wins if Drive unreachable on load
  }
}

export function getSyncStatus(): SyncStatus { return status; }
export function getLastSynced(): Date | null { return lastSynced; }
