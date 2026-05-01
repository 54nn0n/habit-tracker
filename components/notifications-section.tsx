"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";
import { usePushNotifications } from "@/lib/use-push-notifications";
import Button from "@/components/button";

const SECTION_LABEL =
  "font-display text-[8px] text-accent tracking-[2px] uppercase mb-2";
const PANEL =
  "bg-surface border-2 border-border p-4 flex flex-col gap-3 shadow-px";
const SELECT =
  "font-body text-xs text-foreground bg-surface border border-border px-2 py-1 cursor-pointer";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function snapToQuarter(minutes: number): number {
  return Math.round(minutes / 15) * 15 === 60
    ? 0
    : Math.round(minutes / 15) * 15;
}

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  disabled?: boolean;
}

function TimePicker({ value, onChange, disabled }: TimePickerProps) {
  const [rawH, rawM] = value.split(":").map(Number);
  const h = rawH ?? 20;
  const m = snapToQuarter(rawM ?? 0);

  const handleHour = (e: ChangeEvent<HTMLSelectElement>) =>
    onChange(`${pad(Number(e.target.value))}:${pad(m)}`);

  const handleMinute = (e: ChangeEvent<HTMLSelectElement>) =>
    onChange(`${pad(h)}:${pad(Number(e.target.value))}`);

  return (
    <div className="flex items-center gap-1">
      <select
        value={h}
        onChange={handleHour}
        disabled={disabled}
        className={SELECT}
      >
        {HOURS.map((hour) => (
          <option key={hour} value={hour}>
            {pad(hour)}
          </option>
        ))}
      </select>
      <span className="font-body text-xs text-muted">:</span>
      <select
        value={m}
        onChange={handleMinute}
        disabled={disabled}
        className={SELECT}
      >
        {MINUTES.map((min) => (
          <option key={min} value={min}>
            {pad(min)}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function NotificationsSection() {
  const {
    permission,
    subscribed,
    time,
    loading,
    subscribe,
    unsubscribe,
    updateTime,
  } = usePushNotifications();

  const [pendingTime, setPendingTime] = useState(time);

  const supported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window;

  if (!supported) return null;

  return (
    <section className="mb-8">
      <p className={SECTION_LABEL}>{"// Notifications"}</p>
      <div className={PANEL}>
        {permission === "denied" ? (
          <p className="font-body text-xs text-red">
            Notifications blocked in browser settings.
          </p>
        ) : subscribed ? (
          <>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-body text-[11px] text-green">ENABLED</p>
                <p className="font-body text-xs text-muted mt-0.5">
                  Daily reminder at {time}
                </p>
              </div>
              <Button variant="ghost" onClick={unsubscribe} disabled={loading}>
                DISABLE
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <p className="font-body text-xs text-muted">Change time</p>
              <TimePicker
                value={pendingTime}
                onChange={(t) => {
                  setPendingTime(t);
                  updateTime(t);
                }}
                disabled={loading}
              />
            </div>
          </>
        ) : (
          <>
            <p className="font-body text-xs text-muted leading-relaxed">
              Get a daily reminder to log your habits.
            </p>
            <div className="flex items-center justify-between">
              <p className="font-body text-xs text-muted">Time</p>
              <TimePicker value={pendingTime} onChange={setPendingTime} />
            </div>
            <Button
              variant="primary"
              onClick={() => subscribe(pendingTime)}
              disabled={loading}
              className="w-full text-center"
            >
              ENABLE NOTIFICATIONS
            </Button>
          </>
        )}
      </div>
    </section>
  );
}
