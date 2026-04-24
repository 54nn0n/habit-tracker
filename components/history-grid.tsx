'use client';

import { useMemo, useCallback } from 'react';
import type { Habit, Severity } from '@/lib/habits';
import { buildYearGrid, getMonthLabel, severityColor } from '@/lib/date-utils';

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const CELL_SIZE = 11;
const CELL_GAP = 2;

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

function Cell({ date, severity, color, onSelect }: CellProps) {
  const handleClick = useCallback(() => {
    if (date) onSelect(date);
  }, [date, onSelect]);

  return (
    <div
      role={date ? 'button' : undefined}
      tabIndex={date ? 0 : undefined}
      onClick={date ? handleClick : undefined}
      onKeyDown={date ? (e) => e.key === 'Enter' && handleClick() : undefined}
      aria-label={date ? `${date}, severity ${severity}` : undefined}
      style={{
        width: CELL_SIZE,
        height: CELL_SIZE,
        backgroundColor: date ? severityColor(severity, color) : 'transparent',
        borderRadius: 2,
        cursor: date ? 'pointer' : 'default',
        flexShrink: 0,
      }}
    />
  );
}

export default function HistoryGrid({ habit, logs, onDaySelect }: HistoryGridProps) {
  const weeks = useMemo(() => buildYearGrid(), []);

  const handleSelect = useCallback(
    (date: string) => onDaySelect(date),
    [onDaySelect],
  );

  return (
    <div className="bg-surface rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl" role="img" aria-label={habit.label}>
          {habit.emoji}
        </span>
        <span
          className="font-bold text-base text-foreground"
          style={{ fontFamily: 'var(--font-syne)' }}
        >
          {habit.label}
        </span>
      </div>

      <div className="overflow-x-auto">
        <div style={{ display: 'flex', gap: CELL_GAP }}>
          {/* Day-of-week labels column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: CELL_GAP, paddingTop: 16 }}>
            {DAY_LABELS.map((label, i) => (
              <div
                key={i}
                style={{ width: CELL_SIZE, height: CELL_SIZE, fontSize: 8 }}
                className="text-muted flex items-center justify-center"
              >
                {i % 2 === 0 ? label : ''}
              </div>
            ))}
          </div>

          {/* Week columns */}
          {weeks.map((week, wi) => {
            const monthLabel = getMonthLabel(week);
            return (
              <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: CELL_GAP }}>
                <div
                  style={{ height: 14, fontSize: 9, whiteSpace: 'nowrap' }}
                  className="text-muted flex items-center"
                >
                  {monthLabel ?? ''}
                </div>
                {week.map((date, di) => (
                  <Cell
                    key={di}
                    date={date}
                    severity={date ? (logs[date] ?? 0) : 0}
                    color={habit.color}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
