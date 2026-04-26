const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? '';
const SCOPE = 'https://www.googleapis.com/auth/drive.file';
const VERIFIER_KEY = 'gd_pkce_verifier';

const KEYS = {
  accessToken: 'gd_access_token',
  refreshToken: 'gd_refresh_token',
  expiry: 'gd_token_expiry',
  email: 'gd_email',
} as const;

function redirectUri(): string {
  return `${window.location.origin}/auth/callback`;
}

function base64url(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function generatePKCE(): Promise<{ verifier: string; challenge: string }> {
  const verifier = base64url(crypto.getRandomValues(new Uint8Array(96)).buffer as ArrayBuffer);
  const challenge = base64url(
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)),
  );
  return { verifier, challenge };
}

export async function startGoogleAuth(): Promise<void> {
  const { verifier, challenge } = await generatePKCE();
  sessionStorage.setItem(VERIFIER_KEY, verifier);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: redirectUri(),
    response_type: 'code',
    scope: SCOPE,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    access_type: 'offline',
    prompt: 'consent',
  });

  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeCode(code: string): Promise<void> {
  const verifier = sessionStorage.getItem(VERIFIER_KEY);
  if (!verifier) throw new Error('PKCE verifier missing');

  const res = await fetch('/api/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      redirect_uri: redirectUri(),
      grant_type: 'authorization_code',
      code_verifier: verifier,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error('Token exchange failed', res.status, body);
    throw new Error(`Token exchange failed: ${res.status}`);
  }
  const data = await res.json();
  storeTokens(data);
  sessionStorage.removeItem(VERIFIER_KEY);

  const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${data.access_token}` },
  });
  if (userRes.ok) {
    const user = await userRes.json();
    localStorage.setItem(KEYS.email, user.email as string);
  }
}

function storeTokens(data: {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}): void {
  localStorage.setItem(KEYS.accessToken, data.access_token);
  if (data.refresh_token) localStorage.setItem(KEYS.refreshToken, data.refresh_token);
  localStorage.setItem(KEYS.expiry, String(Date.now() + data.expires_in * 1000));
}

export async function getValidToken(): Promise<string | null> {
  const token = localStorage.getItem(KEYS.accessToken);
  if (!token) return null;
  const expiry = Number(localStorage.getItem(KEYS.expiry) ?? 0);
  if (Date.now() < expiry - 60_000) return token;
  return refreshToken();
}

async function refreshToken(): Promise<string | null> {
  const refresh = localStorage.getItem(KEYS.refreshToken);
  if (!refresh) { disconnect(); return null; }

  const res = await fetch('/api/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      refresh_token: refresh,
    }),
  });

  if (!res.ok) { disconnect(); return null; }
  const data = await res.json();
  storeTokens(data);
  return data.access_token as string;
}

export function isConnected(): boolean {
  return !!localStorage.getItem(KEYS.accessToken);
}

export function getEmail(): string | null {
  return localStorage.getItem(KEYS.email);
}

export function disconnect(): void {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  localStorage.removeItem('gd_file_id');
}
