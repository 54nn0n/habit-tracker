export type HabitKey = "red_meat" | "poultry" | "fish" | "alcohol";
export type Severity = 0 | 1 | 2 | 3;

export interface Habit {
  key: HabitKey;
  label: string;
  emoji: string;
  color: string;
}

export const HABITS: Habit[] = [
  { key: "red_meat", label: "Red Meat", emoji: "🥩", color: "#ff4466" },
  { key: "poultry", label: "Poultry", emoji: "🍗", color: "#ff8833" },
  { key: "fish", label: "Fish", emoji: "🐟", color: "#00f5ff" },
  { key: "alcohol", label: "Alcohol", emoji: "🍷", color: "#cc66ff" },
];

export const SEVERITY_CYCLE: Record<Severity, Severity> = {
  0: 1,
  1: 2,
  2: 3,
  3: 0,
};
