"use client";

import { lazy, Suspense } from "react";

const SettingsContent = lazy(() => import("./content"));

export default function SettingsPage() {
  return (
    <Suspense>
      <SettingsContent />
    </Suspense>
  );
}
