'use client';

import { useCallback, useState } from 'react';
import type { Severity } from '@/lib/habits';
import { SEVERITY_CYCLE } from '@/lib/habits';

const DOTS = [1, 2, 3] as const;
const ARIA_LABEL = (s: Severity) => `Severity ${s} of 3, tap to change`;

interface DotInputProps {
  severity: Severity;
  color: string;
  onChange: (severity: Severity) => void;
}

export default function DotInput({ severity, color, onChange }: DotInputProps) {
  const [animating, setAnimating] = useState(false);

  const handleTap = useCallback(() => {
    onChange(SEVERITY_CYCLE[severity]);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 150);
  }, [severity, onChange]);

  return (
    <button
      type="button"
      onClick={handleTap}
      aria-label={ARIA_LABEL(severity)}
      className="flex items-center gap-2.5 min-w-[44px] min-h-[44px] px-2 py-1"
    >
      {DOTS.map((dot) => {
        const filled = dot <= severity;
        return (
          <span
            key={dot}
            className={`block w-5 h-5 rounded-full transition-all duration-150 ${
              filled && animating ? 'dot-pop' : ''
            }`}
            style={
              filled
                ? { backgroundColor: color, transform: 'scale(1.1)' }
                : { border: `2px solid ${color}`, opacity: 0.4 }
            }
          />
        );
      })}
    </button>
  );
}
