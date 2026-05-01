"use client";

import { useState, useEffect, useCallback } from "react";
import { getDeviceId } from "@/lib/push-device-id";

export type NotificationPermission = "default" | "granted" | "denied";

interface PushState {
  permission: NotificationPermission;
  subscribed: boolean;
  time: string;
  loading: boolean;
  error: string | null;
}

const DEFAULT_TIME = "20:00";
const STORED_TIME_KEY = "push-notification-time";

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Url = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64Url);
  return Uint8Array.from(raw, (c) =>
    c.charCodeAt(0),
  ) as Uint8Array<ArrayBuffer>;
}

function localTimeToUtcCron(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const localTotalMinutes = hours * 60 + minutes;
  // getTimezoneOffset() = UTC - local (in minutes)
  const utcTotalMinutes =
    (localTotalMinutes + new Date().getTimezoneOffset() + 1440) % 1440;
  const utcHours = Math.floor(utcTotalMinutes / 60);
  const utcMinutes = utcTotalMinutes % 60;
  return `${utcMinutes} ${utcHours} * * *`;
}

export function usePushNotifications(): PushState & {
  subscribe: (time: string) => Promise<void>;
  unsubscribe: () => Promise<void>;
  updateTime: (time: string) => Promise<void>;
} {
  const [permission, setPermission] = useState<NotificationPermission>(
    () =>
      (typeof Notification !== "undefined"
        ? Notification.permission
        : "default") as NotificationPermission,
  );
  const [subscribed, setSubscribed] = useState(false);
  const [time, setTime] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_TIME;
    return localStorage.getItem(STORED_TIME_KEY) ?? DEFAULT_TIME;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      if (!sub) return;
      // Verify the server also has this subscription — they can drift if the
      // API call failed silently after the browser subscribed
      const deviceId = getDeviceId();
      const res = await fetch(
        `/api/push/subscribe?deviceId=${encodeURIComponent(deviceId)}`,
      ).catch(() => null);
      const { active } = (await res?.json().catch(() => ({}))) ?? {};
      setSubscribed(!!active);
    });
  }, []);

  const subscribe = useCallback(async (notifTime: string) => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    setLoading(true);
    setError(null);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm as NotificationPermission);
      if (perm !== "granted") return;

      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      if (existing) await existing.unsubscribe();

      let sub: PushSubscription;
      try {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
          ),
        });
      } catch (e) {
        setError(`Browser subscription failed: ${(e as Error).message}`);
        return;
      }

      const cron = localTimeToUtcCron(notifTime);
      const deviceId = getDeviceId();

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription: sub, cron, deviceId }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        setError(`Server error ${res.status}: ${text}`);
        return;
      }

      localStorage.setItem(STORED_TIME_KEY, notifTime);
      setTime(notifTime);
      setSubscribed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    if (!("serviceWorker" in navigator)) return;
    setLoading(true);
    setError(null);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();

      const res = await fetch("/api/push/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deviceId: getDeviceId() }),
      });
      if (!res.ok) return;

      setSubscribed(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTime = useCallback(
    async (newTime: string) => {
      if (!subscribed) return;
      setLoading(true);
      setError(null);
      try {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (!sub) return;

        const cron = localTimeToUtcCron(newTime);
        const deviceId = getDeviceId();

        const res = await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subscription: sub, cron, deviceId }),
        });
        if (!res.ok) return;

        localStorage.setItem(STORED_TIME_KEY, newTime);
        setTime(newTime);
      } finally {
        setLoading(false);
      }
    },
    [subscribed],
  );

  return {
    permission,
    subscribed,
    time,
    loading,
    error,
    subscribe,
    unsubscribe,
    updateTime,
  };
}
