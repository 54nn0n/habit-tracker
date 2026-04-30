"use client";

import { useState, useMemo, useCallback, lazy, Suspense } from "react";
import type { Habit, Severity } from "@/lib/habits";
import {
  hexToRgba,
  toLocalDateString,
  formatMonthYear,
} from "@/lib/date-utils";
import type { HabitDayEntry } from "@/lib/date-utils";
import type { AllLogs } from "@/lib/storage";
import HabitCard from "@/components/habit-card";
import DayDetail from "@/components/day-detail";
import BackButton from "@/components/back-button";
import Button from "@/components/button";
import TextInput from "@/components/text-input";
import SegmentedToggle from "@/components/segmented-toggle";
import ConfirmModal from "@/components/confirm-modal";
import Last30Days from "@/components/last-30-days";
import BottomNav from "@/components/bottom-nav";

const YearCalendar = lazy(() => import("@/components/year-calendar"));

const MOCK_HABITS: Habit[] = [
  {
    key: "red_meat",
    label: "Red Meat",
    emoji: "🥩",
    color: "#ff4466",
    direction: "reducing",
    logType: "severity",
    order: 0,
  },
  {
    key: "poultry",
    label: "Poultry",
    emoji: "🍗",
    color: "#ff8833",
    direction: "reducing",
    logType: "severity",
    order: 1,
  },
  {
    key: "fish",
    label: "Fish",
    emoji: "🐟",
    color: "#00f5ff",
    direction: "reducing",
    logType: "severity",
    order: 2,
  },
  {
    key: "alcohol",
    label: "Alcohol",
    emoji: "🍷",
    color: "#cc66ff",
    direction: "reducing",
    logType: "severity",
    order: 3,
  },
];

const COLOR_TOKENS = [
  { name: "--black / bg", value: "#0a0a0f" },
  { name: "--panel / surface", value: "#1a1a2e" },
  { name: "--border", value: "#3d3d6b" },
  { name: "--text-bright", value: "#f0f0ff" },
  { name: "--text-dim / muted", value: "#9999bb" },
  { name: "--cyan / accent", value: "#00f5ff" },
  { name: "--magenta", value: "#ff44cc" },
  { name: "--yellow", value: "#ffdd00" },
  { name: "--green", value: "#39ff14" },
  { name: "--red", value: "#ff4466" },
  { name: "--orange", value: "#ff8833" },
  { name: "--purple", value: "#cc66ff" },
];

const SEVERITY_LABELS: Record<Severity, string> = {
  0: "None",
  1: "Light",
  2: "Heavy",
};
const DOT_ALPHAS: Record<Severity, number> = { 0: 0, 1: 0.5, 2: 1 };
const SEVERITIES: Severity[] = [0, 1, 2];

const MOCK_LOGS: Record<string, Severity> = {
  "2026-01-08": 2,
  "2026-01-19": 1,
  "2026-01-30": 2,
  "2026-02-11": 2,
  "2026-02-22": 1,
  "2026-03-04": 2,
  "2026-03-17": 2,
  "2026-03-28": 1,
  "2026-04-05": 2,
  "2026-04-14": 2,
  "2026-04-20": 1,
  "2026-04-24": 2,
};

const MOCK_ALL_LOGS: AllLogs = {
  "2026-01-08": { red_meat: 2 },
  "2026-01-19": { poultry: 1 },
  "2026-02-11": { fish: 2, alcohol: 1 },
  "2026-02-22": { red_meat: 1 },
  "2026-03-04": { alcohol: 2 },
  "2026-03-17": { poultry: 2 },
  "2026-03-28": { fish: 1 },
  "2026-04-05": { red_meat: 2 },
  "2026-04-14": { alcohol: 2 },
  "2026-04-20": { poultry: 1 },
  "2026-04-24": { red_meat: 2, fish: 1 },
};

const MOCK_DETAIL_LOGS: Record<string, Severity> = {
  red_meat: 2,
  poultry: 0,
  fish: 1,
  alcohol: 2,
};

