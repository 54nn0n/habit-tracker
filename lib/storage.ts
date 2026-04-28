import type { HabitKey, Severity } from "./habits";

const STORAGE_KEY = "habit-logs";

type DayLogs = Partial<Record<HabitKey, Severity>>;
export type AllLogs = Record<string, DayLogs>;

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
    snapshot = readAll();
  }
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getLogsSnapshot(): AllLogs {
  if (snapshot === EMPTY_LOGS && typeof window !== "undefined") {
    snapshot = readAll();
  }
  return snapshot;
}

export function getServerLogsSnapshot(): AllLogs {
  return EMPTY_LOGS;
}

export function getLog(date: string, habit: HabitKey): Severity {
  return readAll()[date]?.[habit] ?? 0;
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
  habit: HabitKey,
  severity: Severity,
): void {
  const logs = readAll();
  logs[date] = { ...logs[date], [habit]: severity };
  writeAll(logs);
  notify();
  onWriteCallback?.();
}
