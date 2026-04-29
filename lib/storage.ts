import type { Severity } from "./habits";

const STORAGE_KEY = "habit-logs";

export type DayLogs = Partial<Record<string, Severity>>;
export type AllLogs = Partial<Record<string, DayLogs>>;

const EMPTY_LOGS: AllLogs = {};
const listeners = new Set<() => void>();
let snapshot: AllLogs = EMPTY_LOGS;

function readAll(): AllLogs {
  if (typeof window === "undefined") return EMPTY_LOGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AllLogs) : EMPTY_LOGS;
  } catch {
    return EMPTY_LOGS;
  }
}

function writeAll(logs: AllLogs): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

function notify(): void {
  snapshot = readAll();
  listeners.forEach((fn) => fn());
}

export function subscribeToLogs(listener: () => void): () => void {
  if (listeners.size === 0 && typeof window !== "undefined") {
    const loaded = readAll();
    if (loaded !== snapshot) {
      snapshot = loaded;
      // Notify after subscribe returns so React can schedule a re-render
      // without conflicting with the current render/hydration pass
      Promise.resolve().then(() => listeners.forEach((fn) => fn()));
    }
  }
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getLogsSnapshot(): AllLogs {
  return snapshot;
}

export function getServerLogsSnapshot(): AllLogs {
  return EMPTY_LOGS;
}

export function getLog(date: string, habit: string): Severity | undefined {
  return readAll()[date]?.[habit];
}

export function getAllLogs(): AllLogs {
  return readAll();
}

export function setAllLogs(logs: AllLogs): void {
  writeAll(logs);
  notify();
}

let onWriteCallback: (() => void) | null = null;
export function setWriteCallback(fn: () => void): void {
  onWriteCallback = fn;
}

export function setLog(
  date: string,
  habit: string,
  severity: Severity | undefined,
): void {
  const logs = { ...readAll() };
  if (severity === undefined) {
    if (logs[date]) {
      const day = { ...logs[date] };
      delete day[habit];
      if (Object.keys(day).length === 0) {
        delete logs[date];
      } else {
        logs[date] = day;
      }
    }
  } else {
    logs[date] = { ...(logs[date] ?? {}), [habit]: severity };
  }
  writeAll(logs);
  notify();
  onWriteCallback?.();
}
