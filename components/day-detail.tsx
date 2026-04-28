"use client";

import { useCallback } from "react";
import type { MouseEvent } from "react";
import { HABITS } from "@/lib/habits";
import type { Severity } from "@/lib/habits";
import { formatDayDetail } from "@/lib/date-utils";

const SEVERITY_LABELS: Record<Severity, string> = {
  0: "None",
  1: "Light",
  2: "Heavy",
};

interface DayDetailProps {
  dateStr: string;
  logs: Record<string, Severity>;
  onClose: () => void;
}

export default function DayDetail({ dateStr, logs, onClose }: DayDetailProps) {
  const handleBackdropClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  const allZero = HABITS.every((h) => (logs[h.key] ?? 0) === 0);

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
          <h2 className="font-display text-[10px] text-accent">
            {formatDayDetail(dateStr)}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="font-body text-[10px] text-muted border border-border px-2.5 py-1 bg-transparent cursor-pointer"
          >
            CLOSE
          </button>
        </div>

        {allZero ? (
          <p className="font-body text-[11px] text-muted">Nothing logged</p>
        ) : (
          <div className="flex flex-col gap-4">
            {HABITS.map((habit) => {
              const severity = logs[habit.key] ?? 0;
              if (severity === 0) return null;
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
                    className="font-display text-[8px] text-background px-2 py-1"
                    style={{
                      backgroundColor: habit.color,
                      border: `1px solid ${habit.color}`,
                    }}
                  >
                    {SEVERITY_LABELS[severity]}
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
