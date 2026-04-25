import type { Metadata, Viewport } from 'next';
import { Syne, DM_Sans } from 'next/font/google';
import { ReactNode } from 'react';
import './globals.css';
import dynamic from 'next/dynamic';
import BottomNav from '@/components/bottom-nav';

const AppShell = dynamic(() => import('@/components/app-shell'));

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
});

export const viewport: Viewport = {
  themeColor: '#FFFBF5',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Habit Tracker',
  description: 'Track your daily consumption habits',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Habit Tracker',
  },
  icons: {
    apple: '/icons/icon-180.png',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-background font-body antialiased">
        <AppShell>
          <main className="flex-1 pb-20">{children}</main>
        </AppShell>
        <BottomNav />
      </body>
    </html>
  );
}
