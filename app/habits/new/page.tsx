"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { addHabit, HABIT_COLORS } from "@/lib/habits";
import type { HabitDirection, HabitLogType } from "@/lib/habits";
import BackButton from "@/components/back-button";
import Button from "@/components/button";
import TextInput from "@/components/text-input";
import SegmentedToggle from "@/components/segmented-toggle";

const DIRECTION_OPTIONS: [
  { value: HabitDirection; label: string; description: string },
  { value: HabitDirection; label: string; description: string },
] = [
  {
    value: "building",
    label: "BUILDING",
    description: "Streak = consecutive days with a log",
  },
  {
    value: "reducing",
    label: "REDUCING",
    description: "Streak = consecutive days without logging",
  },
];

const LOG_TYPE_OPTIONS: [
  { value: HabitLogType; label: string; description: string },
  { value: HabitLogType; label: string; description: string },
] = [
  { value: "boolean", label: "SIMPLE", description: "Done / not done" },
  {
    value: "severity",
    label: "INTENSITY",
    description: "None / light / heavy",
  },
];

function toKey(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

export default function NewHabitPage() {
  const router = useRouter();

  const [label, setLabel] = useState("");
  const [emoji, setEmoji] = useState("✨");
  const [color, setColor] = useState(HABIT_COLORS[0]);
  const [direction, setDirection] = useState<HabitDirection>("building");
  const [logType, setLogType] = useState<HabitLogType>("boolean");

  const handleSubmit = useCallback(() => {
    const trimmed = label.trim();
    if (!trimmed) return;
    addHabit({
      key: toKey(trimmed),
      label: trimmed,
      emoji,
      color,
      direction,
      logType,
    });
    router.push("/");
  }, [label, emoji, color, direction, logType, router]);

  const canSubmit = label.trim().length > 0;

  return (
    <div className="px-4 pt-10 pb-4 max-w-lg mx-auto w-full">
      <header className="mb-8">
        <BackButton href="/" />
        <h1 className="font-display mt-4 text-[22px] text-accent">NEW HABIT</h1>
      </header>

      <div className="flex flex-col gap-6">
        <TextInput
          label="Name"
          value={label}
          onChange={setLabel}
          placeholder="e.g. Running"
          maxLength={32}
        />

        <TextInput
          label="Emoji"
          value={emoji}
          onChange={setEmoji}
          maxLength={4}
          inputClassName="w-16 text-xl text-center"
        />

        {/* Color */}
        <div className="flex flex-col gap-2">
          <p className="font-body text-xs text-muted uppercase tracking-[2px]">
            Color
          </p>
          <div className="flex gap-2 flex-wrap">
            {HABIT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Color ${c}`}
                onClick={() => setColor(c)}
                className="w-8 h-8 flex-shrink-0 transition-transform"
                style={{
                  backgroundColor: c,
                  outline: color === c ? `3px solid ${c}` : "none",
                  outlineOffset: 2,
                  transform: color === c ? "scale(1.15)" : "scale(1)",
                }}
              />
            ))}
          </div>
        </div>

        <SegmentedToggle
          label="Direction"
          options={DIRECTION_OPTIONS}
          value={direction}
          color={color}
          onChange={setDirection}
        />

        <SegmentedToggle
          label="Logging"
          options={LOG_TYPE_OPTIONS}
          value={logType}
          color={color}
          onChange={setLogType}
        />

        <Button variant="primary" onClick={handleSubmit} disabled={!canSubmit}>
          CREATE HABIT
        </Button>
      </div>
    </div>
  );
}
