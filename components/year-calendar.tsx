"use client";

import { useMemo, useCallback } from "react";
import type { Habit, HabitLogType, Severity } from "@/lib/habits";
import {
  buildCalendarYear,
  computeYearStats,
  toLocalDateString,
  hexToRgba,
  severityColor,
} from "@/lib/date-utils";
import type { MonthGrid } from "@/lib/date-utils";
import HabitHeader from "@/components/habit-header";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

interface YearCalendarProps {
  habit: Habit;
  logs: Record<string, Severity>;
  onDaySelect: (dateStr: string) => void;
}

interface MonthViewProps {
  grid: MonthGrid;
  logs: Record<string, Severity>;
  color: string;
  logType: HabitLogType;
  todayStr: string;
  onDaySelect: (dateStr: string) => void;
}

function MonthView({
  grid,
  logs,
  color,
  logType,
  todayStr,
  onDaySelect,
}: MonthViewProps) {
  const { year, month, weeks } = grid;
  const monthStr = `${year}-${String(month).padStart(2, "0")}`;
  const isFutureMonth = monthStr > todayStr.slice(0, 7);

  return (
    <div>
      <p
        className={`font-body text-xs font-bold mb-1.5 ${isFutureMonth ? "text-muted" : "text-foreground"}`}
      >
        {MONTH_NAMES[month - 1]}
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 2,
        }}
      >
        {weeks.map((week, wi) =>
          week.map((day, di) => {
            if (!day) {
              return <div key={`${wi}-${di}`} style={{ aspectRatio: "1" }} />;
            }
            const dateStr = `${monthStr}-${String(day).padStart(2, "0")}`;
            const isFuture = dateStr > todayStr;
            const isToday = dateStr === todayStr;
            const severity = logs[dateStr];
            const isFull =
              !isFuture &&
              severity !== undefined &&
              severity > 0 &&
              (logType === "boolean" || severity === 2);
            const bgColor =
              !isFuture && severity !== undefined && severity > 0
                ? isFull
                  ? hexToRgba(color, 1)
                  : severityColor(severity, color)
                : "transparent";
            const insetShadow =
              !isFuture && severity === 0
                ? `inset 0 0 0 1px ${hexToRgba(color, 0.4)}`
                : undefined;

            return (
              <button
                key={`${wi}-${di}`}
                type="button"
                onClick={isFuture ? undefined : () => onDaySelect(dateStr)}
                disabled={isFuture}
                aria-label={dateStr}
                style={{
                  aspectRatio: "1",
                  backgroundColor: bgColor,
                  boxShadow: insetShadow,
                  outline: isToday
                    ? `2px solid var(--color-yellow)`
                    : undefined,
                  outlineOffset: -1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: isFuture ? "default" : "pointer",
                }}
              >
                <span
                  className={`font-body leading-none inline min-[320px]:hidden min-[360px]:inline ${isToday ? "font-bold text-xs" : "text-[9px]"}`}
                  style={{
                    color: isFuture
                      ? hexToRgba("#9999bb", 0.4)
                      : isFull
                        ? "#0a0a0f"
                        : "var(--color-foreground)",
                  }}
                >
                  {day}
                </span>
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}

export default function YearCalendar({
  habit,
  logs,
  onDaySelect,
}: YearCalendarProps) {
  const year = useMemo(() => new Date().getFullYear(), []);
  const todayStr = useMemo(() => toLocalDateString(new Date()), []);
  const months = useMemo(() => buildCalendarYear(year), [year]);
  const stats = useMemo(
    () => computeYearStats(logs, year, habit.direction),
    [logs, year, habit.direction],
  );

  const handleDaySelect = useCallback(
    (dateStr: string) => onDaySelect(dateStr),
    [onDaySelect],
  );

  return (
    <div className="bg-surface border-2 border-border p-4 shadow-px">
      <div className="mb-4">
        <HabitHeader habit={habit} subtitle={String(year)} />
        <div className="mt-2">
          <p className="font-body text-xs text-foreground">
            {stats.loggedDays}/{stats.totalDays} · {stats.percentage}%
          </p>
          <p className="font-body text-xs text-muted">
            {stats.longestStreak}d streak
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 min-[320px]:grid-cols-2 min-[420px]:grid-cols-3 gap-4">
        {months.map((grid) => (
          <MonthView
            key={grid.month}
            grid={grid}
            logs={logs}
            color={habit.color}
            logType={habit.logType}
            todayStr={todayStr}
            onDaySelect={handleDaySelect}
          />
        ))}
      </div>
    </div>
  );
}
