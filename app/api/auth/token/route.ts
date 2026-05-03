import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Record<string, string>;

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    console.error("CRITICAL: Missing Google Auth environment variables:", {
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
    });
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId ?? "",
      client_secret: clientSecret ?? "",
      ...body,
    }),
  });

  const data = (await res.json()) as any;

  if (!res.ok) {
    console.error("Google Token API Error (401 Debug):", {
      status: res.status,
      statusText: res.statusText,
      googleError: data.error,
      googleErrorDescription: data.error_description,
      grantType: body.grant_type,
      // Precise verification helpers
      clientIdHint: clientId ? `${clientId.slice(0, 5)}...${clientId.slice(-5)}` : "none",
      clientSecretSuffix: clientSecret ? `...${clientSecret.slice(-4)}` : "none",
      clientIdLength: clientId?.length,
      clientSecretLength: clientSecret?.length,
    });
  }

  return NextResponse.json(data, { status: res.status });
}
