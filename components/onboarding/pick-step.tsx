"use client";

import { SUGGESTIONS, toKey } from "@/components/onboarding/data";
import type { Suggestion } from "@/components/onboarding/data";
import Button from "@/components/button";

interface PickStepProps {
  selected: Set<string>;
  onToggle: (key: string) => void;
  onNext: () => void;
}

const DIRECTION_SECTIONS: {
  direction: "reducing" | "building";
  label: string;
  description: string;
}[] = [
  {
    direction: "reducing",
    label: "CUTTING BACK",
    description:
      "Streak = consecutive clean days. Filling a square logs that you did it.",
  },
  {
    direction: "building",
    label: "BUILDING UP",
    description:
      "Streak = consecutive done days. Filling a square logs that you did it.",
  },
];

function SuggestionTile({
  s,
  isSelected,
  onToggle,
}: {
  s: Suggestion;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-3 p-3 text-left transition-colors"
      style={{
        border: isSelected
          ? `2px solid ${s.color}`
          : "2px solid var(--color-border)",
        backgroundColor: isSelected ? `${s.color}18` : "var(--color-surface)",
      }}
    >
      <span className="text-xl flex-shrink-0">{s.emoji}</span>
      <div className="min-w-0">
        <p className="font-body text-xs text-foreground">{s.label}</p>
        <p className="font-display text-[7px] text-muted mt-0.5">
          {s.logType === "severity" ? "INTENSITY" : "BOOLEAN"}
        </p>
      </div>
    </button>
  );
}

export default function PickStep({
  selected,
  onToggle,
  onNext,
}: PickStepProps) {
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
          Choose one or more to start. You can add or edit anytime.
        </p>
      </div>

      <div className="flex flex-col gap-5">
        {DIRECTION_SECTIONS.map(({ direction, label, description }) => {
          const group = SUGGESTIONS.filter((s) => s.direction === direction);
          return (
            <div key={direction}>
              <div className="flex items-baseline gap-2 mb-1.5">
                <p className="font-display text-[8px] text-accent tracking-[2px]">
                  {label}
                </p>
              </div>
              <p className="font-body text-[10px] text-muted mb-2">
                {description}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {group.map((s) => {
                  const key = toKey(s.label);
                  return (
                    <SuggestionTile
                      key={key}
                      s={s}
                      isSelected={selected.has(key)}
                      onToggle={() => onToggle(key)}
                    />
                  );
                })}
              </div>
            </div>
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
