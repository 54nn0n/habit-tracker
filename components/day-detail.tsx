'use client';

import { useCallback } from 'react';
import type { MouseEvent } from 'react';
import { HABITS } from '@/lib/habits';
import type { Severity } from '@/lib/habits';
import { formatDayDetail } from '@/lib/date-utils';

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
    (e: MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  const allZero = HABITS.every((h) => (logs[h.key] ?? 0) === 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={handleBackdropClick}
    >
      <div
        className="w-full p-6 pb-10 max-w-lg mx-auto"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderTop: '2px solid var(--color-accent)',
          boxShadow: '0 -4px 0 var(--color-cyan-dim)',
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 style={{ fontFamily: 'var(--font-syne)', fontSize: 10, color: 'var(--color-accent)' }}>
            {formatDayDetail(dateStr)}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{
              fontFamily: 'var(--font-dm-sans)',
              fontSize: 10,
              color: 'var(--color-muted)',
              border: '1px solid var(--color-border)',
              padding: '4px 10px',
            }}
          >
            CLOSE
          </button>
        </div>

        {allZero ? (
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 11, color: 'var(--color-muted)' }}>
            Nothing logged
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {HABITS.map((habit) => {
              const severity = logs[habit.key] ?? 0;
              if (severity === 0) return null;
              return (
                <div key={habit.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl" role="img" aria-label={habit.label}>
                      {habit.emoji}
                    </span>
                    <span style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 11, color: 'var(--color-foreground)' }}>
                      {habit.label}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-syne)',
                      fontSize: 8,
                      padding: '4px 8px',
                      backgroundColor: habit.color,
                      color: '#0a0a0f',
                      border: `1px solid ${habit.color}`,
                    }}
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
