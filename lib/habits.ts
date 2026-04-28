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

export const SEVERITY_CYCLE: Record<Severity, Severity> = { 0: 1, 1: 2, 2: 0 };
export const BOOLEAN_CYCLE: Record<0 | 1, 0 | 1> = { 0: 1, 1: 0 };

export function nextSeverity(current: Severity, logType: HabitLogType): Severity {
  if (logType === "boolean") return current === 0 ? 1 : 0;
  return SEVERITY_CYCLE[current];
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

const DEFAULT_HABITS: Habit[] = [
  { key: "red_meat", label: "Red Meat", emoji: "🥩", color: "#ff4466", direction: "reducing", logType: "severity", order: 0 },
  { key: "poultry", label: "Poultry", emoji: "🍗", color: "#ff8833", direction: "reducing", logType: "severity", order: 1 },
  { key: "fish", label: "Fish", emoji: "🐟", color: "#00f5ff", direction: "reducing", logType: "severity", order: 2 },
  { key: "alcohol", label: "Alcohol", emoji: "🍷", color: "#cc66ff", direction: "reducing", logType: "severity", order: 3 },
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
    // First load — seed defaults
    localStorage.setItem(HABITS_KEY, JSON.stringify(DEFAULT_HABITS));
    return DEFAULT_HABITS;
  } catch {
    return DEFAULT_HABITS;
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

export function getServerHabitsSnapshot(): Habit[] {
  return [];
}

export function getHabits(): Habit[] {
  return readHabits();
}

export function addHabit(habit: Omit<Habit, "order">): void {
  const habits = readHabits();
  const order = habits.length > 0 ? Math.max(...habits.map((h) => h.order)) + 1 : 0;
  writeHabits([...habits, { ...habit, order }]);
  notifyHabits();
}

export function updateHabit(key: string, updates: Omit<Habit, "key" | "order">): void {
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
  const reordered = keys.map((k, i) => ({ ...byKey[k], order: i })).filter(Boolean);
  writeHabits(reordered);
  notifyHabits();
}
