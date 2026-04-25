'use client';

import { useCallback } from 'react';
import type { Habit, Severity } from '@/lib/habits';
import type { HabitDayEntry } from '@/lib/date-utils';
import { hexToRgba } from '@/lib/date-utils';
import DotInput from './dot-input';

interface HabitCardProps {
  habit: Habit;
  days: HabitDayEntry[];
  onSeverityChange: (dateStr: string, severity: Severity) => void;
}

interface DayColumnProps {
  day: HabitDayEntry;
  color: string;
  onSeverityChange: (dateStr: string, severity: Severity) => void;
}

function DayColumn({ day, color, onSeverityChange }: DayColumnProps) {
  const handleChange = useCallback(
    (s: Severity) => onSeverityChange(day.dateStr, s),
    [day.dateStr, onSeverityChange],
  );
  return (
    <DotInput
      severity={day.severity}
      color={color}
      dayLabel={day.dayLabel}
      dayNumber={day.dayNumber}
      isToday={day.isToday}
      onChange={handleChange}
    />
  );
}

export default function HabitCard({ habit, days, onSeverityChange }: HabitCardProps) {
  return (
    <div
      className="rounded-2xl overflow-hidden shadow-sm"
      style={{ backgroundColor: hexToRgba(habit.color, 0.06) }}
    >
      <div className="px-5 pt-4 pb-1 flex items-center gap-2">
        <span className="text-xl leading-none" role="img" aria-label={habit.label}>
          {habit.emoji}
        </span>
        <span
          className="font-bold text-sm"
          style={{ fontFamily: 'var(--font-syne)', color: habit.color }}
        >
          {habit.label}
        </span>
      </div>

      <div className="flex px-2 pb-3">
        {days.map((day) => (
          <DayColumn
            key={day.dateStr}
            day={day}
            color={habit.color}
            onSeverityChange={onSeverityChange}
          />
        ))}
      </div>
    </div>
  );
}
