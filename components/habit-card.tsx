'use client';

import { useCallback } from 'react';
import type { Habit, Severity } from '@/lib/habits';
import DotInput from './dot-input';

interface HabitCardProps {
  habit: Habit;
  severity: Severity;
  onSeverityChange: (severity: Severity) => void;
}

export default function HabitCard({ habit, severity, onSeverityChange }: HabitCardProps) {
  const handleChange = useCallback(
    (s: Severity) => onSeverityChange(s),
    [onSeverityChange],
  );

  return (
    <div className="bg-surface rounded-2xl px-5 py-4 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-3xl leading-none" role="img" aria-label={habit.label}>
          {habit.emoji}
        </span>
        <span
          className="font-bold text-lg text-foreground"
          style={{ fontFamily: 'var(--font-syne)' }}
        >
          {habit.label}
        </span>
      </div>
      <DotInput severity={severity} color={habit.color} onChange={handleChange} />
    </div>
  );
}
