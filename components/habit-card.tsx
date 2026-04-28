"use client";

import { useCallback, useRef, useState } from "react";
import type { Habit, Severity } from "@/lib/habits";
import type { HabitDayEntry } from "@/lib/date-utils";
import { hexToRgba } from "@/lib/date-utils";
import DotInput from "./dot-input";

interface HabitCardProps {
  habit: Habit;
  days: HabitDayEntry[];
  onSeverityChange: (dateStr: string, severity: Severity) => void;
  onDelete?: (key: string) => void;
}

interface DayColumnProps {
  day: HabitDayEntry;
  color: string;
  logType: Habit["logType"];
  onSeverityChange: (dateStr: string, severity: Severity) => void;
}

function DayColumn({ day, color, logType, onSeverityChange }: DayColumnProps) {
  const handleChange = useCallback(
    (s: Severity) => onSeverityChange(day.dateStr, s),
    [day.dateStr, onSeverityChange],
  );
  return (
    <DotInput
      severity={day.severity}
      color={color}
      logType={logType}
      dayLabel={day.dayLabel}
      dayNumber={day.dayNumber}
      isToday={day.isToday}
      onChange={handleChange}
    />
  );
}

const SWIPE_THRESHOLD = 80;

export default function HabitCard({
  habit,
  days,
  onSeverityChange,
  onDelete,
}: HabitCardProps) {
  const [offsetX, setOffsetX] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const startX = useRef<number | null>(null);
  const isDragging = useRef(false);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    startX.current = e.clientX;
    isDragging.current = false;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (startX.current === null) return;
    const dx = e.clientX - startX.current;
    if (dx < 0) {
      isDragging.current = true;
      setOffsetX(Math.max(dx, -SWIPE_THRESHOLD - 20));
    }
  }, []);

  const handlePointerUp = useCallback(() => {
    if (offsetX <= -SWIPE_THRESHOLD) {
      setConfirming(true);
      setOffsetX(-SWIPE_THRESHOLD);
    } else {
      setOffsetX(0);
    }
    startX.current = null;
  }, [offsetX]);

  const handleCancel = useCallback(() => {
    setConfirming(false);
    setOffsetX(0);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    onDelete?.(habit.key);
  }, [habit.key, onDelete]);

  return (
    <div className="relative overflow-hidden">
      {/* Delete affordance revealed by swipe */}
      {onDelete && (
        <div className="absolute inset-y-0 right-0 flex items-center">
          {confirming ? (
            <div className="flex h-full">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 h-full font-body text-xs text-muted bg-surface border border-border"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 h-full font-body text-xs text-background bg-red"
              >
                DELETE
              </button>
            </div>
          ) : (
            <div
              className="px-5 h-full flex items-center font-body text-xs text-background bg-red"
              style={{ width: SWIPE_THRESHOLD }}
            >
              DELETE
            </div>
          )}
        </div>
      )}

      {/* Card */}
      <div
        className="bg-surface relative"
        style={{
          border: `2px solid ${habit.color}`,
          boxShadow: `var(--px-shadow) ${hexToRgba(habit.color, 0.5)}`,
          transform: `translateX(${offsetX}px)`,
          transition: isDragging.current ? "none" : "transform 200ms ease",
          touchAction: "pan-y",
          userSelect: "none",
        }}
        onPointerDown={onDelete ? handlePointerDown : undefined}
        onPointerMove={onDelete ? handlePointerMove : undefined}
        onPointerUp={onDelete ? handlePointerUp : undefined}
      >
        <div className="px-5 pt-4 pb-1 flex items-center gap-2">
          <span
            className="text-xl leading-none"
            role="img"
            aria-label={habit.label}
          >
            {habit.emoji}
          </span>
          <span
            className="font-display text-xs font-bold"
            style={{ color: habit.color }}
          >
            {habit.label}
          </span>
          <span className="font-body text-[9px] text-muted ml-auto">
            {habit.direction === "reducing" ? "REDUCING" : "BUILDING"}
          </span>
        </div>

        <div className="flex px-2 pb-3">
          {days.map((day) => (
            <DayColumn
              key={day.dateStr}
              day={day}
              color={habit.color}
              logType={habit.logType}
              onSeverityChange={onSeverityChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
