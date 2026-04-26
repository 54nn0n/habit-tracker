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
  { name: '--black / bg', value: '#0a0a0f' },
  { name: '--panel / surface', value: '#1a1a2e' },
  { name: '--border', value: '#3d3d6b' },
  { name: '--text-bright', value: '#f0f0ff' },
  { name: '--text-dim / muted', value: '#9999bb' },
  { name: '--cyan / accent', value: '#00f5ff' },
  { name: '--magenta', value: '#ff44cc' },
  { name: '--yellow', value: '#ffdd00' },
  { name: '--green', value: '#39ff14' },
  { name: '--red', value: '#ff4466' },
  { name: '--orange', value: '#ff8833' },
  { name: '--purple', value: '#cc66ff' },
];

const SEVERITY_LABELS: Record<Severity, string> = {
  0: 'None',
  1: 'Light',
  2: 'Moderate',
  3: 'Heavy',
};

const DOT_ALPHAS: Record<Severity, number> = { 0: 0, 1: 0.35, 2: 0.65, 3: 1 };
const SEVERITIES: Severity[] = [0, 1, 2, 3];

const MOCK_LOGS: Record<string, Severity> = {
  '2026-01-08': 2, '2026-01-19': 1, '2026-01-30': 3,
  '2026-02-11': 2, '2026-02-22': 1, '2026-03-04': 3,
  '2026-03-17': 2, '2026-03-28': 1, '2026-04-05': 2,
  '2026-04-14': 3, '2026-04-20': 1, '2026-04-24': 2,
};

const MOCK_DETAIL_LOGS: Record<string, Severity> = {
  red_meat: 2, poultry: 0, fish: 1, alcohol: 3,
};

const sectionLabel: React.CSSProperties = {
  fontFamily: 'var(--font-syne)',
  fontSize: 8,
  color: 'var(--color-accent)',
  letterSpacing: 2,
  textTransform: 'uppercase' as const,
  marginBottom: 12,
};

