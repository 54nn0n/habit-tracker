"use client";

import { useMemo } from "react";
import { HABITS } from "@/lib/habits";
import type { AllLogs } from "@/lib/storage";
import { toLocalDateString, hexToRgba, severityColor } from "@/lib/date-utils";

interface Last30DaysProps {
  allLogs: AllLogs;
}

export default function Last30Days({ allLogs }: Last30DaysProps) {
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
      <p className="font-display text-[8px] text-accent tracking-[2px] mb-3">
        LAST 30 DAYS
      </p>
      <div className="flex flex-col gap-2.5">
        {HABITS.map((habit) => (
          <div key={habit.key} className="flex items-center gap-2">
            <span
              className="text-base leading-none shrink-0 w-5"
              role="img"
              aria-label={habit.label}
            >
              {habit.emoji}
            </span>
            <div className="flex-1 flex justify-between">
              {days.map((dateStr) => {
                const severity = allLogs[dateStr]?.[habit.key] ?? 0;
                return (
                  <div
                    key={dateStr}
                    style={{
                      width: 7,
                      height: 7,
                      backgroundColor:
                        severity > 0
                          ? severityColor(severity, habit.color)
                          : hexToRgba(habit.color, 0.1),
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
