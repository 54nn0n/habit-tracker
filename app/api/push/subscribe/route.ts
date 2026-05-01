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

export async function POST(request: Request): Promise<Response> {
  const { subscription, cron, deviceId }: SubscribeBody = await request.json();

  const existing = await redis.get<StoredSub>(`push:sub:${deviceId}`);

  const origin = new URL(request.url).origin;
  const destination = `${origin}/api/push/send`;

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
