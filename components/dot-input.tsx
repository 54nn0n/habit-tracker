'use client';

import { useCallback } from 'react';
import type { CSSProperties } from 'react';
import type { Severity } from '@/lib/habits';
import { SEVERITY_CYCLE } from '@/lib/habits';
import { hexToRgba } from '@/lib/date-utils';

const SEVERITY_ALPHAS: Record<Severity, number> = { 0: 0, 1: 0.35, 2: 0.65, 3: 1 };

function squareStyle(severity: Severity, color: string): CSSProperties {
  if (severity === 0) {
    return { border: `2px solid ${hexToRgba(color, 0.35)}` };
  }
  return {
    backgroundColor: hexToRgba(color, SEVERITY_ALPHAS[severity]),
    border: `2px solid ${color}`,
    boxShadow: severity === 3 ? `0 0 6px ${hexToRgba(color, 0.7)}` : undefined,
  };
}

interface DotInputProps {
  severity: Severity;
  color: string;
  dayLabel: string;
  dayNumber: number;
  isToday: boolean;
  onChange: (severity: Severity) => void;
}

export default function DotInput({
  severity,
  color,
  dayLabel,
  dayNumber,
  isToday,
  onChange,
}: DotInputProps) {
  const handleTap = useCallback(
    () => onChange(SEVERITY_CYCLE[severity]),
    [severity, onChange],
  );

  return (
    <button
      type="button"
      onClick={handleTap}
      aria-label={`${dayLabel} ${dayNumber}, severity ${severity} of 3`}
      className="flex flex-col items-center gap-1.5 min-w-[44px] min-h-[44px] py-1 flex-1"
    >
      <span className={`font-body text-[9px] ${isToday ? 'text-accent' : 'text-muted'}`}>
        {dayLabel}
      </span>
      <span className={`font-body text-[9px] leading-none ${isToday ? 'font-bold text-foreground' : 'text-muted'}`}>
        {dayNumber}
      </span>
      <span
        className="w-8 h-8 flex-shrink-0 transition-all duration-150"
        style={squareStyle(severity, color)}
      />
    </button>
  );
}
