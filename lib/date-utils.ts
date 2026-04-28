import type { Severity } from "./habits";

export function toLocalDateString(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function parseDateLocal(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatDayDetail(dateStr: string): string {
  return parseDateLocal(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDisplayDate(dateStr: string): string {
  return parseDateLocal(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export interface DayEntry {
  dateStr: string;
  dayLabel: string;
  dayNumber: number;
  isToday: boolean;
}

export interface HabitDayEntry extends DayEntry {
  severity: Severity;
}

export function getLastNDays(n: number): DayEntry[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = toLocalDateString(today);

  return Array.from({ length: n }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (n - 1 - i));
    return {
      dateStr: toLocalDateString(d),
      dayLabel: d.toLocaleDateString("en-US", { weekday: "short" }),
      dayNumber: d.getDate(),
      isToday: toLocalDateString(d) === todayStr,
    };
  });
}

export function buildYearGrid(): Array<Array<string | null>> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start from the Sunday of the week 52 weeks ago
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
      return parseDateLocal(date).toLocaleDateString("en-US", {
        month: "short",
      });
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

const SEVERITY_ALPHAS: Record<Severity, number> = { 0: 0, 1: 0.5, 2: 1 };

export function severityColor(severity: Severity, habitColor: string): string {
  if (severity === 0) return "transparent";
  return hexToRgba(habitColor, SEVERITY_ALPHAS[severity]);
}

export interface MonthGrid {
  year: number;
  month: number;
  weeks: Array<Array<number | null>>;
}

export interface YearStats {
  loggedDays: number;
  totalDays: number;
  percentage: number;
  longestStreak: number;
}

export function buildMonthGrid(year: number, month: number): MonthGrid {
  const firstDow = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const numWeeks = Math.ceil((firstDow + daysInMonth) / 7);
  const weeks: Array<Array<number | null>> = [];
  let day = 1;
  for (let w = 0; w < numWeeks; w++) {
    const week: Array<number | null> = [];
    for (let d = 0; d < 7; d++) {
      const ci = w * 7 + d;
      week.push(ci < firstDow || day > daysInMonth ? null : day++);
    }
    weeks.push(week);
  }
  return { year, month, weeks };
}

export function buildCalendarYear(year: number): MonthGrid[] {
  return Array.from({ length: 12 }, (_, i) => buildMonthGrid(year, i + 1));
}

export function computeYearStats(
  logs: Record<string, Severity>,
  year: number,
): YearStats {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yearStart = new Date(year, 0, 1);
  const yearEnd = new Date(year, 11, 31);
  const endDate = today < yearEnd ? today : yearEnd;

  if (yearStart > endDate) {
    return { loggedDays: 0, totalDays: 0, percentage: 0, longestStreak: 0 };
  }

  let totalDays = 0;
  let loggedDays = 0;
  let longestStreak = 0;
  let streak = 0;
  const cursor = new Date(yearStart);

  while (cursor <= endDate) {
    const dateStr = toLocalDateString(cursor);
    totalDays++;
    if ((logs[dateStr] ?? 0) > 0) {
      longestStreak = Math.max(longestStreak, ++streak);
      loggedDays++;
    } else {
      streak = 0;
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return {
    loggedDays,
    totalDays,
    percentage: totalDays > 0 ? Math.round((loggedDays / totalDays) * 100) : 0,
    longestStreak,
  };
}
