import { getHabits } from "./habits";
import type { Severity } from "./habits";
import type { AllLogs, DayLogs } from "./storage";

function makeHeader(habits: ReturnType<typeof getHabits>): string {
  const cols = habits.map((h) => h.label).join(" | ");
  const sep = habits.map(() => "------").join("|");
  return `# Habit Log\n\n| Date | ${cols} |\n|------|${sep}|`;
}

function toSeverity(n: number): Severity | undefined {
  return (n === 0 || n === 1 || n === 2 ? n : undefined) as
    | Severity
    | undefined;
}

export function encodeLogs(logs: AllLogs): string {
  const habits = getHabits();
  const header = makeHeader(habits);
  const rows = Object.entries(logs)
    .filter((entry): entry is [string, DayLogs] => {
      const day = entry[1];
      return (
        day !== undefined && habits.some((h) => day[h.key] !== undefined)
      );
    })
    .sort(([a], [b]) => b.localeCompare(a))
    .map(
      ([date, day]) =>
        `| ${date} | ${habits
          .map((h) => {
            const v = day[h.key];
            return v !== undefined ? v : "";
          })
          .join(" | ")} |`,
    );
  return rows.length > 0 ? `${header}\n${rows.join("\n")}` : header;
}

export function decodeLogs(md: string): AllLogs {
  const headerMatch = md.match(/\|\s*Date\s*\|(.*)\|/);
  if (!headerMatch) return {};

  // Normalize column headers to keys the same way toKey() does at habit creation
  const SAFE_KEY = /^[a-z0-9_]+$/;
  const cols = headerMatch[1].split("|").map((s) => {
    const key = s
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");
    return SAFE_KEY.test(key) ? key : "";
  });

  const rowRe = /^\|\s*(\d{4}-\d{2}-\d{2})\s*\|(.*)\|/;
  const logs: AllLogs = {};

  for (const line of md.split("\n")) {
    const m = line.match(rowRe);
    if (!m) continue;
    const [, date, rest] = m;
    const values = rest.split("|").map((s) => s.trim());
    const day: DayLogs = {};
    cols.forEach((col, i) => {
      if (!col) return;
      const raw = values[i] ?? "";
      if (raw === "") return;
      const s = toSeverity(Number(raw));
      if (s === undefined) return;
      day[col] = s;
    });
    if (Object.keys(day).length > 0) logs[date] = day;
  }
  return logs;
}
