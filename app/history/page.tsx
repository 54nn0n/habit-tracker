"use client";

import { useState, useMemo, useCallback } from "react";
import { useHabits } from "@/lib/use-habits";
import { useLogs } from "@/lib/use-logs";
import type { DayLogs } from "@/lib/storage";
import YearCalendar from "@/components/year-calendar";
import Last30Days from "@/components/last-30-days";
import DayDetail from "@/components/day-detail";

type PerHabitLogs = Record<string, DayLogs>;

export default function YearPage() {
  const allLogs = useLogs();
  const habits = useHabits();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const perHabitLogs = useMemo((): PerHabitLogs => {
    const result: PerHabitLogs = {};
    for (const habit of habits) result[habit.key] = {};
    for (const [date, dayLogs] of Object.entries(allLogs)) {
      if (!dayLogs) continue;
      for (const habit of habits) {
        const s = dayLogs[habit.key];
        if (s !== undefined) result[habit.key][date] = s;
      }
    }
    return result;
  }, [allLogs, habits]);

  const selectedDayLogs = useMemo((): DayLogs => {
    if (!selectedDate) return {};
    return allLogs[selectedDate] ?? {};
  }, [selectedDate, allLogs]);

  const handleDaySelect = useCallback(
    (date: string) => setSelectedDate(date),
    [],
  );
  const handleClose = useCallback(() => setSelectedDate(null), []);

  return (
    <div className="px-4 pt-10 pb-4 max-w-lg mx-auto w-full">
      <header className="mb-6">
        <p className="font-body text-xs text-muted uppercase tracking-[3px]">
          {new Date().getFullYear()}
        </p>
        <h1 className="font-display mt-2 leading-tight text-[22px] text-accent">
          YEAR
        </h1>
      </header>

      <div className="flex flex-col gap-4">
        <Last30Days allLogs={allLogs} />

        {habits.map((habit) => (
          <YearCalendar
            key={habit.key}
            habit={habit}
            logs={perHabitLogs[habit.key] ?? {}}
            onDaySelect={handleDaySelect}
          />
        ))}
      </div>

      {selectedDate && (
        <DayDetail
          dateStr={selectedDate}
          logs={selectedDayLogs}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
