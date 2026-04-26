'use client';

import { useMemo, useCallback } from 'react';
import type { Habit, Severity } from '@/lib/habits';
import {
  buildCalendarYear,
  computeYearStats,
  toLocalDateString,
  hexToRgba,
  severityColor,
} from '@/lib/date-utils';
import type { MonthGrid } from '@/lib/date-utils';
import HabitHeader from '@/components/habit-header';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
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
  todayStr: string;
  onDaySelect: (dateStr: string) => void;
}

function MonthView({ grid, logs, color, todayStr, onDaySelect }: MonthViewProps) {
  const { year, month, weeks } = grid;
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;
  const isFutureMonth = monthStr > todayStr.slice(0, 7);

  return (
    <div>
      <p
        style={{
          fontFamily: 'var(--font-dm-sans)',
          fontSize: 9,
          fontWeight: 700,
          marginBottom: 6,
          color: isFutureMonth ? 'var(--color-muted)' : 'var(--color-foreground)',
        }}
      >
        {MONTH_NAMES[month - 1]}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {weeks.map((week, wi) =>
          week.map((day, di) => {
            if (!day) {
              return <div key={`${wi}-${di}`} style={{ aspectRatio: '1' }} />;
            }
            const dateStr = `${monthStr}-${String(day).padStart(2, '0')}`;
            const isFuture = dateStr > todayStr;
            const isToday = dateStr === todayStr;
            const severity = logs[dateStr] ?? 0;

            return (
              <button
                key={`${wi}-${di}`}
                type="button"
                onClick={isFuture ? undefined : () => onDaySelect(dateStr)}
                disabled={isFuture}
                aria-label={dateStr}
                style={{
                  aspectRatio: '1',
                  backgroundColor: !isFuture && severity > 0
                    ? severityColor(severity, color)
                    : 'transparent',
                  outline: isToday ? `2px solid var(--color-yellow)` : undefined,
                  outlineOffset: -1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isFuture ? 'default' : 'pointer',
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-dm-sans)',
                    fontSize: 7,
                    lineHeight: 1,
                    fontWeight: isToday ? 700 : 400,
                    color: isFuture
                      ? hexToRgba('#9999bb', 0.4)
                      : severity === 3
                        ? '#0a0a0f'
                        : 'var(--color-foreground)',
                  }}
                >
                  {day}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function YearCalendar({ habit, logs, onDaySelect }: YearCalendarProps) {
  const year = useMemo(() => new Date().getFullYear(), []);
  const todayStr = useMemo(() => toLocalDateString(new Date()), []);
  const months = useMemo(() => buildCalendarYear(year), [year]);
  const stats = useMemo(() => computeYearStats(logs, year), [logs, year]);

  const handleDaySelect = useCallback(
    (dateStr: string) => onDaySelect(dateStr),
    [onDaySelect],
  );

  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '2px solid var(--color-border)',
        boxShadow: 'var(--px-shadow) var(--color-border)',
        padding: '16px',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <HabitHeader habit={habit} subtitle={String(year)} />
        <div className="text-right shrink-0 ml-2">
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 9, color: 'var(--color-foreground)' }}>
            {stats.loggedDays}/{stats.totalDays} · {stats.percentage}%
          </p>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 9, color: 'var(--color-muted)' }}>
            {stats.longestStreak}d streak
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {months.map((grid) => (
          <MonthView
            key={grid.month}
            grid={grid}
            logs={logs}
            color={habit.color}
            todayStr={todayStr}
            onDaySelect={handleDaySelect}
          />
        ))}
      </div>
    </div>
  );
}
