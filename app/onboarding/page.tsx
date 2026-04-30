"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { addHabit, HABIT_COLORS } from "@/lib/habits";
import type { HabitDirection, HabitLogType } from "@/lib/habits";
import { completeOnboarding } from "@/lib/onboarding";
import Button from "@/components/button";
import DotInput from "@/components/dot-input";

interface Suggestion {
  emoji: string;
  label: string;
  direction: HabitDirection;
  logType: HabitLogType;
  color: string;
}

const SUGGESTIONS: Suggestion[] = [
  {
    emoji: "🥩",
    label: "Red Meat",
    direction: "reducing",
    logType: "severity",
    color: "#ff4466",
  },
  {
    emoji: "🍷",
    label: "Alcohol",
    direction: "reducing",
    logType: "severity",
    color: "#cc66ff",
  },
  {
    emoji: "🚬",
    label: "Smoking",
    direction: "reducing",
    logType: "boolean",
    color: "#ff8833",
  },
  {
    emoji: "🏃",
    label: "Running",
    direction: "building",
    logType: "boolean",
    color: "#39ff14",
  },
  {
    emoji: "🧘",
    label: "Meditation",
    direction: "building",
    logType: "boolean",
    color: "#00f5ff",
  },
  {
    emoji: "📖",
    label: "Reading",
    direction: "building",
    logType: "boolean",
    color: "#ffdd00",
  },
  {
    emoji: "💧",
    label: "Hydration",
    direction: "building",
    logType: "boolean",
    color: "#4488ff",
  },
  {
    emoji: "😴",
    label: "Sleep",
    direction: "building",
    logType: "boolean",
    color: "#ff44cc",
  },
];

type Step = "welcome" | "pick" | "demo" | "done";

const STEP_ORDER: Step[] = ["welcome", "pick", "demo", "done"];

const DEMO_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;

function toKey(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

interface WelcomeStepProps {
  onNext: () => void;
}

function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="font-display text-[10px] text-accent tracking-[2px] mb-4">
          WELCOME
        </p>
        <h1 className="font-display text-[28px] text-foreground leading-tight mb-4">
          TRACK WHAT
          <br />
          MATTERS.
        </h1>
        <p className="font-body text-xs text-muted leading-relaxed">
          Log daily habits. See patterns over time. Build streaks or cut back —
          you decide.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <span className="font-display text-[10px] text-accent w-4 flex-shrink-0">
            01
          </span>
          <p className="font-body text-xs text-foreground">
            Pick a habit to track
          </p>
        </div>
        <div className="flex items-start gap-3">
          <span className="font-display text-[10px] text-accent w-4 flex-shrink-0">
            02
          </span>
          <p className="font-body text-xs text-foreground">
            Log it daily with one tap
          </p>
        </div>
        <div className="flex items-start gap-3">
          <span className="font-display text-[10px] text-accent w-4 flex-shrink-0">
            03
          </span>
          <p className="font-body text-xs text-foreground">
            See your year at a glance
          </p>
        </div>
      </div>

      <Button variant="primary" onClick={onNext} className="w-full text-center">
        GET STARTED
      </Button>
    </div>
  );
}

interface PickStepProps {
  selected: Set<string>;
  onToggle: (key: string) => void;
  onNext: () => void;
}

function PickStep({ selected, onToggle, onNext }: PickStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-display text-[10px] text-accent tracking-[2px] mb-2">
          STEP 01
        </p>
        <h2 className="font-display text-[18px] text-foreground leading-tight mb-2">
          PICK A HABIT
        </h2>
        <p className="font-body text-xs text-muted">
          Choose one or more to start. You can add more later.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {SUGGESTIONS.map((s) => {
          const key = toKey(s.label);
          const isSelected = selected.has(key);
          return (
            <button
              key={key}
              type="button"
              onClick={() => onToggle(key)}
              className="flex items-center gap-3 p-3 text-left transition-colors"
              style={{
                border: isSelected
                  ? `2px solid ${s.color}`
                  : "2px solid var(--color-border)",
                backgroundColor: isSelected
                  ? `${s.color}18`
                  : "var(--color-surface)",
              }}
            >
              <span className="text-xl flex-shrink-0">{s.emoji}</span>
              <span className="font-body text-xs text-foreground">
                {s.label}
              </span>
            </button>
          );
        })}
      </div>

      <Button
        variant="primary"
        onClick={onNext}
        disabled={selected.size === 0}
        className="w-full text-center"
      >
        CONTINUE
      </Button>
    </div>
  );
}

interface DemoStepProps {
  firstSuggestion: Suggestion | undefined;
  onFinish: () => void;
}

function DemoStep({ firstSuggestion, onFinish }: DemoStepProps) {
  const color = firstSuggestion?.color ?? HABIT_COLORS[0];
  const logType = firstSuggestion?.logType ?? "boolean";
  const today = new Date();

  const [severities, setSeverities] = useState<(0 | 1 | 2 | undefined)[]>(
    () => [1, undefined, 2, 0, undefined],
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
          Tap a square to cycle through states. Try it below.
        </p>
      </div>

      <div className="bg-surface border-2 border-border p-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">{firstSuggestion?.emoji ?? "✨"}</span>
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

      <div className="flex flex-col gap-2 font-body text-xs text-muted">
        {logType === "severity" ? (
          <>
            <p>— — — Dashed border = not logged yet</p>
            <p>◻ Solid border = logged none</p>
            <p>▪ Half fill = light</p>
            <p>■ Full fill = heavy</p>
          </>
        ) : (
          <>
            <p>— — — Dashed border = not logged yet</p>
            <p>◻ Solid border = logged none</p>
            <p>■ Full fill = done</p>
          </>
        )}
      </div>

      <Button
        variant="primary"
        onClick={onFinish}
        className="w-full text-center"
      >
        LETS GO
      </Button>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const selectedSuggestions = SUGGESTIONS.filter((s) =>
    selected.has(toKey(s.label)),
  );

  const handleToggle = useCallback((key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const advance = useCallback(() => {
    const idx = STEP_ORDER.indexOf(step);
    setStep(STEP_ORDER[idx + 1]);
  }, [step]);

  const finish = useCallback(() => {
    selectedSuggestions.forEach((s) => {
      addHabit({
        key: toKey(s.label),
        label: s.label,
        emoji: s.emoji,
        color: s.color,
        direction: s.direction,
        logType: s.logType,
      });
    });
    completeOnboarding();
    router.replace("/");
  }, [selectedSuggestions, router]);

  const stepIndex = STEP_ORDER.indexOf(step);
  const totalSteps = STEP_ORDER.length - 1;

  return (
    <div className="min-h-screen flex flex-col px-4 pt-14 pb-10 max-w-lg mx-auto w-full">
      <div className="flex gap-1.5 mb-10">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className="h-0.5 flex-1 transition-colors"
            style={{
              backgroundColor:
                i < stepIndex
                  ? "var(--color-accent)"
                  : i === stepIndex
                    ? "var(--color-accent)"
                    : "var(--color-border)",
            }}
          />
        ))}
      </div>

      <div className="flex-1">
        {step === "welcome" && <WelcomeStep onNext={advance} />}
        {step === "pick" && (
          <PickStep
            selected={selected}
            onToggle={handleToggle}
            onNext={advance}
          />
        )}
        {step === "demo" && (
          <DemoStep
            firstSuggestion={selectedSuggestions[0]}
            onFinish={finish}
          />
        )}
      </div>
    </div>
  );
}
