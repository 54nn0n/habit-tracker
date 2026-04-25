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
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          backgroundColor: hexToRgba(habit.color, 0.15),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 16 }} role="img" aria-label={habit.label}>
          {habit.emoji}
        </span>
      </div>
      <div>
        <p
          className="font-bold leading-tight"
          style={{ fontFamily: 'var(--font-syne)', color: habit.color, fontSize: 13 }}
        >
          {habit.label}
        </p>
        <p className="text-muted leading-tight" style={{ fontSize: 11 }}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}
