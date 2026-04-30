"use client";

import Link from "next/link";
import Button from "@/components/button";

interface SyncStepProps {
  onSkip: () => void;
}

const DRIVE_BENEFITS = [
  "Access from any device or browser",
  "Import your file into any other tool",
  "No account required - just your Google Drive",
];

export default function SyncStep({ onSkip }: SyncStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-display text-[10px] text-accent tracking-[2px] mb-2">
          STEP 03
        </p>
        <h2 className="font-display text-[18px] text-foreground leading-tight mb-2">
          YOUR DATA
        </h2>
        <p className="font-body text-xs text-muted">
          Understand how your logs are stored.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="bg-surface border-2 border-border p-4 flex flex-col gap-2">
          <p className="font-display text-[8px] text-foreground tracking-[2px]">
            LOCAL STORAGE
          </p>
          <p className="font-body text-xs text-muted leading-relaxed">
            All your logs are saved in this browser. They stay here even if you
            close the app, but they won&apos;t follow you to another device or
            browser.
          </p>
        </div>

        <div className="bg-surface border-2 border-accent p-4 flex flex-col gap-2">
          <p className="font-display text-[8px] text-accent tracking-[2px]">
            GOOGLE DRIVE SYNC
          </p>
          <p className="font-body text-xs text-muted leading-relaxed">
            Connect Google Drive to back up your data and sync across devices.
            We store a single <span className="text-foreground">.md file</span>{" "}
            - plain text, human-readable, yours to keep or delete at any time.
          </p>
          <ul className="flex flex-col gap-1 mt-1">
            {DRIVE_BENEFITS.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="font-display text-[8px] text-accent flex-shrink-0 mt-0.5">
                  {">"}
                </span>
                <span className="font-body text-[10px] text-muted">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Link href="/settings" onClick={onSkip} className="block">
          <Button variant="primary" className="w-full text-center">
            CONNECT GOOGLE DRIVE
          </Button>
        </Link>
        <Button variant="muted" onClick={onSkip} className="w-full text-center">
          SKIP FOR NOW
        </Button>
      </div>
    </div>
  );
}
