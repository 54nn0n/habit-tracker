'use client';

import { useState, useMemo, useCallback } from 'react';
import { HABITS } from '@/lib/habits';
import type { HabitKey, Severity } from '@/lib/habits';
import { useLogs } from '@/lib/use-logs';
import HistoryGrid from '@/components/history-grid';
import DayDetail from '@/components/day-detail';

const LABEL_HEADING = 'History';

type PerHabitLogs = Record<HabitKey, Record<string, Severity>>;

function derivePerHabitLogs(
  allLogs: Record<string, Partial<Record<HabitKey, Severity>>>,
): PerHabitLogs {
  const result: PerHabitLogs = {
    red_meat: {},
    poultry: {},
    fish: {},
    alcohol: {},
  };
  for (const [date, dayLogs] of Object.entries(allLogs)) {
    for (const habit of HABITS) {
      const s = dayLogs[habit.key];
      if (s !== undefined && s > 0) {
        result[habit.key][date] = s;
      }
    }
  }
  return result;
}

export default function HistoryPage() {
  const allLogs = useLogs();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const perHabitLogs = useMemo(() => derivePerHabitLogs(allLogs), [allLogs]);

  const selectedDayLogs = useMemo((): Record<string, Severity> => {
    if (!selectedDate) return {};
    const day = allLogs[selectedDate] ?? {};
    return Object.fromEntries(
      HABITS.map((h) => [h.key, (day[h.key] ?? 0) as Severity]),
    );
  }, [selectedDate, allLogs]);

  const handleDaySelect = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const handleClose = useCallback(() => {
    setSelectedDate(null);
  }, []);

  return (
    <div className="px-4 pt-10 pb-4 max-w-lg mx-auto w-full">
      <header className="mb-6">
        <h1
          className="text-3xl font-bold text-foreground"
          style={{ fontFamily: 'var(--font-syne)' }}
        >
          {LABEL_HEADING}
        </h1>
      </header>

      <div className="flex flex-col gap-4">
        {HABITS.map((habit) => (
          <HistoryGrid
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
