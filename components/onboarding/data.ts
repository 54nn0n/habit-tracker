import type { HabitDirection, HabitLogType } from "@/lib/habits";

export interface Suggestion {
  emoji: string;
  label: string;
  direction: HabitDirection;
  logType: HabitLogType;
  color: string;
}

export const SUGGESTIONS: Suggestion[] = [
  {
    emoji: "🥩",
    label: "Red Meat",
    direction: "reducing",
    logType: "severity",
    color: "#ff4466",
  },
  {
    emoji: "🍷",
    label: "Alcohol",
    direction: "reducing",
    logType: "severity",
    color: "#cc66ff",
  },
  {
    emoji: "🚬",
    label: "Smoking",
    direction: "reducing",
    logType: "boolean",
    color: "#ff8833",
  },
  {
    emoji: "🍬",
    label: "Sugar",
    direction: "reducing",
    logType: "severity",
    color: "#ff44cc",
  },
  {
    emoji: "🏃",
    label: "Running",
    direction: "building",
    logType: "boolean",
    color: "#39ff14",
  },
  {
    emoji: "🧘",
    label: "Meditation",
    direction: "building",
    logType: "boolean",
    color: "#00f5ff",
  },
  {
    emoji: "📖",
    label: "Reading",
    direction: "building",
    logType: "boolean",
    color: "#ffdd00",
  },
  {
    emoji: "💧",
    label: "Hydration",
    direction: "building",
    logType: "boolean",
    color: "#4488ff",
  },
];

export function toKey(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}
