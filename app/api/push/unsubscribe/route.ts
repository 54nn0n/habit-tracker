import { Redis } from "@upstash/redis";
import { Client } from "@upstash/qstash";

interface StoredSub {
  scheduleId: string;
}

const redis = Redis.fromEnv();
const qstash = new Client({ token: process.env.QSTASH_TOKEN! });

export async function POST(request: Request): Promise<Response> {
  const { deviceId }: { deviceId: string } = await request.json();

  const existing = await redis.get<StoredSub>(`push:sub:${deviceId}`);
  if (existing?.scheduleId) {
    await qstash.schedules.delete(existing.scheduleId).catch(() => null);
  }

  await redis.del(`push:sub:${deviceId}`);

  return Response.json({ ok: true });
}
