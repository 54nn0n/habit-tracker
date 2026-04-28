"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { HABITS } from "@/lib/habits";
import type { Habit, HabitKey, Severity } from "@/lib/habits";
import { setLog } from "@/lib/storage";
import { useLogs } from "@/lib/use-logs";
import {
  toLocalDateString,
  getLastNDays,
  formatMonthYear,
} from "@/lib/date-utils";
import type { HabitDayEntry } from "@/lib/date-utils";
import HabitCard from "@/components/habit-card";

const DAYS_TO_SHOW = 5;

interface HabitRowProps {
  habit: Habit;
  days: HabitDayEntry[];
  onUpdate: (habitKey: HabitKey, dateStr: string, severity: Severity) => void;
}

function HabitRow({ habit, days, onUpdate }: HabitRowProps) {
  const handleChange = useCallback(
    (dateStr: string, s: Severity) => onUpdate(habit.key, dateStr, s),
    [habit.key, onUpdate],
  );
  return (
    <HabitCard habit={habit} days={days} onSeverityChange={handleChange} />
  );
}

export default function TodayPage() {
  const todayStr = useMemo(() => toLocalDateString(new Date()), []);
  const monthYear = useMemo(() => formatMonthYear(new Date()), []);
  const baseDays = useMemo(() => getLastNDays(DAYS_TO_SHOW), []);
  const allLogs = useLogs();

  const habitRows = useMemo(
    () =>
      HABITS.map((habit) => ({
        habit,
        days: baseDays.map((day) => ({
          ...day,
          severity: allLogs[day.dateStr]?.[habit.key] ?? 0,
        })),
      })),
    [baseDays, allLogs],
  );

  const handleUpdate = useCallback(
    (key: HabitKey, dateStr: string, s: Severity) => setLog(dateStr, key, s),
    [],
  );

  return (
    <div className="px-4 pt-10 pb-4 max-w-lg mx-auto w-full">
      <header className="mb-6 flex items-start justify-between">
        <div>
          <p className="font-body text-xs text-muted uppercase tracking-[3px]">
            {monthYear}
          </p>
          <h1 className="font-display mt-2 leading-tight text-[28px] text-accent">
            {todayStr.slice(8)}
            <span className="text-muted text-[13px] ml-2.5">
              {new Date()
                .toLocaleDateString("en-US", { weekday: "long" })
                .toUpperCase()}
            </span>
          </h1>
        </div>
        <Link
          href="/settings"
          aria-label="Settings"
          className="w-10 h-10 flex items-center justify-center transition-colors mt-1 text-muted border border-border"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </Link>
      </header>

      <div className="flex flex-col gap-3">
        {habitRows.map(({ habit, days }) => (
          <HabitRow
            key={habit.key}
            habit={habit}
            days={days}
            onUpdate={handleUpdate}
          />
        ))}
      </div>
    </div>
  );
}
