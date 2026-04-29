"use client";

import { useMemo } from "react";
import type { AllLogs } from "@/lib/storage";
import { useHabits } from "@/lib/use-habits";
import { toLocalDateString, hexToRgba } from "@/lib/date-utils";

interface Last30DaysProps {
  allLogs: AllLogs;
}

export default function Last30Days({ allLogs }: Last30DaysProps) {
  const habits = useHabits();

  const days = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (29 - i));
      return toLocalDateString(d);
    });
  }, []);

  return (
    <div className="bg-surface border-2 border-border p-4 shadow-px">
      <p className="font-display text-xs text-accent tracking-[2px] mb-3">
        LAST 30 DAYS
      </p>
      <div className="flex flex-col gap-2.5">
        {habits.map((habit) => (
          <div key={habit.key} className="flex items-center gap-2">
            <span
              className="text-base leading-none shrink-0 w-5"
              role="img"
              aria-label={habit.label}
            >
              {habit.emoji}
            </span>
            <div className="flex-1 flex gap-px">
              {days.map((dateStr) => {
                const severity = allLogs[dateStr]?.[habit.key];
                const isFull =
                  severity !== undefined &&
                  severity > 0 &&
                  (habit.logType === "boolean" || severity === 2);
                return (
                  <div
                    key={dateStr}
                    className="flex-1 aspect-square"
                    style={{
                      backgroundColor:
                        severity !== undefined && severity > 0
                          ? hexToRgba(habit.color, isFull ? 1 : 0.5)
                          : "transparent",
                      boxShadow:
                        severity === 0
                          ? `inset 0 0 0 1px ${hexToRgba(habit.color, 0.4)}`
                          : undefined,
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
