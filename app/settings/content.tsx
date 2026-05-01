"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import type { ChangeEvent } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { encodeLogs, decodeLogs } from "@/lib/md-codec";
import { getAllLogs, setAllLogs } from "@/lib/storage";
import { resetOnboarding } from "@/lib/onboarding";
import { getDeviceId } from "@/lib/push-device-id";
import { syncNow } from "@/lib/sync";
import BackButton from "@/components/back-button";
import Button from "@/components/button";

const DriveSection = dynamic(() => import("@/components/drive-section"), {
  ssr: false,
});

const NotificationsSection = dynamic(
  () => import("@/components/notifications-section"),
  { ssr: false },
);

const VERSION = "0.2.4";

const TOAST_CLASS: Record<"success" | "error", string> = {
  success: "text-green",
  error: "text-red",
};

const SECTION_LABEL =
  "font-display text-[8px] text-accent tracking-[2px] uppercase mb-2";
const PANEL =
  "bg-surface border-2 border-border p-4 flex flex-col gap-3 shadow-px";

function SettingsInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = useCallback(
    (type: "success" | "error", message: string) => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      setToast({ type, message });
      toastTimer.current = setTimeout(() => setToast(null), 2500);
    },
    [],
  );

  const handleOnboarding = useCallback(() => {
    resetOnboarding();
    router.push("/onboarding");
  }, [router]);

  const handleExport = useCallback(() => {
    try {
      const md = encodeLogs(getAllLogs());
      const blob = new Blob([md], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "93_Habits_Log.md";
      a.click();
      URL.revokeObjectURL(url);
      showToast("success", "✓ EXPORTED");
    } catch {
      showToast("error", "✕ Export failed.");
    }
  }, [showToast]);

  const handleImport = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          setAllLogs(decodeLogs(ev.target?.result as string));
          showToast("success", "✓ IMPORTED");
          syncNow();
        } catch {
          showToast("error", "✕ Could not parse file.");
        }
      };
      reader.readAsText(file);
    },
    [showToast],
  );

  const aboutTapsRef = useRef(0);
  const devToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [devMode, setDevMode] = useState(false);
  const [devToast, setDevToast] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (devToastTimer.current) clearTimeout(devToastTimer.current);
    };
  }, []);

  const handleAboutTap = useCallback(() => {
    aboutTapsRef.current += 1;
    if (aboutTapsRef.current >= 5) {
      setDevMode((d) => !d);
      aboutTapsRef.current = 0;
    }
  }, []);

  const handleTestPush = useCallback(async () => {
    const deviceId = getDeviceId();
    const res = await fetch("/api/push/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deviceId }),
    });
    if (devToastTimer.current) clearTimeout(devToastTimer.current);
    setDevToast(
      res.ok
        ? "✓ Notification sent — check your device."
        : "✕ Not subscribed. Enable notifications first.",
    );
    devToastTimer.current = setTimeout(() => setDevToast(null), 3000);
  }, []);

  const authError = searchParams.get("error");

  return (
    <div className="px-4 pt-14 pb-24 max-w-lg mx-auto w-full">
      <header className="mb-8">
        <BackButton href="/" />
        <p className="font-body text-xs text-muted uppercase tracking-[3px]">
          App
        </p>
        <h1 className="font-display mt-2 leading-tight text-[22px] text-accent">
          SETTINGS
        </h1>
      </header>

      <section className="mb-8">
        <p className={SECTION_LABEL}>{"// Google Drive"}</p>
        <DriveSection authError={authError} />
      </section>

      <section className="mb-8">
        <p className={SECTION_LABEL}>{"// Data"}</p>
        <div className={PANEL}>
          <Button
            variant="secondary"
            onClick={handleExport}
            className="w-full text-center"
          >
            EXPORT 93_HABITS_LOG.MD
          </Button>
          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            className="w-full text-center"
          >
            IMPORT 93_HABITS_LOG.MD
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md,text/markdown"
            className="hidden"
            onChange={handleImport}
          />
          {toast && (
            <p className={`font-body text-xs ${TOAST_CLASS[toast.type]}`}>
              {toast.message}
            </p>
          )}
        </div>
      </section>

      <NotificationsSection />

      <section className="mb-8">
        <p className={SECTION_LABEL}>{"// Help"}</p>
        <div className={PANEL}>
          <Button
            variant="secondary"
            onClick={handleOnboarding}
            className="w-full text-center"
          >
            REPLAY INTRO
          </Button>
        </div>
      </section>

      <section className={devMode ? "mb-8" : ""}>
        <p className={SECTION_LABEL}>{"// About"}</p>
        <button
          type="button"
          onClick={handleAboutTap}
          className={`${PANEL} gap-1 w-full text-left`}
        >
          <p className="font-display text-xs text-foreground">93 HABITS</p>
          <p className="font-body text-xs text-muted">v{VERSION}</p>
        </button>
      </section>

      {devMode && (
        <section>
          <p className={SECTION_LABEL}>{"// Dev Tools"}</p>
          <div className={PANEL}>
            <Button
              variant="secondary"
              onClick={handleTestPush}
              className="w-full text-center"
            >
              SEND TEST PUSH
            </Button>
            {devToast && (
              <p className="font-body text-xs text-muted">{devToast}</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default function SettingsContent() {
  return (
    <Suspense>
      <SettingsInner />
    </Suspense>
  );
}
