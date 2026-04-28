import type { Metadata, Viewport } from "next";
import { Press_Start_2P, Silkscreen, VT323 } from "next/font/google";
import { ReactNode } from "react";
import "./globals.css";
import dynamic from "next/dynamic";
import BottomNav from "@/components/bottom-nav";

const AppShell = dynamic(() => import("@/components/app-shell"));

const pressStart2P = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-syne",
});

const silkscreen = Silkscreen({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-dm-sans",
});

const vt323 = VT323({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-vt323",
});

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Habits",
  description: "Track your daily habits",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Habits",
  },
  icons: {
    icon: [{ url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" }],
    apple: "/icons/icon-180.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${pressStart2P.variable} ${silkscreen.variable} ${vt323.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-background font-body antialiased">
        <AppShell>
          <main className="flex-1 pb-20">{children}</main>
        </AppShell>
        <BottomNav />
      </body>
    </html>
  );
}
