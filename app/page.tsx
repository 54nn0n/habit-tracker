'use client';

import { useCallback, useMemo } from 'react';
import { HABITS } from '@/lib/habits';
import type { Habit, HabitKey, Severity } from '@/lib/habits';
import { setLog } from '@/lib/storage';
import { useLogs } from '@/lib/use-logs';
import HabitCard from '@/components/habit-card';

const LABEL_TODAY = 'Today';

function toLocalDateString(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

interface HabitRowProps {
  habit: Habit;
  severity: Severity;
  onUpdate: (key: HabitKey, severity: Severity) => void;
}

function HabitRow({ habit, severity, onUpdate }: HabitRowProps) {
  const handleChange = useCallback(
    (s: Severity) => onUpdate(habit.key, s),
    [habit.key, onUpdate],
  );
  return <HabitCard habit={habit} severity={severity} onSeverityChange={handleChange} />;
}

export default function TodayPage() {
  const today = useMemo(() => toLocalDateString(new Date()), []);
  const displayDate = useMemo(() => formatDisplayDate(new Date()), []);
  const allLogs = useLogs();

  const severities = useMemo(() => {
    const dayLogs = allLogs[today] ?? {};
    return {
      red_meat: (dayLogs.red_meat ?? 0) as Severity,
      poultry: (dayLogs.poultry ?? 0) as Severity,
      fish: (dayLogs.fish ?? 0) as Severity,
      alcohol: (dayLogs.alcohol ?? 0) as Severity,
    };
  }, [allLogs, today]);

  const handleUpdate = useCallback(
    (key: HabitKey, s: Severity) => setLog(today, key, s),
    [today],
  );

  return (
    <div className="px-4 pt-10 pb-4 max-w-lg mx-auto w-full">
      <header className="mb-8">
        <p className="text-muted text-sm font-body uppercase tracking-widest">
          {LABEL_TODAY}
        </p>
        <h1
          className="text-3xl font-bold text-foreground mt-1"
          style={{ fontFamily: 'var(--font-syne)' }}
        >
          {displayDate}
        </h1>
      </header>

      <div className="flex flex-col gap-3">
        {HABITS.map((habit) => (
          <HabitRow
            key={habit.key}
            habit={habit}
            severity={severities[habit.key]}
            onUpdate={handleUpdate}
          />
        ))}
      </div>
    </div>
  );
}
