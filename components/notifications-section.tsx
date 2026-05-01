"use client";

import { useState } from "react";
import { usePushNotifications } from "@/lib/use-push-notifications";
import Button from "@/components/button";

const SECTION_LABEL =
  "font-display text-[8px] text-accent tracking-[2px] uppercase mb-2";
const PANEL =
  "bg-surface border-2 border-border p-4 flex flex-col gap-3 shadow-px";

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
              <Button
                variant="ghost"
                onClick={unsubscribe}
                disabled={loading}
              >
                DISABLE
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <p className="font-body text-xs text-muted">Change time</p>
              <input
                type="time"
                value={time}
                onChange={(e) => updateTime(e.target.value)}
                disabled={loading}
                className="font-body text-xs text-foreground bg-transparent border border-border px-2 py-1"
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
              <input
                type="time"
                value={pendingTime}
                onChange={(e) => setPendingTime(e.target.value)}
                className="font-body text-xs text-foreground bg-transparent border border-border px-2 py-1"
              />
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
