export type Severity = 0 | 1 | 2;
export type HabitDirection = "reducing" | "building";
export type HabitLogType = "boolean" | "severity";

export interface Habit {
  key: string;
  label: string;
  emoji: string;
  color: string;
  direction: HabitDirection;
  logType: HabitLogType;
  order: number;
}

export function nextSeverity(
  current: Severity | undefined,
  logType: HabitLogType,
): Severity | undefined {
  if (logType === "boolean") {
    if (current === undefined) return 0;
    if (current === 0) return 1;
    return undefined;
  }
  if (current === undefined) return 0;
  if (current === 0) return 1;
  if (current === 1) return 2;
  return undefined;
}

export const HABIT_COLORS = [
  "#00f5ff", // cyan
  "#ff44cc", // magenta
  "#ffdd00", // yellow
  "#39ff14", // green
  "#ff4466", // red
  "#ff8833", // orange
  "#cc66ff", // purple
  "#4488ff", // blue
];

const HABITS_KEY = "habit-definitions";
const listeners = new Set<() => void>();
let snapshot: Habit[] = [];
let initialized = false;

function readHabits(): Habit[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HABITS_KEY);
    if (raw) return JSON.parse(raw) as Habit[];
    return [];
  } catch {
    return [];
  }
}

function writeHabits(habits: Habit[]): void {
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

function notifyHabits(): void {
  snapshot = readHabits();
  listeners.forEach((fn) => fn());
}

export function subscribeToHabits(listener: () => void): () => void {
  if (!initialized && typeof window !== "undefined") {
    initialized = true;
    snapshot = readHabits();
    Promise.resolve().then(() => listeners.forEach((fn) => fn()));
  }
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getHabitsSnapshot(): Habit[] {
  return snapshot;
}

const EMPTY_HABITS: Habit[] = [];
export function getServerHabitsSnapshot(): Habit[] {
  return EMPTY_HABITS;
}

export function getHabits(): Habit[] {
  return readHabits();
}

export function addHabit(habit: Omit<Habit, "order">): void {
  const habits = readHabits();
  const order =
    habits.length > 0 ? Math.max(...habits.map((h) => h.order)) + 1 : 0;
  writeHabits([...habits, { ...habit, order }]);
  notifyHabits();
}

export function updateHabit(
  key: string,
  updates: Omit<Habit, "key" | "order">,
): void {
  const habits = readHabits();
  writeHabits(habits.map((h) => (h.key === key ? { ...h, ...updates } : h)));
  notifyHabits();
}

export function removeHabit(key: string): void {
  writeHabits(readHabits().filter((h) => h.key !== key));
  notifyHabits();
}

export function reorderHabits(keys: string[]): void {
  const habits = readHabits();
  const byKey = Object.fromEntries(habits.map((h) => [h.key, h]));
  const reordered = keys
    .map((k, i) => ({ ...byKey[k], order: i }))
    .filter(Boolean);
  writeHabits(reordered);
  notifyHabits();
}
