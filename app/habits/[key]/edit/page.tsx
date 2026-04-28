"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getHabits, updateHabit, HABIT_COLORS } from "@/lib/habits";
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

export default function EditHabitPage() {
  const router = useRouter();
  const params = useParams();
  const key = params.key as string;

  type FormState = {
    label: string;
    emoji: string;
    color: string;
    direction: HabitDirection;
    logType: HabitLogType;
  };

  const [form, setForm] = useState<FormState | null>(() => {
    if (typeof window === "undefined") return null;
    const habit = getHabits().find((h) => h.key === key);
    if (!habit) return null;
    return {
      label: habit.label,
      emoji: habit.emoji,
      color: habit.color,
      direction: habit.direction,
      logType: habit.logType,
    };
  });

  useEffect(() => {
    if (form === null) router.replace("/");
  }, [form, router]);

  const handleSave = useCallback(() => {
    if (!form) return;
    const trimmed = form.label.trim();
    if (!trimmed) return;
    updateHabit(key, {
      label: trimmed,
      emoji: form.emoji,
      color: form.color,
      direction: form.direction,
      logType: form.logType,
    });
    router.push("/");
  }, [key, form, router]);

  if (!form) return null;

  const { label, emoji, color, direction, logType } = form;
  const setLabel = (label: string) => setForm((f) => f && { ...f, label });
  const setEmoji = (emoji: string) => setForm((f) => f && { ...f, emoji });
  const setColor = (color: string) => setForm((f) => f && { ...f, color });
  const setDirection = (direction: HabitDirection) =>
    setForm((f) => f && { ...f, direction });
  const setLogType = (logType: HabitLogType) =>
    setForm((f) => f && { ...f, logType });

  return (
    <div className="px-4 pt-10 pb-4 max-w-lg mx-auto w-full">
      <header className="mb-8">
        <BackButton href="/" />
        <h1 className="font-display mt-4 text-[22px] text-accent">
          EDIT HABIT
        </h1>
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

        <Button variant="primary" onClick={handleSave} disabled={!label.trim()}>
          SAVE CHANGES
        </Button>
      </div>
    </div>
  );
}
