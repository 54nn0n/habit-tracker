"use client";

import { useState, useCallback } from "react";
import type { Suggestion } from "@/components/onboarding/data";
import { HABIT_COLORS } from "@/lib/habits";
import Button from "@/components/button";
import DotInput from "@/components/dot-input";

interface DemoStepProps {
  firstSuggestion: Suggestion | undefined;
  onNext: () => void;
}

const DEMO_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;

const SEVERITY_LEGEND = [
  {
    style: { border: "2px dashed rgba(255,255,255,0.2)" },
    label: "Not logged",
  },
  {
    style: { border: "2px solid rgba(255,255,255,0.3)" },
    label: "None / clean",
  },
  {
    style: {
      backgroundColor: "rgba(255,255,255,0.4)",
      border: "2px solid rgba(255,255,255,0.6)",
    },
    label: "Light",
  },
  {
    style: {
      backgroundColor: "rgba(255,255,255,0.9)",
      border: "2px solid white",
    },
    label: "Heavy",
  },
];

const BOOLEAN_LEGEND = [
  {
    style: { border: "2px dashed rgba(255,255,255,0.2)" },
    label: "Not logged",
  },
  {
    style: { border: "2px solid rgba(255,255,255,0.3)" },
    label: "None / skipped",
  },
  {
    style: {
      backgroundColor: "rgba(255,255,255,0.9)",
      border: "2px solid white",
    },
    label: "Done",
  },
];

export default function DemoStep({ firstSuggestion, onNext }: DemoStepProps) {
  const color = firstSuggestion?.color ?? HABIT_COLORS[0];
  const logType = firstSuggestion?.logType ?? "boolean";
  const direction = firstSuggestion?.direction ?? "building";
  const today = new Date();

  const [severities, setSeverities] = useState<(0 | 1 | 2 | undefined)[]>(() =>
    logType === "severity"
      ? [2, undefined, 1, 0, undefined]
      : [1, undefined, 1, 0, undefined],
  );

  const handleChange = useCallback((i: number, s: 0 | 1 | 2 | undefined) => {
    setSeverities((prev) => {
      const next = [...prev];
      next[i] = s;
      return next;
    });
  }, []);

  const days = DEMO_DAYS.map((label, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (4 - i));
    return { label, number: d.getDate(), isToday: i === 4 };
  });

  const legend = logType === "severity" ? SEVERITY_LEGEND : BOOLEAN_LEGEND;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-display text-[10px] text-accent tracking-[2px] mb-2">
          STEP 02
        </p>
        <h2 className="font-display text-[18px] text-foreground leading-tight mb-2">
          HOW LOGGING WORKS
        </h2>
        <p className="font-body text-xs text-muted">
          Tap a square to cycle through states.
        </p>
      </div>

      <div className="bg-surface border-2 border-border p-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">{firstSuggestion?.emoji}</span>
          <span className="font-body text-xs text-foreground">
            {firstSuggestion?.label ?? "My Habit"}
          </span>
        </div>
        <div className="flex justify-between">
          {days.map(({ label, number, isToday }, i) => (
            <DotInput
              key={label}
              severity={severities[i]}
              color={color}
              logType={logType}
              dayLabel={label}
              dayNumber={number}
              isToday={isToday}
              onChange={(s) => handleChange(i, s)}
            />
          ))}
        </div>
      </div>

      <div className="bg-surface border-2 border-border p-4 flex flex-col gap-3">
        <div>
          <p className="font-display text-[8px] text-accent tracking-[2px] mb-2">
            STATES
          </p>
          <div className="flex flex-col gap-1.5">
            {legend.map(({ style, label }) => (
              <div key={label} className="flex items-center gap-3">
                <span
                  className="flex-shrink-0"
                  style={{ ...style, width: 14, height: 14, display: "block" }}
                />
                <span className="font-body text-[10px] text-muted">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid var(--color-border)",
            paddingTop: 12,
          }}
        >
          <p className="font-display text-[8px] text-accent tracking-[2px] mb-2">
            STREAK
          </p>
          {direction === "reducing" ? (
            <p className="font-body text-[10px] text-muted leading-relaxed">
              This is a <span className="text-foreground">reducing</span> habit.
              Your streak grows on days you{" "}
              <span className="text-foreground">don&apos;t</span> fill a square.
              A clean day is a win.
            </p>
          ) : (
            <p className="font-body text-[10px] text-muted leading-relaxed">
              This is a <span className="text-foreground">building</span> habit.
              Your streak grows on days you{" "}
              <span className="text-foreground">do</span> fill a square.
              Consistency is the goal.
            </p>
          )}
        </div>
      </div>

      <Button variant="primary" onClick={onNext} className="w-full text-center">
        CONTINUE
      </Button>
    </div>
  );
}
