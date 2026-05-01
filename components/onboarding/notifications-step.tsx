"use client";

import { useState, useCallback, useRef } from "react";
import type { ChangeEvent } from "react";
import { usePushNotifications } from "@/lib/use-push-notifications";
import Button from "@/components/button";

const SELECT =
  "font-body text-xs text-foreground bg-surface border border-border px-2 py-1 cursor-pointer";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function snapToFive(minutes: number) {
  const snapped = Math.round(minutes / 5) * 5;
  return snapped >= 60 ? 0 : snapped;
}

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  disabled?: boolean;
}

function TimePicker({ value, onChange, disabled }: TimePickerProps) {
  const [rawH, rawM] = value.split(":").map(Number);
  const h = rawH ?? 20;
  const m = snapToFive(rawM ?? 0);

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

interface NotificationsStepProps {
  onNext: () => void;
}

export default function NotificationsStep({ onNext }: NotificationsStepProps) {
  const {
    permission,
    time,
    loading,
    error,
    subscribe,
  } = usePushNotifications();

  const [pendingTime, setPendingTime] = useState(time);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnable = useCallback(async () => {
    const ok = await subscribe(pendingTime);
    if (ok) {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      setToast(`Daily reminder set for ${pendingTime}.`);
      toastTimer.current = setTimeout(() => {
        setToast(null);
        onNext();
      }, 1500);
    }
  }, [subscribe, pendingTime, onNext]);

  const supported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window;

  if (!supported) {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <p className="font-display text-[10px] text-accent tracking-[2px] mb-4">
            REMINDERS
          </p>
          <h1 className="font-display text-[28px] text-foreground leading-tight mb-4">
            NOT SUPPORTED.
          </h1>
          <p className="font-body text-xs text-muted leading-relaxed">
            Your browser doesn&apos;t support push notifications. You can skip
            this step.
          </p>
        </div>
        <Button variant="primary" onClick={onNext} className="w-full text-center">
          CONTINUE
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-display text-[10px] text-accent tracking-[2px] mb-4">
          REMINDERS
        </p>
        <h1 className="font-display text-[28px] text-foreground leading-tight mb-4">
          STAY ON
          <br />
          TRACK.
        </h1>
        <p className="font-body text-xs text-muted leading-relaxed">
          Get a daily reminder to log your habits.
        </p>
      </div>

      <div className="bg-surface border-2 border-border p-4 flex flex-col gap-4 shadow-px">
        {permission === "denied" ? (
          <p className="font-body text-xs text-red leading-relaxed">
            Notifications are blocked. You can still enable them later in
            Settings after allowing them in your browser.
          </p>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="font-body text-xs text-foreground">Reminder Time</p>
              <TimePicker
                value={pendingTime}
                onChange={setPendingTime}
                disabled={loading || !!toast}
              />
            </div>
            <Button
              variant="primary"
              onClick={handleEnable}
              disabled={loading || !!toast}
              className="w-full text-center"
            >
              {loading ? "ENABLING..." : "ENABLE REMINDERS"}
            </Button>
          </>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <Button
          variant="ghost"
          onClick={onNext}
          disabled={loading || !!toast}
          className="w-full text-center"
        >
          {permission === "denied" ? "CONTINUE" : "SKIP FOR NOW"}
        </Button>
        {toast && <p className="font-body text-xs text-green text-center">{toast}</p>}
        {error && <p className="font-body text-xs text-red text-center">{error}</p>}
      </div>
    </div>
  );
}
