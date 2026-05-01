import { Redis } from "@upstash/redis";
import { Client } from "@upstash/qstash";

interface SubscribeBody {
  subscription: PushSubscriptionJSON;
  cron: string;
  deviceId: string;
}

interface StoredSub {
  subscription: PushSubscriptionJSON;
  scheduleId: string;
}

const redis = Redis.fromEnv();
const qstash = new Client({ token: process.env.QSTASH_TOKEN! });

function getOrigin(request: Request): string {
  // Vercel sets x-forwarded-proto and x-forwarded-host for the public URL
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    "";
  return `${proto}://${host}`;
}

export async function GET(request: Request): Promise<Response> {
  const deviceId = new URL(request.url).searchParams.get("deviceId");
  if (!deviceId) return Response.json({ active: false });
  const stored = await redis.get<StoredSub>(`push:sub:${deviceId}`);
  return Response.json({ active: !!stored?.scheduleId });
}

export async function POST(request: Request): Promise<Response> {
  const { subscription, cron, deviceId }: SubscribeBody = await request.json();

  const existing = await redis.get<StoredSub>(`push:sub:${deviceId}`);

  const destination = `${getOrigin(request)}/api/push/send`;

  // Create new schedule before deleting old — avoids a gap if create fails
  const { scheduleId } = await qstash.schedules.create({
    destination,
    cron,
    body: JSON.stringify({ deviceId }),
    headers: { "Content-Type": "application/json" },
  });

  await redis.set<StoredSub>(`push:sub:${deviceId}`, {
    subscription,
    scheduleId,
  });

  if (existing?.scheduleId) {
    await qstash.schedules.delete(existing.scheduleId).catch(() => null);
  }

  return Response.json({ ok: true });
}
