import type { Severity } from './habits';

export function toLocalDateString(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function parseDateLocal(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDayDetail(dateStr: string): string {
  return parseDateLocal(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function buildYearGrid(): Array<Array<string | null>> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start from the Sunday of the week that was 52 weeks ago
  const gridStart = new Date(today);
  gridStart.setDate(today.getDate() - today.getDay() - 52 * 7);

  const weeks: Array<Array<string | null>> = [];
  const cursor = new Date(gridStart);

  for (let w = 0; w < 53; w++) {
    const week: Array<string | null> = [];
    for (let d = 0; d < 7; d++) {
      week.push(cursor <= today ? toLocalDateString(new Date(cursor)) : null);
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  return weeks;
}

export function getMonthLabel(week: Array<string | null>): string | null {
  for (const date of week) {
    if (!date) continue;
    if (parseDateLocal(date).getDate() === 1) {
      return parseDateLocal(date).toLocaleDateString('en-US', { month: 'short' });
    }
  }
  return null;
}

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const SEVERITY_ALPHAS: Record<Severity, number> = { 0: 0, 1: 0.35, 2: 0.65, 3: 1 };

export function severityColor(severity: Severity, habitColor: string): string {
  if (severity === 0) return '#EBEDF0';
  return hexToRgba(habitColor, SEVERITY_ALPHAS[severity]);
}
