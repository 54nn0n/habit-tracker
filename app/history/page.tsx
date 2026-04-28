"use client";

import { useState, useMemo, useCallback } from "react";
import { HABITS } from "@/lib/habits";
import type { HabitKey, Severity } from "@/lib/habits";
import { useLogs } from "@/lib/use-logs";
import YearCalendar from "@/components/year-calendar";
import Last30Days from "@/components/last-30-days";
import DayDetail from "@/components/day-detail";

type PerHabitLogs = Record<HabitKey, Record<string, Severity>>;

function derivePerHabitLogs(allLogs: ReturnType<typeof useLogs>): PerHabitLogs {
  const result: PerHabitLogs = {
    red_meat: {},
    poultry: {},
    fish: {},
    alcohol: {},
  };
  for (const [date, dayLogs] of Object.entries(allLogs)) {
    for (const habit of HABITS) {
      const s = dayLogs[habit.key];
      if (s !== undefined && s > 0) result[habit.key][date] = s;
    }
  }
  return result;
}

export default function YearPage() {
  const allLogs = useLogs();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const perHabitLogs = useMemo(() => derivePerHabitLogs(allLogs), [allLogs]);

  const selectedDayLogs = useMemo((): Record<string, Severity> => {
    if (!selectedDate) return {};
    const day = allLogs[selectedDate] ?? {};
    return Object.fromEntries(HABITS.map((h) => [h.key, day[h.key] ?? 0]));
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

        {HABITS.map((habit) => (
          <YearCalendar
            key={habit.key}
            habit={habit}
            logs={perHabitLogs[habit.key]}
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
