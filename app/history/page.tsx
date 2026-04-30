"use client";

import { useState, useMemo, useCallback } from "react";
import { useHabits } from "@/lib/use-habits";
import { useLogs } from "@/lib/use-logs";
import type { DayLogs } from "@/lib/storage";
import YearCalendar from "@/components/year-calendar";
import Last30Days from "@/components/last-30-days";
import DayDetail from "@/components/day-detail";
import Button from "@/components/button";

type PerHabitLogs = Record<string, DayLogs>;

const CURRENT_YEAR = new Date().getFullYear();

export default function YearPage() {
  const allLogs = useLogs();
  const habits = useHabits();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [year, setYear] = useState(CURRENT_YEAR);

  const earliestYear = useMemo(() => {
    const dates = Object.keys(allLogs);
    if (dates.length === 0) return CURRENT_YEAR;
    return Math.min(...dates.map((d) => parseInt(d.slice(0, 4))));
  }, [allLogs]);

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

  const handlePrevYear = useCallback(() => setYear((y) => y - 1), []);
  const handleNextYear = useCallback(() => setYear((y) => y + 1), []);
  const handleDaySelect = useCallback(
    (date: string) => setSelectedDate(date),
    [],
  );
  const handleClose = useCallback(() => setSelectedDate(null), []);

  return (
    <div className="px-4 pt-10 pb-4 max-w-lg mx-auto w-full">
      <header className="mb-6">
        <p className="font-body text-xs text-muted uppercase tracking-[3px]">
          History
        </p>
        <div className="flex items-center justify-between mt-2">
          <h1 className="font-display leading-tight text-[22px] text-accent">
            {year}
          </h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevYear}
              disabled={year <= earliestYear}
            >
              ◀
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextYear}
              disabled={year >= CURRENT_YEAR}
            >
              ▶
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-4">
        {year === CURRENT_YEAR && <Last30Days allLogs={allLogs} />}

        {habits.map((habit) => (
          <YearCalendar
            key={habit.key}
            habit={habit}
            logs={perHabitLogs[habit.key] ?? {}}
            year={year}
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
