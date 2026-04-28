import { useSyncExternalStore } from "react";
import {
  subscribeToHabits,
  getHabitsSnapshot,
  getServerHabitsSnapshot,
  type Habit,
} from "./habits";

export function useHabits(): Habit[] {
  return useSyncExternalStore(
    subscribeToHabits,
    getHabitsSnapshot,
    getServerHabitsSnapshot,
  );
}
