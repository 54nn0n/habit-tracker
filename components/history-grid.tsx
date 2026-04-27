"use client";

import { useMemo, useCallback } from "react";
import type { Habit, Severity } from "@/lib/habits";
import { buildYearGrid, severityColor, hexToRgba } from "@/lib/date-utils";
import HabitHeader from "@/components/habit-header";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const CELL = 12;
const ROW_GAP = 4;

interface HistoryGridProps {
  habit: Habit;
  logs: Record<string, Severity>;
  onDaySelect: (dateStr: string) => void;
}

interface CellProps {
  date: string | null;
  severity: Severity;
  color: string;
  onSelect: (date: string) => void;
}

function GridCell({ date, severity, color, onSelect }: CellProps) {
  const handleClick = useCallback(() => {
    if (date) onSelect(date);
  }, [date, onSelect]);

  return (
    <div
      role={date ? "button" : undefined}
      tabIndex={date ? 0 : undefined}
      onClick={date ? handleClick : undefined}
      onKeyDown={date ? (e) => e.key === "Enter" && handleClick() : undefined}
      aria-label={date ? `${date}, severity ${severity}` : undefined}
      style={{
        width: CELL,
        height: CELL,
        flexShrink: 0,
        backgroundColor: date
          ? severity === 0
            ? hexToRgba(color, 0.12)
            : severityColor(severity, color)
          : "transparent",
        cursor: date ? "pointer" : "default",
      }}
    />
  );
}

export default function HistoryGrid({
  habit,
  logs,
  onDaySelect,
}: HistoryGridProps) {
  const weeks = useMemo(() => buildYearGrid(), []);
  const year = useMemo(() => String(new Date().getFullYear()), []);

  const handleSelect = useCallback(
    (date: string) => onDaySelect(date),
    [onDaySelect],
  );

  return (
    <div className="bg-surface border-2 border-border p-3 shadow-px">
      <div className="mb-3">
        <HabitHeader habit={habit} subtitle={year} />
      </div>

      <div className="flex items-center" style={{ marginBottom: ROW_GAP }}>
        <div className="flex-1 flex justify-between">
          {DAY_LABELS.map((label, i) => (
            <div
              key={i}
              className="font-body text-[7px] text-muted text-center"
              style={{ width: CELL }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col" style={{ gap: ROW_GAP }}>
        {weeks.map((week, wi) => (
          <div key={wi} className="flex items-center">
            <div className="flex-1 flex justify-between items-center">
              {week.map((date, di) => (
                <GridCell
                  key={di}
                  date={date}
                  severity={date ? (logs[date] ?? 0) : 0}
                  color={habit.color}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