export default function DesignPage() {
  const [detailDate, setDetailDate] = useState<string | null>(null);
  const todayStr = useMemo(() => toLocalDateString(new Date()), []);
  const monthYear = useMemo(() => formatMonthYear(new Date()), []);

  const mockDays = useMemo((): HabitDayEntry[] => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const severities = [1, 2, 0, 2, 0] as const;
    return Array.from({ length: 5 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (4 - i));
      const dateStr = toLocalDateString(d);
      return {
        dateStr,
        dayLabel: d.toLocaleDateString("en-US", { weekday: "short" }),
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
        <p className="font-body text-xs text-muted uppercase tracking-[3px]">
          {monthYear}
        </p>
        <h1 className="font-display mt-2 leading-tight text-[22px] text-accent">
          PIXEL//OS
        </h1>
        <p className="font-body text-xs text-muted mt-1">
          8-BIT DESIGN SYSTEM — v1.2
        </p>
      </header>

      <section className="mb-10">
        <p className="font-display text-[8px] text-accent tracking-[2px] uppercase mb-3">
          {"// Colors"}
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          {COLOR_TOKENS.map(({ name, value }) => (
            <div key={name} className="flex items-center gap-2.5">
              <div
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: value,
                  border: "2px solid var(--color-border)",
                  flexShrink: 0,
                }}
              />
              <div>
                <p className="font-body text-xs text-foreground">{name}</p>
                <p className="font-body text-xs text-muted">{value}</p>
              </div>
            </div>
          ))}
          {MOCK_HABITS.map((h) => (
            <div key={h.key} className="flex items-center gap-2.5">
              <div
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: h.color,
                  border: `2px solid ${h.color}`,
                  flexShrink: 0,
                }}
              />
              <div>
                <p className="font-body text-xs text-foreground">
                  {h.emoji} {h.label}
                </p>
                <p className="font-body text-xs text-muted">{h.color}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <p className="font-display text-[8px] text-accent tracking-[2px] uppercase mb-3">
          {"// Typography"}
        </p>
        <div className="bg-surface border-2 border-border shadow-px p-4 flex flex-col gap-5">
          <div>
            <p className="font-body text-xs text-muted mb-2.5">
              Press Start 2P — display / headings
            </p>
            <div className="font-display flex flex-col gap-1.5">
              <p className="text-[24px] text-accent">DISPLAY 24</p>
              <p className="text-[16px] text-yellow">HEADING 16</p>
              <p style={{ fontSize: 11, color: "var(--color-magenta)" }}>
                LABEL 11
              </p>
              <p className="text-[8px] text-green">CAPTION 8</p>
            </div>
          </div>
          <div>
            <p className="font-body text-xs text-muted mb-2.5">
              Silkscreen — data / body / UI
            </p>
            <div className="font-body flex flex-col gap-1.5">
              <p className="text-[13px] text-foreground">
                Body 13 — Insert coin
              </p>
              <p className="text-[11px] text-foreground">
                Small 11 — Player one
              </p>
              <p className="text-xs text-muted">Caption 12 — © 1985</p>
            </div>
          </div>
          <div>
            <p className="font-body text-xs text-muted mb-2.5">
              VT323 — terminal / prose
            </p>
            <p
              style={{
                fontFamily: "var(--font-vt323)",
                fontSize: 20,
                color: "var(--color-green)",
                lineHeight: 1.4,
              }}
            >
              10 PRINT &quot;HELLO WORLD&quot;
              <br />
              20 GOTO 10
            </p>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <p className="font-display text-[8px] text-accent tracking-[2px] uppercase mb-3">
          {"// Severity Scale"}
        </p>
        <div className="bg-surface border-2 border-border shadow-px p-4 flex flex-col gap-4">
          <div>
            <p className="font-body text-xs text-muted mb-2.5">
              Pixel square — habit card input
            </p>
            <div className="flex justify-between">
              {SEVERITIES.map((s) => (
                <div key={s} className="flex flex-col items-center gap-1.5">
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      backgroundColor:
                        s === 0
                          ? "transparent"
                          : hexToRgba(MOCK_HABITS[0].color, DOT_ALPHAS[s]),
                      border:
                        s === 0
                          ? `2px solid ${hexToRgba(MOCK_HABITS[0].color, 0.35)}`
                          : `2px solid ${MOCK_HABITS[0].color}`,
                      boxShadow:
                        s === 2
                          ? `0 0 6px ${hexToRgba(MOCK_HABITS[0].color, 0.7)}`
                          : undefined,
                    }}
                  />
                  <p className="font-body text-[8px] text-muted">
                    {SEVERITY_LABELS[s]}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="font-body text-xs text-muted mb-2.5">
              Heat cell — year / history grid
            </p>
            <div className="flex justify-between">
              {SEVERITIES.map((s) => (
                <div key={s} className="flex flex-col items-center gap-1.5">
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      backgroundColor: hexToRgba(
                        MOCK_HABITS[0].color,
                        s === 0 ? 0.12 : DOT_ALPHAS[s],
                      ),
                    }}
                  />
                  <p className="font-body text-[8px] text-muted">
                    {SEVERITY_LABELS[s]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <p className="font-display text-[8px] text-accent tracking-[2px] uppercase mb-3">
          {"// Habit Cards"}
        </p>
        <div className="flex flex-col gap-3">
          {MOCK_HABITS.map((h) => (
            <HabitCard
              key={h.key}
              habit={h}
              days={mockDays}
              onSeverityChange={handleNoOp}
            />
          ))}
        </div>
      </section>

      <section className="mb-10">
        <p className="font-display text-[8px] text-accent tracking-[2px] uppercase mb-3">
          {"// Buttons"}
        </p>
        <div className="bg-surface border-2 border-border shadow-px p-4 flex flex-col gap-3">
          <BackButton href="/" />
          <Button variant="primary" className="w-full text-center">
            CONNECT GOOGLE DRIVE
          </Button>
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1 text-center">
              EXPORT
            </Button>
            <Button variant="secondary" className="flex-1 text-center">
              IMPORT
            </Button>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost">DISCONNECT</Button>
            <Button variant="ghost" disabled>
              SYNC NOW
            </Button>
            <Button variant="ghost" size="sm">
              CLOSE
            </Button>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <p className="font-display text-[8px] text-accent tracking-[2px] uppercase mb-3">
          {"// Form Controls"}
        </p>
        <div className="flex flex-col gap-4">
          <TextInput
            label="Name"
            value="Running"
            onChange={handleNoOp}
            placeholder="e.g. Running"
            maxLength={32}
          />
          <TextInput
            label="Emoji"
            value="🏃"
            onChange={handleNoOp}
            maxLength={4}
            inputClassName="w-16 text-xl text-center"
          />
          <SegmentedToggle
            label="Direction"
            options={[
              {
                value: "building",
                label: "BUILDING",
                description: "Streak = consecutive days with a log",
              },
              {
                value: "reducing",
                label: "REDUCING",
                description: "Streak = consecutive days without logging",
              },
            ]}
            value="building"
            color="#00f5ff"
            onChange={handleNoOp}
          />
        </div>
      </section>

      <section className="mb-10">
        <p className="font-display text-[8px] text-accent tracking-[2px] uppercase mb-3">
          {"// Last 30 Days"}
        </p>
        <Last30Days allLogs={MOCK_ALL_LOGS} />
      </section>

      <section className="mb-10">
        <p className="font-display text-[8px] text-accent tracking-[2px] uppercase mb-3">
          {"// Year Calendar"}
        </p>
        <Suspense>
          <YearCalendar
            habit={MOCK_HABITS[0]}
            logs={MOCK_LOGS}
            year={new Date().getFullYear()}
            onDaySelect={handleNoOp}
          />
        </Suspense>
      </section>

      <section className="mb-10">
        <p className="font-display text-[8px] text-accent tracking-[2px] uppercase mb-3">
          {"// Bottom Nav"}
        </p>
        <div className="relative h-16 bg-surface border-2 border-border overflow-hidden">
          <BottomNav />
        </div>
      </section>

      <section className="mb-10">
        <p className="font-display text-[8px] text-accent tracking-[2px] uppercase mb-3">
          {"// Day Detail"}
        </p>
        <button
          type="button"
          onClick={() => setDetailDate(todayStr)}
          className="bg-surface border-2 border-border shadow-px p-4 w-full text-left cursor-pointer"
        >
          <p className="font-display text-xs text-accent">OPEN DAY DETAIL</p>
          <p className="font-body text-xs text-muted mt-1">
            Bottom sheet — logged habits for a date
          </p>
        </button>
      </section>

      {detailDate && (
        <DayDetail
          dateStr={detailDate}
          logs={MOCK_DETAIL_LOGS}
          onClose={handleClose}
        />
      )}

      {false && (
        <ConfirmModal
          title="Delete 🥩 Red Meat?"
          message="All logged data for this habit will be kept but the habit will be removed."
          confirmLabel="DELETE"
          onConfirm={handleNoOp}
          onCancel={handleNoOp}
        />
      )}
    </div>
  );
}
