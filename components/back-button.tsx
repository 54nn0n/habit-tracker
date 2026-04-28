"use client";

import Link from "next/link";

interface BackButtonProps {
  href: string;
}

export default function BackButton({ href }: BackButtonProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 font-body text-xs text-accent mb-3"
      aria-label="Back"
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="7 2 3 6 7 10" />
      </svg>
      BACK
    </Link>
  );
}
