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
  if (existing?.scheduleId) {
    await qstash.schedules.delete(existing.scheduleId).catch(() => null);
  }

  const host = request.headers.get("host")!;
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const destination = `${protocol}://${host}/api/push/send`;

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

  return Response.json({ ok: true });
}
