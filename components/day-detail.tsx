'use client';

import { useCallback } from 'react';
import { HABITS } from '@/lib/habits';
import type { Severity } from '@/lib/habits';
import { formatDayDetail } from '@/lib/date-utils';

const LABEL_CLOSE = 'Close';
const LABEL_NO_DATA = 'Nothing logged';

const SEVERITY_LABELS: Record<Severity, string> = {
  0: 'None',
  1: 'Light',
  2: 'Moderate',
  3: 'Heavy',
};

interface DayDetailProps {
  dateStr: string;
  logs: Record<string, Severity>;
  onClose: () => void;
}

export default function DayDetail({ dateStr, logs, onClose }: DayDetailProps) {
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  const allZero = HABITS.every((h) => (logs[h.key] ?? 0) === 0);

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end"
      onClick={handleBackdropClick}
    >
      <div className="bg-surface w-full rounded-t-3xl p-6 pb-10 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h2
            className="text-base font-bold text-foreground"
            style={{ fontFamily: 'var(--font-syne)' }}
          >
            {formatDayDetail(dateStr)}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={LABEL_CLOSE}
            className="text-muted text-sm font-medium"
          >
            {LABEL_CLOSE}
          </button>
        </div>

        {allZero ? (
          <p className="text-muted text-sm">{LABEL_NO_DATA}</p>
        ) : (
          <div className="flex flex-col gap-4">
            {HABITS.map((habit) => {
              const severity = (logs[habit.key] ?? 0) as Severity;
              if (severity === 0) return null;
              return (
                <div key={habit.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl" role="img" aria-label={habit.label}>
                      {habit.emoji}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {habit.label}
                    </span>
                  </div>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full text-surface"
                    style={{ backgroundColor: habit.color }}
                  >
                    {SEVERITY_LABELS[severity]}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
