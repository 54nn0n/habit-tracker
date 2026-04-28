"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "muted";
type Size = "sm" | "md";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const BASE_CLASS = "font-body text-xs cursor-pointer disabled:opacity-40";

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "text-background bg-accent border-2 border-accent shadow-px-accent",
  secondary:
    "text-accent border-2 border-accent bg-transparent tracking-[0.5px] shadow-px-accent",
  muted: "text-muted border border-border bg-transparent",
};

const SIZE_CLASS: Record<Size, string> = {
  sm: "px-2.5 py-1",
  md: "px-3.5 py-2",
};

export default function Button({
  variant = "secondary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`${BASE_CLASS} ${VARIANT_CLASS[variant]} ${SIZE_CLASS[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
