import type { Habit } from "@/lib/habits";

interface HabitHeaderProps {
  habit: Habit;
  subtitle: string;
}

export default function HabitHeader({ habit, subtitle }: HabitHeaderProps) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-2xl leading-none" role="img" aria-label={habit.label}>
        {habit.emoji}
      </span>
      <div>
        <p
          className="font-display leading-tight text-xs"
          style={{ color: habit.color }}
        >
          {habit.label}
        </p>
        <p className="font-body text-xs text-muted">{subtitle}</p>
      </div>
    </div>
  );
}
