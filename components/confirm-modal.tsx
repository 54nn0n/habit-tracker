import { useCallback } from "react";
import type { MouseEvent } from "react";
import Button from "@/components/button";

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const handleBackdropClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onCancel();
    },
    [onCancel],
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/70"
      onClick={handleBackdropClick}
    >
      <div
        className="w-full p-6 pb-10 max-w-lg mx-auto bg-surface border-t-2 border-t-red"
        style={{ boxShadow: "0 -4px 0 var(--color-red)" }}
      >
        <h2 className="font-display text-xs text-foreground mb-2">{title}</h2>
        <p className="font-body text-xs text-muted mb-6">{message}</p>
        <div className="flex gap-3">
          <Button
            variant="muted"
            onClick={onCancel}
            className="flex-1 text-center"
          >
            CANCEL
          </Button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 font-body text-xs text-background bg-red border-2 border-red px-3.5 py-2"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