const panel: React.CSSProperties = {
  backgroundColor: 'var(--color-surface)',
  border: '2px solid var(--color-border)',
  boxShadow: 'var(--px-shadow) var(--color-border)',
  padding: '16px',
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
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 9, color: 'var(--color-muted)', letterSpacing: 3, textTransform: 'uppercase' }}>
          {monthYear}
        </p>
        <h1 className="mt-2 leading-tight" style={{ fontFamily: 'var(--font-syne)', fontSize: 22, color: 'var(--color-accent)' }}>
          PIXEL//OS
        </h1>
        <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 9, color: 'var(--color-muted)', marginTop: 4 }}>
          8-BIT DESIGN SYSTEM — v1.2
        </p>
      </header>

      <section className="mb-10">
        <p style={sectionLabel}>// Colors</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 16px' }}>
          {COLOR_TOKENS.map(({ name, value }) => (
            <div key={name} className="flex items-center gap-2.5">
              <div style={{ width: 32, height: 32, backgroundColor: value, border: '2px solid var(--color-border)', flexShrink: 0 }} />
              <div>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 9, color: 'var(--color-foreground)' }}>{name}</p>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 9, color: 'var(--color-muted)' }}>{value}</p>
              </div>
            </div>
          ))}
          {HABITS.map((h) => (
            <div key={h.key} className="flex items-center gap-2.5">
              <div style={{ width: 32, height: 32, backgroundColor: h.color, border: `2px solid ${h.color}`, flexShrink: 0 }} />
              <div>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 9, color: 'var(--color-foreground)' }}>{h.emoji} {h.label}</p>
                <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 9, color: 'var(--color-muted)' }}>{h.color}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <p style={sectionLabel}>// Typography</p>
        <div style={{ ...panel, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 9, color: 'var(--color-muted)', marginBottom: 10 }}>
              Press Start 2P — display / headings
            </p>
            <div style={{ fontFamily: 'var(--font-syne)', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <p style={{ fontSize: 24, color: 'var(--color-accent)' }}>DISPLAY 24</p>
              <p style={{ fontSize: 16, color: 'var(--color-yellow)' }}>HEADING 16</p>
              <p style={{ fontSize: 11, color: 'var(--color-magenta)' }}>LABEL 11</p>
              <p style={{ fontSize: 8, color: 'var(--color-green)' }}>CAPTION 8</p>
            </div>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 9, color: 'var(--color-muted)', marginBottom: 10 }}>
              Silkscreen — data / body / UI
            </p>
            <div style={{ fontFamily: 'var(--font-dm-sans)', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <p style={{ fontSize: 13, color: 'var(--color-foreground)' }}>Body 13 — Insert coin</p>
              <p style={{ fontSize: 11, color: 'var(--color-foreground)' }}>Small 11 — Player one</p>
              <p style={{ fontSize: 9, color: 'var(--color-muted)' }}>Caption 9 — © 1985</p>
            </div>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 9, color: 'var(--color-muted)', marginBottom: 10 }}>
              VT323 — terminal / prose
            </p>
            <p style={{ fontFamily: 'var(--font-vt323)', fontSize: 20, color: 'var(--color-green)', lineHeight: 1.4 }}>
              10 PRINT &quot;HELLO WORLD&quot;<br />
              20 GOTO 10
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <p style={sectionLabel}>// Habit Headers</p>
        <div style={{ ...panel, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {HABITS.map((h) => (
            <HabitHeader key={h.key} habit={h} subtitle={year} />
          ))}
        </div>
      </section>

      <section className="mb-10">
        <p style={sectionLabel}>// Severity Scale</p>
        <div style={{ ...panel, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 9, color: 'var(--color-muted)', marginBottom: 10 }}>
              Pixel square — habit card input
            </p>
            <div className="flex justify-between">
              {SEVERITIES.map((s) => (
                <div key={s} className="flex flex-col items-center gap-1.5">
                  <div style={{
                    width: 36, height: 36,
                    backgroundColor: s === 0 ? 'transparent' : hexToRgba(HABITS[0].color, DOT_ALPHAS[s]),
                    border: s === 0 ? `2px solid ${hexToRgba(HABITS[0].color, 0.35)}` : `2px solid ${HABITS[0].color}`,
                    boxShadow: s === 3 ? `0 0 6px ${hexToRgba(HABITS[0].color, 0.7)}` : undefined,
                  }} />
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 8, color: 'var(--color-muted)' }}>
                    {SEVERITY_LABELS[s]}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 9, color: 'var(--color-muted)', marginBottom: 10 }}>
              Heat cell — year / history grid
            </p>
            <div className="flex justify-between">
              {SEVERITIES.map((s) => (
                <div key={s} className="flex flex-col items-center gap-1.5">
                  <div style={{
                    width: 36, height: 36,
                    backgroundColor: hexToRgba(HABITS[0].color, s === 0 ? 0.12 : DOT_ALPHAS[s]),
                  }} />
                  <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 8, color: 'var(--color-muted)' }}>
                    {SEVERITY_LABELS[s]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <p style={sectionLabel}>// Habit Cards</p>
        <div className="flex flex-col gap-3">
          {HABITS.map((h) => (
            <HabitCard key={h.key} habit={h} days={mockDays} onSeverityChange={handleNoOp} />
          ))}
        </div>
      </section>

      <section className="mb-10">
        <p style={sectionLabel}>// History Grid</p>
        <div className="grid grid-cols-2 gap-3">
          <Suspense>
            {HABITS.map((h) => (
              <HistoryGrid key={h.key} habit={h} logs={MOCK_LOGS} onDaySelect={handleNoOp} />
            ))}
          </Suspense>
        </div>
      </section>

      <section className="mb-10">
        <p style={sectionLabel}>// Day Detail</p>
        <button
          type="button"
          onClick={() => setDetailDate(todayStr)}
          style={{ ...panel, width: '100%', textAlign: 'left', cursor: 'pointer' }}
        >
          <p style={{ fontFamily: 'var(--font-syne)', fontSize: 9, color: 'var(--color-accent)' }}>
            OPEN DAY DETAIL
          </p>
          <p style={{ fontFamily: 'var(--font-dm-sans)', fontSize: 10, color: 'var(--color-muted)', marginTop: 4 }}>
            Bottom sheet — logged habits for a date
          </p>
        </button>
      </section>

      {detailDate && (
        <DayDetail dateStr={detailDate} logs={MOCK_DETAIL_LOGS} onClose={handleClose} />
      )}
    </div>
  );
}
