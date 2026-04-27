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
      className="bg-surface"
      style={{
        border: `2px solid ${habit.color}`,
        boxShadow: `var(--px-shadow) ${hexToRgba(habit.color, 0.5)}`,
      }}
    >
      <div className="px-5 pt-4 pb-1 flex items-center gap-2">
        <span className="text-xl leading-none" role="img" aria-label={habit.label}>
          {habit.emoji}
        </span>
        <span className="font-display text-xs font-bold" style={{ color: habit.color }}>
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
