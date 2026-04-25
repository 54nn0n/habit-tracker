import { HABITS } from './habits';
import type { Severity } from './habits';
import type { AllLogs } from './storage';

const HEADER = `# Habit Log

| Date | Red Meat | Poultry | Fish | Alcohol |
|------|----------|---------|------|---------|`;

export function encodeLogs(logs: AllLogs): string {
  const rows = Object.entries(logs)
    .filter(([, day]) => HABITS.some((h) => (day[h.key] ?? 0) > 0))
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([date, day]) =>
      `| ${date} | ${HABITS.map((h) => day[h.key] ?? 0).join(' | ')} |`,
    );

  return rows.length > 0 ? `${HEADER}\n${rows.join('\n')}` : HEADER;
}

const ROW_RE =
  /^\|\s*(\d{4}-\d{2}-\d{2})\s*\|\s*(\d)\s*\|\s*(\d)\s*\|\s*(\d)\s*\|\s*(\d)\s*\|/;

function toSeverity(n: number): Severity {
  return (n >= 0 && n <= 3 ? n : 0) as Severity;
}

export function decodeLogs(md: string): AllLogs {
  const logs: AllLogs = {};
  for (const line of md.split('\n')) {
    const m = line.match(ROW_RE);
    if (!m) continue;
    const [, date, ...values] = m;
    const day: Partial<Record<string, Severity>> = {};
    HABITS.forEach((h, i) => {
      const s = toSeverity(Number(values[i]));
      if (s > 0) day[h.key] = s;
    });
    if (Object.keys(day).length > 0) logs[date] = day;
  }
  return logs;
}
