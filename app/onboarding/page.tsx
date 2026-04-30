"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { addHabit } from "@/lib/habits";
import { completeOnboarding } from "@/lib/onboarding";
import { SUGGESTIONS, toKey } from "@/components/onboarding/data";
import WelcomeStep from "@/components/onboarding/welcome-step";
import PickStep from "@/components/onboarding/pick-step";
import DemoStep from "@/components/onboarding/demo-step";
import SyncStep from "@/components/onboarding/sync-step";

type Step = "welcome" | "pick" | "demo" | "sync";

const STEP_ORDER: Step[] = ["welcome", "pick", "demo", "sync"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const selectedSuggestions = useMemo(
    () => SUGGESTIONS.filter((s) => selected.has(toKey(s.label))),
    [selected],
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
    if (idx < STEP_ORDER.length - 1) setStep(STEP_ORDER[idx + 1]);
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

  return (
    <div className="min-h-screen flex flex-col px-4 pt-14 pb-10 max-w-lg mx-auto w-full">
      <div className="flex gap-1.5 mb-10">
        {STEP_ORDER.map((s, i) => (
          <div
            key={s}
            className="h-0.5 flex-1 transition-colors"
            style={{
              backgroundColor:
                i <= stepIndex
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
          <DemoStep firstSuggestion={selectedSuggestions[0]} onNext={advance} />
        )}
        {step === "sync" && <SyncStep onSkip={finish} />}
      </div>
    </div>
  );
}
