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
          backgroundColor: hexToRgba(habit.color, 0.12),
          border: `2px solid ${habit.color}`,
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
          className="leading-tight"
          style={{ fontFamily: 'var(--font-syne)', color: habit.color, fontSize: 9 }}
        >
          {habit.label}
        </p>
        <p style={{ fontFamily: 'var(--font-dm-sans)', color: 'var(--color-muted)', fontSize: 10 }}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}
