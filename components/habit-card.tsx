"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Habit, Severity } from "@/lib/habits";
import type { HabitDayEntry } from "@/lib/date-utils";
import { hexToRgba } from "@/lib/date-utils";
import DotInput from "./dot-input";
import ConfirmModal from "./confirm-modal";

interface HabitCardProps {
  habit: Habit;
  days: HabitDayEntry[];
  onSeverityChange: (dateStr: string, severity: Severity | undefined) => void;
  onDelete?: (key: string) => void;
}

interface DayColumnProps {
  day: HabitDayEntry;
  color: string;
  logType: Habit["logType"];
  onSeverityChange: (dateStr: string, severity: Severity | undefined) => void;
}

function DayColumn({ day, color, logType, onSeverityChange }: DayColumnProps) {
  const handleChange = useCallback(
    (s: Severity | undefined) => onSeverityChange(day.dateStr, s),
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
const AFFORDANCE_GAP = 8;
const AFFORDANCE_WIDTH = SWIPE_THRESHOLD - AFFORDANCE_GAP;

export default function HabitCard({
  habit,
  days,
  onSeverityChange,
  onDelete,
}: HabitCardProps) {
  const router = useRouter();
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [deleteConfirming, setDeleteConfirming] = useState(false);
  const startX = useRef<number | null>(null);
  const startOffsetX = useRef(0);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      startX.current = e.clientX;
      startOffsetX.current = offsetX;
      setIsDragging(false);
    },
    [offsetX],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (startX.current === null) return;
      const dx = e.clientX - startX.current;
      if (Math.abs(dx) < 4) return;
      // Capture only once the gesture is confirmed as a swipe so that simple
      // taps still fire click events on child elements.
      if (!e.currentTarget.hasPointerCapture(e.pointerId)) {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      }
      const target = startOffsetX.current + dx;
      setIsDragging(true);
      if (target < 0 && onDelete) {
        setOffsetX(Math.max(target, -SWIPE_THRESHOLD - 20));
      } else if (target > 0) {
        setOffsetX(Math.min(target, SWIPE_THRESHOLD + 20));
      } else {
        setOffsetX(0);
      }
    },
    [onDelete],
  );

  const handlePointerUp = useCallback(() => {
    if (offsetX <= -SWIPE_THRESHOLD) {
      setOffsetX(-SWIPE_THRESHOLD);
    } else if (offsetX >= SWIPE_THRESHOLD) {
      setOffsetX(SWIPE_THRESHOLD);
    } else {
      setOffsetX(0);
    }
    setIsDragging(false);
    startX.current = null;
  }, [offsetX]);

  const handleEdit = useCallback(() => {
    router.push(`/habits/${habit.key}/edit`);
  }, [habit.key, router]);

  const handleDeletePress = useCallback(() => {
    setOffsetX(0);
    setDeleteConfirming(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    onDelete?.(habit.key);
  }, [habit.key, onDelete]);

  const handleCancelModal = useCallback(() => {
    setDeleteConfirming(false);
  }, []);

  return (
    <>
      <div className="relative overflow-hidden">
        {/* Edit affordance — right swipe */}
        <div className="absolute inset-y-0 left-0 flex items-center">
          <button
            type="button"
            onClick={handleEdit}
            className="h-full font-body text-xs text-background bg-accent"
            style={{ width: AFFORDANCE_WIDTH }}
          >
            EDIT
          </button>
        </div>

        {/* Delete affordance — left swipe */}
        {onDelete && (
          <div className="absolute inset-y-0 right-0 flex items-center">
            <button
              type="button"
              onClick={handleDeletePress}
              className="h-full font-body text-xs text-background bg-red"
              style={{ width: AFFORDANCE_WIDTH }}
            >
              DELETE
            </button>
          </div>
        )}

        {/* Card */}
        <div
          className="bg-surface relative"
          style={{
            border: `2px solid ${habit.color}`,
            boxShadow: `var(--px-shadow) ${hexToRgba(habit.color, 0.5)}`,
            transform: `translateX(${offsetX}px)`,
            transition: isDragging ? "none" : "transform 200ms ease",
            touchAction: "pan-y",
            userSelect: "none",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
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

      {deleteConfirming && onDelete && (
        <ConfirmModal
          title={`Delete ${habit.emoji} ${habit.label}?`}
          message="All logged data for this habit will be kept but the habit will be removed."
          confirmLabel="DELETE"
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelModal}
        />
      )}
    </>
  );
}
