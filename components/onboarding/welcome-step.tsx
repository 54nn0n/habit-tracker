"use client";
import Button from "@/components/button";
interface WelcomeStepProps {
  onNext: () => void;
}
export default function WelcomeStep({ onNext }: WelcomeStepProps) {
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
          Log daily habits. See patterns over time. Build streaks or cut back.
          You decide.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <span className="font-display text-[10px] text-accent w-4 flex-shrink-0">
            01
          </span>
          <p className="font-body text-xs text-foreground">
            Pick habits to track
          </p>
        </div>
        <div className="flex items-start gap-3">
          <span className="font-display text-[10px] text-accent w-4 flex-shrink-0">
            02
          </span>
          <p className="font-body text-xs text-foreground">
            Log them daily with one tap
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
