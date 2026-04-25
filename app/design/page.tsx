'use client';

import { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { HABITS } from '@/lib/habits';
import type { Severity } from '@/lib/habits';
import { hexToRgba, toLocalDateString, formatMonthYear } from '@/lib/date-utils';
import type { HabitDayEntry } from '@/lib/date-utils';
import HabitCard from '@/components/habit-card';
import DayDetail from '@/components/day-detail';
import HabitHeader from '@/components/habit-header';

const HistoryGrid = lazy(() => import('@/components/history-grid'));

const COLOR_TOKENS = [
  { name: 'background', value: '#FFFBF5' },
  { name: 'surface', value: '#ffffff' },
  { name: 'foreground', value: '#1A1A1A' },
  { name: 'muted', value: '#6B6B6B' },
];

const SEVERITY_LABELS: Record<Severity, string> = {
  0: 'None',
  1: 'Light',
  2: 'Moderate',
  3: 'Heavy',
};

const DOT_ALPHAS: Record<Severity, number> = { 0: 0, 1: 0.38, 2: 0.68, 3: 1 };
const SEVERITIES: Severity[] = [0, 1, 2, 3];

const MOCK_LOGS: Record<string, Severity> = {
  '2026-01-08': 2,
  '2026-01-19': 1,
  '2026-01-30': 3,
  '2026-02-11': 2,
  '2026-02-22': 1,
  '2026-03-04': 3,
  '2026-03-17': 2,
  '2026-03-28': 1,
  '2026-04-05': 2,
  '2026-04-14': 3,
  '2026-04-20': 1,
  '2026-04-24': 2,
};

const MOCK_DETAIL_LOGS: Record<string, Severity> = {
  red_meat: 2,
  poultry: 0,
  fish: 1,
  alcohol: 3,
};

export default function DesignPage() {
  const [detailDate, setDetailDate] = useState<string | null>(null);
  const todayStr = useMemo(() => toLocalDateString(new Date()), []);
  const monthYear = useMemo(() => formatMonthYear(new Date()), []);
  const year = useMemo(() => String(new Date().getFullYear()), []);

  const mockDays = useMemo((): HabitDayEntry[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const severities: Severity[] = [1, 3, 0, 2, 0];
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (4 - i));
      const dateStr = toLocalDateString(d);
      return {
        dateStr,
        dayLabel: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: d.getDate(),
        isToday: dateStr === todayStr,
        severity: severities[i],
      };
    });
  }, [todayStr]);

  const handleNoOp = useCallback(() => {}, []);
  const handleClose = useCallback(() => setDetailDate(null), []);

  return (
    <div className="px-4 pt-10 pb-20 max-w-lg mx-auto w-full">
      <header className="mb-10">
        <p className="text-muted text-xs uppercase tracking-widest">{monthYear}</p>
        <h1 className="text-3xl font-bold text-foreground mt-0.5" style={{ fontFamily: 'var(--font-syne)' }}>
          Design System
        </h1>
      </header>

      <section className="mb-12">
        <p className="font-bold uppercase tracking-widest text-muted mb-3" style={{ fontSize: 10 }}>Colors</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          {COLOR_TOKENS.map(({ name, value }) => (
            <div key={name} className="flex items-center gap-2.5">
              <div className="rounded-xl shrink-0" style={{ width: 36, height: 36, backgroundColor: value, boxShadow: '0 0 0 1px rgba(0,0,0,0.08)' }} />
              <div>
                <p className="text-xs font-medium text-foreground leading-tight">{name}</p>
                <p className="text-muted leading-tight" style={{ fontSize: 10, fontFamily: 'monospace' }}>{value}</p>
              </div>
            </div>
          ))}
          {HABITS.map((h) => (
            <div key={h.key} className="flex items-center gap-2.5">
              <div className="rounded-xl shrink-0" style={{ width: 36, height: 36, backgroundColor: h.color }} />
              <div>
                <p className="text-xs font-medium text-foreground leading-tight">{h.emoji} {h.label}</p>
                <p className="text-muted leading-tight" style={{ fontSize: 10, fontFamily: 'monospace' }}>{h.color}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <p className="font-bold uppercase tracking-widest text-muted mb-3" style={{ fontSize: 10 }}>Typography</p>
        <div className="bg-surface rounded-2xl p-4 shadow-sm flex flex-col gap-5">
          <div>
            <p className="text-muted mb-2" style={{ fontSize: 10, fontFamily: 'monospace' }}>Syne — display</p>
            <div className="flex flex-col gap-0.5" style={{ fontFamily: 'var(--font-syne)' }}>
              <p className="text-3xl font-bold text-foreground leading-tight">Display 30</p>
              <p className="text-xl font-bold text-foreground">Heading 20</p>
              <p className="text-sm font-bold text-foreground">Label 14</p>
              <p className="text-xs font-bold text-foreground">Caption 12</p>
            </div>
          </div>
          <div>
            <p className="text-muted mb-2" style={{ fontSize: 10, fontFamily: 'monospace' }}>DM Sans — body</p>
            <div className="flex flex-col gap-0.5">
              <p className="text-base text-foreground">Body 16</p>
              <p className="text-sm text-foreground">Small 14</p>
              <p className="text-xs text-muted">Caption 12</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <p className="font-bold uppercase tracking-widest text-muted mb-3" style={{ fontSize: 10 }}>Habit Header</p>
        <div className="bg-surface rounded-2xl p-4 shadow-sm flex flex-col gap-3">
          {HABITS.map((h) => (
            <HabitHeader key={h.key} habit={h} subtitle={year} />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <p className="font-bold uppercase tracking-widest text-muted mb-3" style={{ fontSize: 10 }}>Severity Scale</p>
        <div className="bg-surface rounded-2xl p-4 shadow-sm flex flex-col gap-4">
          <div>
            <p className="text-muted mb-2" style={{ fontSize: 10, fontFamily: 'monospace' }}>Dot — habit card</p>
            <div className="flex justify-between">
              {SEVERITIES.map((s) => (
                <div key={s} className="flex flex-col items-center gap-1.5">
                  <div className="rounded-full" style={{ width: 36, height: 36, backgroundColor: s === 0 ? 'transparent' : hexToRgba(HABITS[0].color, DOT_ALPHAS[s]), border: s === 0 ? `2px solid ${hexToRgba(HABITS[0].color, 0.3)}` : undefined }} />
                  <p className="text-xs text-muted">{SEVERITY_LABELS[s]}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-muted mb-2" style={{ fontSize: 10, fontFamily: 'monospace' }}>Square — year / history</p>
            <div className="flex justify-between">
              {SEVERITIES.map((s) => (
                <div key={s} className="flex flex-col items-center gap-1.5">
                  <div className="rounded-lg" style={{ width: 36, height: 36, backgroundColor: hexToRgba(HABITS[0].color, s === 0 ? 0.12 : DOT_ALPHAS[s]) }} />
                  <p className="text-xs text-muted">{SEVERITY_LABELS[s]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <p className="font-bold uppercase tracking-widest text-muted mb-3" style={{ fontSize: 10 }}>Habit Card</p>
        <div className="flex flex-col gap-3">
          {HABITS.map((h) => (
            <HabitCard key={h.key} habit={h} days={mockDays} onSeverityChange={handleNoOp} />
          ))}
        </div>
      </section>

      <section className="mb-12">
        <p className="font-bold uppercase tracking-widest text-muted mb-3" style={{ fontSize: 10 }}>History Grid</p>
        <div className="grid grid-cols-2 gap-3">
          <Suspense>
            {HABITS.map((h) => (
              <HistoryGrid key={h.key} habit={h} logs={MOCK_LOGS} onDaySelect={handleNoOp} />
            ))}
          </Suspense>
        </div>
      </section>

      <section className="mb-12">
        <p className="font-bold uppercase tracking-widest text-muted mb-3" style={{ fontSize: 10 }}>Day Detail</p>
        <button type="button" onClick={() => setDetailDate(todayStr)} className="bg-surface rounded-2xl p-4 shadow-sm w-full text-left">
          <p className="text-sm font-medium text-foreground">Open Day Detail</p>
          <p className="text-xs text-muted mt-0.5">Bottom sheet showing logged habits for a date</p>
        </button>
      </section>

      {detailDate && (
        <DayDetail dateStr={detailDate} logs={MOCK_DETAIL_LOGS} onClose={handleClose} />
      )}
    </div>
  );
}
