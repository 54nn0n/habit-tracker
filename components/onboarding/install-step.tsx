"use client";

import { useSyncExternalStore } from "react";
import Button from "@/components/button";

interface InstallStepProps {
  onNext: () => void;
}

const IOS_STEPS = [
  "Tap the Share button at the bottom of Safari",
  'Scroll down and tap "Add to Home Screen"',
  'Tap "Add" in the top right',
];

const ANDROID_STEPS = [
  "Tap the menu icon in the top right of Chrome",
  'Tap "Add to Home screen" or "Install app"',
  "Tap Install to confirm",
];

const PLATFORM_SECTIONS: { label: string; steps: string[] }[] = [
  { label: "SAFARI ON IOS", steps: IOS_STEPS },
  { label: "CHROME ON ANDROID", steps: ANDROID_STEPS },
];

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in window.navigator &&
      (window.navigator as { standalone?: boolean }).standalone === true)
  );
}

const noop = () => () => {};

export default function InstallStep({ onNext }: InstallStepProps) {
  const installed = useSyncExternalStore(noop, isStandalone, () => false);

  if (installed) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <p className="font-display text-[10px] text-accent tracking-[2px] mb-2">
            STEP 04
          </p>
          <h2 className="font-display text-[18px] text-foreground leading-tight mb-2">
            YOU&apos;RE ALL SET
          </h2>
          <p className="font-body text-xs text-muted">
            The app is already installed on your device.
          </p>
        </div>
        <div className="bg-surface border-2 border-accent p-4 flex items-center gap-3">
          <span className="font-display text-[10px] text-accent tracking-[2px]">
            INSTALLED
          </span>
        </div>
        <Button
          variant="primary"
          onClick={onNext}
          className="w-full text-center"
        >
          FINISH
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-display text-[10px] text-accent tracking-[2px] mb-2">
          STEP 04
        </p>
        <h2 className="font-display text-[18px] text-foreground leading-tight mb-2">
          ADD TO HOME SCREEN
        </h2>
        <p className="font-body text-xs text-muted">
          Install the app so it&apos;s always one tap away.
        </p>
      </div>

      {PLATFORM_SECTIONS.map(({ label, steps }) => (
        <div
          key={label}
          className="bg-surface border-2 border-border p-4 flex flex-col gap-3"
        >
          <p className="font-display text-[8px] text-accent tracking-[2px]">
            {label}
          </p>
          {steps.map((text, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="font-display text-[10px] text-accent w-4 flex-shrink-0 mt-0.5">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="font-body text-xs text-muted leading-relaxed">
                {text}
              </p>
            </div>
          ))}
        </div>
      ))}

      <div className="flex flex-col gap-2">
        <Button
          variant="primary"
          onClick={onNext}
          className="w-full text-center"
        >
          I&apos;VE ADDED IT
        </Button>
        <Button variant="muted" onClick={onNext} className="w-full text-center">
          SKIP FOR NOW
        </Button>
      </div>
    </div>
  );
}
