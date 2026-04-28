import { getHabits } from "./habits";
import type { Severity } from "./habits";
import type { AllLogs } from "./storage";

function makeHeader(habits: ReturnType<typeof getHabits>): string {
  const cols = habits.map((h) => h.label).join(" | ");
  const sep = habits.map(() => "------").join("|");
  return `# Habit Log\n\n| Date | ${cols} |\n|------|${sep}|`;
}

function toSeverity(n: number): Severity {
  return (n >= 0 && n <= 2 ? n : 0) as Severity;
}

export function encodeLogs(logs: AllLogs): string {
  const habits = getHabits();
  const header = makeHeader(habits);
  const rows = Object.entries(logs)
    .filter(([, day]) => habits.some((h) => (day[h.key] ?? 0) > 0))
    .sort(([a], [b]) => b.localeCompare(a))
    .map(
      ([date, day]) =>
        `| ${date} | ${habits.map((h) => day[h.key] ?? 0).join(" | ")} |`,
    );
  return rows.length > 0 ? `${header}\n${rows.join("\n")}` : header;
}

export function decodeLogs(md: string): AllLogs {
  const habits = getHabits();
  const headerMatch = md.match(/\|\s*Date\s*\|(.*)\|/);
  if (!headerMatch) return {};
  const cols = headerMatch[1]
    .split("|")
    .map((s) => s.trim().toLowerCase().replace(/\s+/g, "_"));

  const rowRe = /^\|\s*(\d{4}-\d{2}-\d{2})\s*\|(.*)\|/;
  const logs: AllLogs = {};

  for (const line of md.split("\n")) {
    const m = line.match(rowRe);
    if (!m) continue;
    const [, date, rest] = m;
    const values = rest.split("|").map((s) => s.trim());
    const day: Record<string, Severity> = {};
    cols.forEach((col, i) => {
      const habit = habits.find(
        (h) =>
          h.key === col ||
          h.label.toLowerCase().replace(/\s+/g, "_") === col,
      );
      if (!habit) return;
      const s = toSeverity(Number(values[i]));
      if (s > 0) day[habit.key] = s;
    });
    if (Object.keys(day).length > 0) logs[date] = day;
  }
  return logs;
}
