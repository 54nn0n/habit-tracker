'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { exchangeCode } from '@/lib/google-auth';

function CallbackHandler() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      router.replace('/settings?error=access_denied');
      return;
    }
    if (!code) {
      router.replace('/settings?error=no_code');
      return;
    }

    exchangeCode(code)
      .then(() => import('@/lib/sync').then(({ loadFromDrive }) => loadFromDrive()))
      .then(() => router.replace('/settings'))
      .catch(() => router.replace('/settings?error=auth_failed'));
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <p className="text-muted text-sm">Connecting to Google Drive…</p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense>
      <CallbackHandler />
    </Suspense>
  );
}
