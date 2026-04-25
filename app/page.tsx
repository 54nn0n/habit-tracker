'use client';

import { useCallback, useMemo } from 'react';
import { HABITS } from '@/lib/habits';
import type { Habit, HabitKey, Severity } from '@/lib/habits';
import { setLog } from '@/lib/storage';
import { useLogs } from '@/lib/use-logs';
import { toLocalDateString, getLastNDays, formatMonthYear } from '@/lib/date-utils';
import type { HabitDayEntry } from '@/lib/date-utils';
import HabitCard from '@/components/habit-card';

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
  return <HabitCard habit={habit} days={days} onSeverityChange={handleChange} />;
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
      <header className="mb-6">
        <p className="text-muted text-xs uppercase tracking-widest">{monthYear}</p>
        <h1
          className="text-4xl font-bold text-foreground mt-0.5"
          style={{ fontFamily: 'var(--font-syne)' }}
        >
          {todayStr.slice(8)}
          <span className="text-muted font-normal text-2xl ml-2">
            {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
          </span>
        </h1>
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
