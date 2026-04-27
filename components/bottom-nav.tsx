"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Today",
    icon: (active: boolean) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: "/history",
    label: "Year",
    icon: (active: boolean) => (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke={active ? "none" : "currentColor"}
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <rect x="2" y="2" width="9" height="9" rx="0" />
        <rect x="13" y="2" width="9" height="9" rx="0" />
        <rect x="2" y="13" width="9" height="9" rx="0" />
        <rect x="13" y="13" width="9" height="9" rx="0" />
      </svg>
    ),
  },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t-2 border-t-accent"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex max-w-lg mx-auto">
        {NAV_ITEMS.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${active ? "text-accent" : "text-muted"}`}
              aria-current={active ? "page" : undefined}
            >
              {icon(active)}
              <span className="font-body text-[8px]">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
