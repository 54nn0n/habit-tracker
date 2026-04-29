"use client";

import { useCallback } from "react";
import type { MouseEvent } from "react";
import type { Severity, HabitLogType } from "@/lib/habits";
import { useHabits } from "@/lib/use-habits";
import { formatDayDetail } from "@/lib/date-utils";
import Button from "@/components/button";

const SEVERITY_LABELS: Record<
  HabitLogType,
  Partial<Record<Severity, string>>
> = {
  boolean: { 0: "None", 1: "Done" },
  severity: { 0: "None", 1: "Light", 2: "Heavy" },
};

interface DayDetailProps {
  dateStr: string;
  logs: Partial<Record<string, Severity>>;
  onClose: () => void;
}

export default function DayDetail({ dateStr, logs, onClose }: DayDetailProps) {
  const habits = useHabits();

  const handleBackdropClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  const nothingLogged = habits.every((h) => logs[h.key] === undefined);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/70"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full p-6 pb-10 max-w-lg mx-auto bg-surface border-t-2 border-t-accent"
        style={{ boxShadow: "0 -4px 0 var(--color-cyan-dim)" }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xs text-accent">
            {formatDayDetail(dateStr)}
          </h2>
          <Button
            variant="muted"
            size="sm"
            onClick={onClose}
            aria-label="Close"
          >
            CLOSE
          </Button>
        </div>

        {nothingLogged ? (
          <p className="font-body text-[11px] text-muted">Nothing logged</p>
        ) : (
          <div className="flex flex-col gap-4">
            {habits.map((habit) => {
              const severity = logs[habit.key];
              if (severity === undefined) return null;
              return (
                <div
                  key={habit.key}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xl"
                      role="img"
                      aria-label={habit.label}
                    >
                      {habit.emoji}
                    </span>
                    <span className="font-body text-[11px] text-foreground">
                      {habit.label}
                    </span>
                  </div>
                  <span
                    className="font-display text-[8px] px-2 py-1"
                    style={
                      severity === 0
                        ? {
                            color: habit.color,
                            border: `1px solid ${habit.color}`,
                          }
                        : {
                            backgroundColor: habit.color,
                            color: "var(--color-background)",
                            border: `1px solid ${habit.color}`,
                          }
                    }
                  >
                    {SEVERITY_LABELS[habit.logType][severity]}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
