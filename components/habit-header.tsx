import type { Habit } from '@/lib/habits';
import { hexToRgba } from '@/lib/date-utils';

interface HabitHeaderProps {
  habit: Habit;
  subtitle: string;
}

export default function HabitHeader({ habit, subtitle }: HabitHeaderProps) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="flex items-center justify-center shrink-0 w-[34px] h-[34px]"
        style={{
          backgroundColor: hexToRgba(habit.color, 0.12),
          border: `2px solid ${habit.color}`,
        }}
      >
        <span className="text-base" role="img" aria-label={habit.label}>
          {habit.emoji}
        </span>
      </div>
      <div>
        <p className="font-display leading-tight text-[9px]" style={{ color: habit.color }}>
          {habit.label}
        </p>
        <p className="font-body text-[10px] text-muted">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
